import { Client } from "@notionhq/client";
import type { GetBlockResponse } from "@notionhq/client/build/src/api-endpoints";
import type { Node, Root } from "mdast";
import builder from "mdast-builder"

const notionClient = new Client({
    auth: process.env.NOTION_API_KEY,
});

export async function translatePage(pageId: string): Promise<Root> {
    const children = await translateChildren(pageId)

    // @ts-ignore
    return builder.root(children)
}

async function translateChildren(blockId: string): Promise<Node[]> {
    const children = await getChildren(blockId);

    return await Promise.all(children.map(async (blockResponse) => {
        const blockNode = await translateBlock(blockResponse)
        return blockNode
    }));
}

async function getChildren(blockId: string): Promise<GetBlockResponse[]> {
    let children = [];

    let has_more
    let next_cursor = undefined
    do {
        const response = await notionClient.blocks.children.list({
            block_id: blockId,
            start_cursor: next_cursor,
        });

        children.push(...response.results);

        has_more = response.has_more
        next_cursor = response.next_cursor || undefined
    } while (has_more)

    return children
}

async function translateBlock(blockResponse: GetBlockResponse): Promise<Node> {
    return builder.paragraph()
}
