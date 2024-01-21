import { Client, isFullBlock, iteratePaginatedAPI } from "@notionhq/client";
import * as builder from "mdast-builder"
import type {
    BlockObjectResponse,
    BookmarkBlockObjectResponse,
    CalloutBlockObjectResponse,
    CodeBlockObjectResponse,
    EmbedBlockObjectResponse,
    EquationBlockObjectResponse,
    EquationRichTextItemResponse,
    FileBlockObjectResponse,
    GetBlockResponse,
    Heading1BlockObjectResponse,
    Heading2BlockObjectResponse,
    Heading3BlockObjectResponse,
    ImageBlockObjectResponse,
    LinkPreviewBlockObjectResponse,
    ParagraphBlockObjectResponse,
    PdfBlockObjectResponse,
    QuoteBlockObjectResponse,
    RichTextItemResponse,
    TableBlockObjectResponse,
    TableRowBlockObjectResponse,
    TextRichTextItemResponse,
    ToggleBlockObjectResponse,
    VideoBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { getTitle } from "./metadata";
import type { Node } from "unist";
import type { Root } from "mdast";

const notionClient = new Client({
    auth: process.env.NOTION_API_KEY,
});

export async function translatePage(pageId: string): Promise<Root> {
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

async function translateChildren(blockId: string): Promise<Node[]> {
    const childrenResponses = iteratePaginatedAPI(
        notionClient.blocks.children.list,
        { block_id: blockId }
    )

    const promises = []
    for await (const blockResponse of childrenResponses) {
        promises.push(translateBlock(blockResponse))
    }

    return (await Promise.all(promises)).flat()
}

async function translateBlock(blockResponse: GetBlockResponse): Promise<Node | Node[]> {
    if (!isFullBlock(blockResponse)) {
        console.error("No Full Block Response")
        return []
    }

    switch (blockResponse.type) {
        case "paragraph":
            return translateParagraph(blockResponse)
        case "heading_1":
            return translateHeading(1, blockResponse)
        case "heading_2":
            return translateHeading(2, blockResponse)
        case "heading_3":
            return translateHeading(3, blockResponse)
        case "code":
            return translateCode(blockResponse)
        case "quote":
            return translateQuote(blockResponse)
        case "equation":
            return translateEquation(blockResponse)
        case "table":
            return translateTable(blockResponse)
        case "table_row":
            return translateTableRow(blockResponse)
        case "callout":
            return translateCallout(blockResponse)
        case "image":
            return translateEmbed(blockResponse)
        case "video":
        case "pdf":
        case "embed":
        case "file":
        case "bookmark":
        case "link_preview":
            return translateLink(blockResponse)
        case "synced_block":
        case "column_list":
        case "column":
            return translateContainer(blockResponse)
        case "toggle":
            return translateToggle(blockResponse)
        default:
            console.error(`Unknown Type: ${blockResponse.type}`)
    }

    return []
}

// BLOCK SUPPORT

async function translateParagraph(paragraphResponse: ParagraphBlockObjectResponse) {
    const richText = paragraphResponse
        .paragraph
        .rich_text
    const phrasingContent = translateRichTextArray(richText)

    return builder.paragraph(phrasingContent)
}

type HeadingBlockObjectResponse = Heading1BlockObjectResponse | Heading2BlockObjectResponse | Heading3BlockObjectResponse
async function translateHeading(depth: number, headingResponse: HeadingBlockObjectResponse) {
    //@ts-ignore
    const richText = headingResponse[headingResponse.type]
        .rich_text
    //@ts-ignore
    const isToggleable = headingResponse[headingResponse.type]
        .is_toggleable

    const phrasingContent = translateRichTextArray(richText)
    const heading = builder.heading(depth + 1, phrasingContent)

    if (isToggleable) {
        const children: Array<Node> = [heading]
        children.push(...await translateChildren(headingResponse.id))
        return builder.list("unordered", builder.listItem(children))
    } else {
        return heading
    }
}

function translateCode(codeResponse: CodeBlockObjectResponse) {
    const language = codeResponse.code.language
    const text = textFromRichTextArray(codeResponse.code.rich_text)

    return builder.code(language, text)
}

async function translateQuote(quoteResponse: QuoteBlockObjectResponse) {
    const richText = quoteResponse
        .quote
        .rich_text
    const quoteChildren: Array<Node> = [builder.paragraph(translateRichTextArray(richText))]

    if (quoteResponse.has_children) {
        quoteChildren.push(...await translateChildren(quoteResponse.id))
    }

    return builder.blockquote(quoteChildren)
}

function translateEquation(equationResponse: EquationBlockObjectResponse) {
    return builder.math(equationResponse.equation.expression)
}


async function translateCallout(calloutResponse: CalloutBlockObjectResponse) {
    const richText = calloutResponse.callout.rich_text
    const phrasingContent = translateRichTextArray(richText)
    const firstParagraph = builder.paragraph(phrasingContent)

    const children = await translateChildren(calloutResponse.id)
    children.unshift(firstParagraph)

    return builder.callout(children)
}

// TABLE SUPPORT

async function translateTable(tableResponse: TableBlockObjectResponse) {
    const rows = await translateChildren(tableResponse.id)

    return builder.table(undefined, rows)
}


function translateTableRow(tableRowResponse: TableRowBlockObjectResponse) {
    const cells = tableRowResponse.table_row.cells.map((richText) => {
        const phrasingContent = translateRichTextArray(richText)
        return builder.tableCell(phrasingContent)
    })

    return builder.tableRow(cells)
}

// CONTAINER SUPPORT

async function translateContainer(syncedBlockResponse: BlockObjectResponse) {
    return translateChildren(syncedBlockResponse.id)
}

async function translateToggle(toggleBlockResponse: ToggleBlockObjectResponse) {
    const richText = toggleBlockResponse.toggle.rich_text

    const children: Array<Node> = [builder.paragraph(translateRichTextArray(richText))]

    children.push(...await translateContainer(toggleBlockResponse))
    return builder.list("unordered", builder.listItem(children))
}

// LINK SUPPORT

type LinkObjectResponse = ImageBlockObjectResponse | VideoBlockObjectResponse | PdfBlockObjectResponse | FileBlockObjectResponse | EmbedBlockObjectResponse | BookmarkBlockObjectResponse | LinkPreviewBlockObjectResponse

function translateEmbed(linkResponse: LinkObjectResponse) {
    const url = urlFromLink(linkResponse)
    const title = captionFromLink(linkResponse)
    return builder.paragraph(builder.image(url, undefined, title))
}

function translateLink(linkResponse: LinkObjectResponse) {
    const url = urlFromLink(linkResponse)
    const title = builder.text(captionFromLink(linkResponse) || url)
    return builder.paragraph(builder.link(url, undefined, title))
}

function urlFromLink(linkResponse: LinkObjectResponse) {
    //@ts-ignore
    const link = linkResponse[linkResponse.type]

    if ("type" in link) {
        return link[link.type].url
    } else {
        return link.url
    }
}

function captionFromLink(linkResponse: LinkObjectResponse) {
    //@ts-ignore
    const link = linkResponse[linkResponse.type]

    if ("caption" in link) {
        return textFromRichTextArray(link.caption)
    }
}

// RICH TEXT SUPPORT

function textFromRichTextArray(richTextResponseArray: RichTextItemResponse[]) {
    return richTextResponseArray.map((richTextResponse) => richTextResponse.plain_text).join("")
}

function translateRichTextArray(richTextResponseArray: RichTextItemResponse[]) {
    return richTextResponseArray.map(translateRichText)
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
    return builder.inlineMath(equationRichTextResponse.equation.expression)
}

function translateAnyRichText(anyRichTextResponse: RichTextItemResponse) {
    if (anyRichTextResponse.annotations.code) {
        return builder.inlineCode(anyRichTextResponse.plain_text)
    }

    let text = builder.text(anyRichTextResponse.plain_text) as Node
    if (anyRichTextResponse.annotations.bold) {
        text = builder.strong(text)
    }
    if (anyRichTextResponse.annotations.italic) {
        text = builder.emphasis(text)
    }
    if (anyRichTextResponse.annotations.strikethrough) {
        text = builder.strike(text)
    }

    return text
}
