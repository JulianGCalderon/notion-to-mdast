import { Client, isFullBlock, iteratePaginatedAPI } from "@notionhq/client";
import builder, { text } from "mdast-builder"
import { u as unistBuilder } from 'unist-builder'
import type {
    CodeBlockObjectResponse,
    EquationBlockObjectResponse,
    EquationRichTextItemResponse,
    GetBlockResponse,
    Heading1BlockObjectResponse,
    Heading2BlockObjectResponse,
    Heading3BlockObjectResponse,
    ParagraphBlockObjectResponse,
    QuoteBlockObjectResponse,
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

    // If I use `filter` method, typescript does not detect the impossibility
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
        case "code":
            return translateCode(blockResponse)
        case "equation":
            return translateEquation(blockResponse)
        // I was not able to merge the following three cases in typescript
        case "heading_1":
            return translateHeading1(blockResponse)
        case "heading_2":
            return translateHeading2(blockResponse)
        case "heading_3":
            return translateHeading3(blockResponse)
        case "paragraph":
            return translateParagraph(blockResponse)
        case "quote":
            return translateQuote(blockResponse)
        default:
            console.error(`Unknown Type: ${blockResponse.type}`)
    }

}

function translateCode(codeResponse: CodeBlockObjectResponse) {
    console.error(codeResponse.code.rich_text)

    const language = codeResponse.code.language
    const text = textFromRichTextArray(codeResponse.code.rich_text)

    return builder.code(language, text)
}

function translateEquation(blockResponse: EquationBlockObjectResponse) {
    return unistBuilder("math", blockResponse.equation.expression)
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

function translateParagraph(paragraphResponse: ParagraphBlockObjectResponse) {
    const phrasingContent = paragraphResponse
        .paragraph
        .rich_text
        .map(translateRichText)

    return builder.paragraph(phrasingContent)
}

async function translateQuote(quoteResponse: QuoteBlockObjectResponse) {
    const phrasingContent = quoteResponse
        .quote
        .rich_text
        .map(translateRichText)

    return builder.blockquote(phrasingContent)
}

// RICH TEXT SUPPORT

function textFromRichTextArray(richTextResponseArray: RichTextItemResponse[]) {
    return richTextResponseArray.map((richTextResponse) => richTextResponse.plain_text).join("")
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

function translateAnyRichText(anyRichTextResponse: RichTextItemResponse) {
    if (anyRichTextResponse.annotations.code) {
        return builder.inlineCode(anyRichTextResponse.plain_text)
    }

    let text = builder.text(anyRichTextResponse.plain_text)
    if (anyRichTextResponse.annotations.bold) {
        text = builder.strong(text)
    }
    if (anyRichTextResponse.annotations.italic) {
        text = builder.emphasis(text)
    }

    return text
}


