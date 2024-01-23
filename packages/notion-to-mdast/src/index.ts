import { iteratePaginatedAPI, type Client, isFullBlock, isFullPage } from "@notionhq/client"
import type { BlockObjectResponse, GetPageResponse, RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"
import type { Node, Parent, Root, RootContent } from "mdast"
import * as blockHandlers from "./block-handlers.ts"
import * as richTextHandlers from "./rich-text-handlers.ts"
import * as builder from "mdast-builder"

export type Children = Node | Node[]

export type Options = {
    blockHandlers?: Partial<BlockHandlers>
    richTextHandlers?: Partial<RichTextItemHandlers>
}

export type BlockHandlers = Record<BlockObjectResponse['type'], BlockHandler>
export type RichTextItemHandlers = Record<RichTextItemResponse['type'], RichTextItemHandler>
export type BlockHandler = (response: BlockObjectResponse) => Promise<Node | Node[]>
export type RichTextItemHandler = (response: RichTextItemResponse) => Promise<Node | Node[]>

export class PageTranslator {
    client: Client
    blockHandlers: Partial<BlockHandlers>
    richTextHandlers: Partial<RichTextItemHandlers>

    constructor(client: Client, options?: Options) {
        this.client = client
        this.blockHandlers = { ...blockHandlers, ...options?.blockHandlers }
        this.richTextHandlers = { ...richTextHandlers, ...options?.richTextHandlers }
    }

    async translatePage(pageId: string): Promise<Root> {
        // const pageResponse = await this.client.pages.retrieve({
        //     page_id: pageId
        // })
        // const title = toString(await this.getTitle(pageResponse))

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
        const handler = this.blockHandlers[response.type]
        if (!handler) {
            console.error("No handler for:", response.type)
            return []
        }

        return await handler.call(this, response)
    }


    async translateRichTextItem(response: RichTextItemResponse): Promise<Children> {
        const handler = this.richTextHandlers[response.type]
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

    async getTitle(pageResponse: GetPageResponse) {
        if (!isFullPage(pageResponse)) {
            return
        }
        const properties = pageResponse.properties

        if (!("title" in properties)) {
            return;
        }
        const title = properties.title;

        if (title.type != "title") {
            return;
        }

        return this.translateRichText(title.title)
    }
}
