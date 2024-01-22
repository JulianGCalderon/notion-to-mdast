import { iteratePaginatedAPI, type Client, isFullBlock } from "@notionhq/client"
import type { BlockObjectResponse, RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"
import type { Node, Root } from "mdast"
import * as blockHandlers from "./block-handlers.ts"
import * as richTextHandlers from "./rich-text-handlers.ts"
import * as builder from "mdast-builder"

export class PageTranslator {
    client: Client
    blockHandlers: Partial<BlockHandlers>
    richTextHandlers: Partial<RichTextHandlers>

    constructor(client: Client, customBlockHandlers?: Partial<Handlers>, customRichTextHandlers?: Partial<Handlers>) {
        this.client = client
        this.blockHandlers = { ...blockHandlers, ...customBlockHandlers }
        this.richTextHandlers = { ...richTextHandlers, ...customRichTextHandlers }
    }

    async translatePage(pageId: string): Promise<Root> {
        const pageResponse = await this.client.pages.retrieve({
            page_id: pageId
        })

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
            promises.push(this.translateBlocks(blockResponse))
        }

        return (await Promise.all(promises)).flat()
    }

    async translateBlock(response: BlockObjectResponse): Promise<Node[]> {
        const handler = this.blockHandlers[response.type]
        if (!handler)
            return []

        const children = [await handler(response)]
        return children.flat()
    }


    async translateRichText(response: RichTextItemResponse): Promise<Node[]> {
        const handler = this.richTextHandlers[response.type]
        if (!handler)
            return []

        const children = [await handler(response)]
        return children.flat()
    }

    async translateBlocks(response: BlockObjectResponse | BlockObjectResponse[]): Promise<Node[]> {
        if (!Array.isArray(response)) {
            response = [response]
        }

        const children = await Promise.all(response.map(this.translateBlock))
        return children.flat()
    }

    async translateRichTexts(response: RichTextItemResponse | RichTextItemResponse[]): Promise<Node[]> {
        if (!Array.isArray(response)) {
            response = [response]
        }

        const children = await Promise.all(response.map(this.translateRichText))
        return children.flat()
    }
}

export type Children = Node | Node[]
export type BlockHandlers = Record<BlockObjectResponse['type'], BlockHandler>
export type RichTextHandlers = Record<RichTextItemResponse['type'], RichTextHandler>
export type BlockHandler = (response: BlockObjectResponse) => Promise<Node | Node[]>
export type RichTextHandler = (response: RichTextItemResponse) => Promise<Node | Node[]>
