import { Client } from "@notionhq/client";
import builder from "mdast-builder"
import type {
    GetBlockResponse,
    ParagraphBlockObjectResponse,
    RichTextItemResponse
} from "@notionhq/client/build/src/api-endpoints";

const notionClient = new Client({
    auth: process.env.NOTION_API_KEY,
});

export async function translatePage(pageId: string) {
    const children = await translateChildren(pageId)

    return builder.root(children)
}

async function translateChildren(blockId: string) {
    const children = await getChildren(blockId);

    return await Promise.all(children.map(async (blockResponse) => {
        return await translateBlock(blockResponse)
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

async function translateBlock(blockResponse: GetBlockResponse) {
    if (!("type" in blockResponse)) {
        return errorNode("No type")
    }

    switch (blockResponse.type) {
        case "paragraph":
            return translateParagraph(blockResponse)
        default:
            return errorNode(`Unknown Type: ${blockResponse.type}`)
    }

}

function errorNode(msg: string) {
    return builder.paragraph([
        builder.strong(
            builder.text("ERROR:")
        ),
        builder.text(" " + msg)
    ]
    )
}

function translateParagraph(paragraphResponse: ParagraphBlockObjectResponse) {
    const phrasingContent = paragraphResponse.paragraph.rich_text.map(translateRichText)

    return builder.paragraph(phrasingContent)
}

function translateRichText(richTextResponse: RichTextItemResponse) {
    return builder.text(richTextResponse.plain_text)
}
