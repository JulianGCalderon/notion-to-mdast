import { Client, isFullBlock, iteratePaginatedAPI } from "@notionhq/client";
import builder from "mdast-builder"
import { u as unistBuilder } from 'unist-builder'
import type {
    EquationRichTextItemResponse,
    GetBlockResponse,
    ParagraphBlockObjectResponse,
    RichTextItemResponse,
    TextRichTextItemResponse
} from "@notionhq/client/build/src/api-endpoints";
import { getTitle } from "./metadata";

const notionClient = new Client({
    auth: process.env.NOTION_API_KEY,
});

export async function translatePage(pageId: string) {
    const pageResponse = await notionClient.pages.retrieve({
        page_id: pageId
    })
    const children = await translateChildren(pageId)

    const title = getTitle(pageResponse)
    if (title) {
        return builder.rootWithTitle(1, title, children)
    } else {
        return builder.root(children)
    }
}

async function translateChildren(blockId: string) {
    const children = iteratePaginatedAPI(
        notionClient.blocks.children.list,
        { block_id: blockId }
    )

    const promises = []
    for await (const blockResponse of children) {
        promises.push(translateBlock(blockResponse))
    }

    return await Promise.all(promises)
}

async function translateBlock(blockResponse: GetBlockResponse) {
    if (!isFullBlock(blockResponse)) {
        return errorNode("No Full Block Response")
    }

    switch (blockResponse.type) {
        case "paragraph":
            return translateParagraph(blockResponse)
        default:
            return errorNode(`Unknown Type: ${blockResponse.type}`)
    }

}

function errorNode(msg: string) {
    return builder.paragraph(builder.text("ERROR: " + msg))
}

function translateParagraph(paragraphResponse: ParagraphBlockObjectResponse) {
    const phrasingContent = paragraphResponse.paragraph.rich_text.map(translateRichText)

    return builder.paragraph(phrasingContent)
}

export function translateRichText(richTextResponse: RichTextItemResponse) {
    switch (richTextResponse.type) {
        case "text":
            return translateTextRichText(richTextResponse)
        case "equation":
            return translateEquationRichText(richTextResponse)
        case "mention":
            return translateAnyRichText(richTextResponse)
    }
}

function translateTextRichText(textRichTextResponse: TextRichTextItemResponse) {

    let text = translateAnyRichText(textRichTextResponse)

    let link = textRichTextResponse.text.link
    if (!link) {
        return text
    }

    return builder.link(link.url, undefined, text)
}

function translateEquationRichText(equationRichTextResponse: EquationRichTextItemResponse) {
    return unistBuilder("inlineMath", {}, equationRichTextResponse.equation.expression)
}

function translateAnyRichText(AnyRichTextResponse: RichTextItemResponse) {
    if (AnyRichTextResponse.annotations.code) {
        return builder.inlineCode(AnyRichTextResponse.plain_text)
    }

    let text = builder.text(AnyRichTextResponse.plain_text)
    if (AnyRichTextResponse.annotations.bold) {
        text = builder.strong(text)
    }
    if (AnyRichTextResponse.annotations.italic) {
        text = builder.emphasis(text)
    }

    return text
}
