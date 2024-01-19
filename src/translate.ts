import { Client, isFullBlock, iteratePaginatedAPI } from "@notionhq/client";
import builder from "mdast-builder"
import { u as unistBuilder } from 'unist-builder'
import type {
    EquationRichTextItemResponse,
    GetBlockResponse,
    Heading1BlockObjectResponse,
    Heading2BlockObjectResponse,
    Heading3BlockObjectResponse,
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
    const childrenResponses = iteratePaginatedAPI(
        notionClient.blocks.children.list,
        { block_id: blockId }
    )

    const promises = []
    for await (const blockResponse of childrenResponses) {
        promises.push(translateBlock(blockResponse))
    }

    // If i use `filter` method, typescript does not detect the impossibility
    // of an undefined.
    const childrenNodes = []
    for (const childrenNode of await Promise.all(promises)) {
        if (childrenNode) {
            childrenNodes.push(childrenNode)
        }
    }

    return childrenNodes
}

async function translateBlock(blockResponse: GetBlockResponse) {
    if (!isFullBlock(blockResponse)) {
        console.error("No Full Block Response")
        return
    }

    switch (blockResponse.type) {
        case "paragraph":
            return translateParagraph(blockResponse)
        // I was not able to merge the following three cases in typescript
        case "heading_1":
            return translateHeading1(blockResponse)
        case "heading_2":
            return translateHeading2(blockResponse)
        case "heading_3":
            return translateHeading3(blockResponse)
        default:
            console.error(`Unknown Type: ${blockResponse.type}`)
    }

}

function translateParagraph(paragraphResponse: ParagraphBlockObjectResponse) {
    const phrasingContent = paragraphResponse
        .paragraph
        .rich_text
        .map(translateRichText)

    return builder.paragraph(phrasingContent)
}

function translateHeading1(headingResponse: Heading1BlockObjectResponse) {
    const phrasingContent = headingResponse
        .heading_1
        .rich_text
        .map(translateRichText)

    // The heading depth is increased, so that the title of the page can have a
    // depth of 1, while the contained headings have a higher depth.
    return builder.heading(2, phrasingContent)
}

function translateHeading2(headingResponse: Heading2BlockObjectResponse) {
    const phrasingContent = headingResponse
        .heading_2
        .rich_text
        .map(translateRichText)

    return builder.heading(3, phrasingContent)
}

function translateHeading3(headingResponse: Heading3BlockObjectResponse) {
    const phrasingContent = headingResponse
        .heading_3
        .rich_text
        .map(translateRichText)

    return builder.heading(4, phrasingContent)
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
