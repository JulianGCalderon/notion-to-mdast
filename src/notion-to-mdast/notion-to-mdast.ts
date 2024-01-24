import { iteratePaginatedAPI, type Client, isFullBlock } from "@notionhq/client"
import type { BlockObjectResponse, RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"
import type { Node, Parent, Root, RootContent } from "mdast"
import * as builder from "mdast-builder"

require("./mdast-data.ts")

import * as _blockHandlers from "./block-handlers.ts"
import * as _richTextHandlers from "./rich-text-handlers.ts"
const blockHandlers: Partial<BlockHandlers> = _blockHandlers
const richTextHandlers: Partial<RichTextItemHandlers> = _richTextHandlers

export type Children = Node | Node[]

export type BlockHandlers = Record<BlockObjectResponse['type'], BlockHandler>
export type RichTextItemHandlers = Record<RichTextItemResponse['type'], RichTextItemHandler>
export type BlockHandler = (response: BlockObjectResponse) => Promise<Node | Node[]>
export type RichTextItemHandler = (response: RichTextItemResponse) => Promise<Node | Node[]>

export class NotionToMdast {
    client: Client

    constructor(client: Client) {
        this.client = client
    }

    async translatePage(pageId: string): Promise<Root> {
        const children = await this.translateChildren(pageId)
        return builder.root(children)
    }

    async translateChildren(blockId: string): Promise<Node[]> {
        const childrenResponses = iteratePaginatedAPI(
            this.client.blocks.children.list,
            { block_id: blockId }
        )

        const promises = []
        for await (const blockResponse of childrenResponses) {
            if (!isFullBlock(blockResponse)) {
                continue
            }
            promises.push(this.translateBlock(blockResponse))
        }

        return (await Promise.all(promises)).flat()
    }

    async translateBlock(response: BlockObjectResponse): Promise<Children> {
        const handler = blockHandlers[response.type]
        if (!handler) {
            console.error("No handler for:", response.type)
            return []
        }

        return await handler.call(this, response)
    }


    async translateRichTextItem(response: RichTextItemResponse): Promise<Children> {
        const handler = richTextHandlers[response.type]
        if (!handler) {
            return []
        }

        return await handler.call(this, response)
    }

    async translateBlocks(response: BlockObjectResponse[]): Promise<Children> {
        if (!Array.isArray(response)) {
            return await this.translateBlock(response)
        }

        return await Promise.all(response.map(this.translateBlock.bind(this)))
            .then((children) => children.flat())
    }

    async translateRichText(response: RichTextItemResponse[]): Promise<Children> {
        if (!Array.isArray(response)) {
            return await this.translateRichTextItem(response)
        }

        return await Promise.all(response.map(this.translateRichTextItem.bind(this)))
            .then((children) => children.flat())
    }

    async addChildren(response: BlockObjectResponse, node: Parent) {
        //@ts-ignore
        const children: RootContent[] = await this.translateChildren(response.id)
        node.children.push(...children)
    }

    async addRichText(response: BlockObjectResponse, node: Parent) {
        //@ts-ignore
        const richText = response[response.type].rich_text
        const paragraph = builder.paragraph(await this.translateRichText(richText))
        node.children.push(paragraph)
    }
}
