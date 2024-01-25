import { type Client, iteratePaginatedAPI, isFullBlock } from "@notionhq/client"
import type { BlockObjectResponse, PartialBlockObjectResponse, RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"

import type { Node } from "mdast"
import { u } from "unist-builder"

import { unified } from "unified"
import remarkListMerge from "./transformer/list-merge"

import * as blockHandles from "./handle/block"
import * as richTextHandles from "./handle/richtext"
import type { BlockHandles, Options, RichTextHandles } from "./types"

export class ToMdast {
    client: Client
    blockHandles: Partial<BlockHandles>
    richTextHandles: RichTextHandles

    constructor(client: Client, options?: Options) {
        this.client = client
        this.blockHandles = { ...blockHandles, ...options?.blockHandles }
        this.richTextHandles = { ...richTextHandles, ...options?.richTextHandles }
    }

    async translatePage(pageId: string): Promise<Node> {
        const children = await this.translateChildren(pageId)
        const root = u("root", children)

        return await unified()
            .use(remarkListMerge)
            .run(root)
    }

    async translateChildren(blockId: string): Promise<Node[]> {
        const childrenResponses = iteratePaginatedAPI(
            this.client.blocks.children.list,
            { block_id: blockId }
        )

        const promises = []
        for await (const response of childrenResponses) {
            promises.push(this.translateBlock(response))
        }

        return (await Promise.all(promises)).flat()
    }

    async translateBlock(response: BlockObjectResponse | PartialBlockObjectResponse): Promise<Node | Node[]> {
        if (!isFullBlock(response)) {
            console.error("Received partial response", response.id)
            return []
        }

        const handler = this.blockHandles[response.type]
        if (!handler) {
            console.error("No handler for:", response.type)
            return []
        }

        return await handler.call(this, response)
    }

    async translateRichText(responses: RichTextItemResponse[]): Promise<Node[]> {
        const promises = responses.map((response) => {
            const handler = this.richTextHandles[response.type]
            return handler.call(this, response)
        })

        return await Promise.all(promises)
    }
}
