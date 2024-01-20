import { Client, isFullBlock, iteratePaginatedAPI } from "@notionhq/client";
import builder, { image } from "mdast-builder"
import { u as unistBuilder } from 'unist-builder'
import type {
    BookmarkBlockObjectResponse,
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
    VideoBlockObjectResponse,
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
        case "paragraph":
            return translateParagraph(blockResponse)
        // Could not merge the three heading cases without type errors
        case "heading_1":
            return translateHeading1(blockResponse)
        case "heading_2":
            return translateHeading2(blockResponse)
        case "heading_3":
            return translateHeading3(blockResponse)
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
        case "image":
            return translateImage(blockResponse)
        case "video":
            return translateVideo(blockResponse)
        case "pdf":
            return translatePdf(blockResponse)
        case "file":
            return translateFile(blockResponse)
        case "embed":
            return translateEmbed(blockResponse)
        case "bookmark":
            return translateBookmark(blockResponse)
        case "link_preview":
            return translateLinkPreview(blockResponse)
        default:
            console.error(`Unknown Type: ${blockResponse.type}`)
    }
}

function translateImage(imageResponse: ImageBlockObjectResponse) {
    const image = imageResponse.image

    //@ts-ignore
    const url = image[image.type].url

    const caption = textFromRichTextArray(image.caption)
    return builder.paragraph(builder.image(url, caption, caption))
}

function translateVideo(videoResponse: VideoBlockObjectResponse) {
    const video = videoResponse.video

    //@ts-ignore
    const url = video[video.type].url

    const caption = textFromRichTextArray(video.caption)
    return builder.paragraph(builder.image(url, caption))
}

function translatePdf(pdfResponse: PdfBlockObjectResponse) {
    const pdf = pdfResponse.pdf

    //@ts-ignore
    const url = pdf[pdf.type].url

    const caption = textFromRichTextArray(pdf.caption)
    return builder.paragraph(builder.image(url, caption))
}

function translateFile(fileResponse: FileBlockObjectResponse) {
    const file = fileResponse.file

    //@ts-ignore
    const url = file[file.type].url

    const caption = textFromRichTextArray(file.caption)
    return builder.paragraph(builder.link(url, caption))
}

function translateEmbed(embedResponse: EmbedBlockObjectResponse) { }
function translateBookmark(bookmarkResponse: BookmarkBlockObjectResponse) { }
function translateLinkPreview(linkPreviewResponse: LinkPreviewBlockObjectResponse) { }

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

function translateCode(codeResponse: CodeBlockObjectResponse) {
    console.error(codeResponse.code.rich_text)

    const language = codeResponse.code.language
    const text = textFromRichTextArray(codeResponse.code.rich_text)

    return builder.code(language, text)
}

function translateQuote(quoteResponse: QuoteBlockObjectResponse) {
    const phrasingContent = quoteResponse
        .quote
        .rich_text
        .map(translateRichText)

    return builder.blockquote(phrasingContent)
}

function translateEquation(equationResponse: EquationBlockObjectResponse) {
    return unistBuilder("math", equationResponse.equation.expression)
}

async function translateTable(tableResponse: TableBlockObjectResponse) {
    const rows = await translateChildren(tableResponse.id)

    return builder.table(undefined, rows)
}


function translateTableRow(tableRowResponse: TableRowBlockObjectResponse) {
    const cells = tableRowResponse.table_row.cells.map((richTextResponseArray) => {
        const text = richTextResponseArray.map(translateRichText)
        return builder.tableCell(text)
    })

    return builder.tableRow(cells)
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
    if (anyRichTextResponse.annotations.strikethrough) {
        text = unistBuilder("delete", {}, [text])
    }

    return text
}


