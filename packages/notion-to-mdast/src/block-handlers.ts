import type { BlockObjectResponse, BulletedListItemBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import * as builder from "mdast-builder"
import type { PageTranslator } from "."

export async function bulleted_list_item(this: PageTranslator, genericResponse: BlockObjectResponse) {
    const response = genericResponse as BulletedListItemBlockObjectResponse

    const richText = response.bulleted_list_item.rich_text

    const firstChild = builder.paragraph(await this.translateRichTexts(richText))
    const remainingChildren = await this.translateChildren(response.id)

    const children = [firstChild, ...remainingChildren]

    return builder.list("unordered", builder.listItem(children))
}

/*

async function translateNumberedListItem(numberedListItemResponse: NumberedListItemBlockObjectResponse) {
    const richText = numberedListItemResponse.numbered_list_item.rich_text

    const itemChildren: Array<Node> = [builder.paragraph(translateRichTextArray(richText))]
    itemChildren.push(...await translateChildren(numberedListItemResponse.id))

    return builder.list("ordered", builder.listItem(itemChildren))
}


async function translateToDo(toDoResponse: ToDoBlockObjectResponse) {
    const richText = toDoResponse.to_do.rich_text

    const itemChildren: Array<Node> = [builder.paragraph(translateRichTextArray(richText))]
    itemChildren.push(...await translateChildren(toDoResponse.id))

    return builder.list("unordered", builder.taskListItem(itemChildren, toDoResponse.to_do.checked))
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
    quoteChildren.push(...await translateChildren(quoteResponse.id))

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

// DIVIDER SUPPORT

function translateDivider(_: DividerBlockObjectResponse) {
    return builder.separator()
}

// CONTAINER SUPPORT

async function translateContainer(syncedBlockResponse: BlockObjectResponse) {
    return translateChildren(syncedBlockResponse.id)
}

async function translateToggle(toggleBlockResponse: ToggleBlockObjectResponse) {
    const richText = toggleBlockResponse.toggle.rich_text

    const children: Array<Node> = [builder.paragraph(translateRichTextArray(richText))]

    children.push(...await translateChildren(toggleBlockResponse.id))
    return builder.list("unordered", builder.listItem(children))
}

// LINK SUPPORT

type LinkObjectResponse = ImageBlockObjectResponse | VideoBlockObjectResponse
    | PdfBlockObjectResponse | FileBlockObjectResponse | EmbedBlockObjectResponse
    | BookmarkBlockObjectResponse | LinkPreviewBlockObjectResponse

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

*/
