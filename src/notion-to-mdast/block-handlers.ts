import type { BlockObjectResponse, ChildPageBlockObjectResponse, CodeBlockObjectResponse, EmbedBlockObjectResponse, EquationBlockObjectResponse, FileBlockObjectResponse, ParagraphBlockObjectResponse, PdfBlockObjectResponse, TableRowBlockObjectResponse, ToDoBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"

import * as builder from "mdast-builder"
import { NotionToMdast } from "./notion-to-mdast"
import { toString as nodeToString } from "mdast-util-to-string"
import { isFullPage } from "@notionhq/client"

export async function bulleted_list_item(this: NotionToMdast, response: BlockObjectResponse) {
    const item = builder.listItem([])

    this.addRichText(response, item)
    this.addChildren(response, item)

    return builder.list("unordered", item)
}

export const toggle = bulleted_list_item

export async function numbered_list_item(this: NotionToMdast, response: BlockObjectResponse) {
    const item = builder.listItem([])

    this.addRichText(response, item)
    this.addChildren(response, item)

    return builder.list("unordered", item)
}

export async function to_do(this: NotionToMdast, genericResponse: BlockObjectResponse) {
    const response = genericResponse as ToDoBlockObjectResponse
    const item = builder.taskListItem([], response.to_do.checked)

    this.addRichText(response, item)
    this.addChildren(response, item)

    return builder.list("unordered", item)
}


export async function paragraph(this: NotionToMdast, genericResponse: BlockObjectResponse) {
    const response = genericResponse as ParagraphBlockObjectResponse

    const richText = response.paragraph.rich_text
    return builder.paragraph(await this.translateRichText(richText))
}

async function translateHeading(this: NotionToMdast, depth: number, response: BlockObjectResponse) {
    const heading = builder.heading(depth + 1, [])
    this.addRichText(response, heading)

    //@ts-ignore
    const isToggleable = response[response.type].is_toggleable
    if (!isToggleable) {
        return heading
    }

    const item = builder.listItem([heading])
    this.addChildren(response, item)

    return builder.list("unordered", item)
}

export async function heading_1(this: NotionToMdast, response: BlockObjectResponse) {
    return translateHeading.call(this, 1, response)
}

export async function heading_2(this: NotionToMdast, response: BlockObjectResponse) {
    return translateHeading.call(this, 2, response)
}

export async function heading_3(this: NotionToMdast, response: BlockObjectResponse) {
    return translateHeading.call(this, 3, response)
}


export async function code(this: NotionToMdast, genericResponse: BlockObjectResponse) {
    const response = genericResponse as CodeBlockObjectResponse

    const language = response.code.language

    const text = await this.translateRichText(response.code.rich_text)
    const plainText = nodeToString(text)

    return builder.code(language, plainText)
}


export async function quote(this: NotionToMdast, response: BlockObjectResponse) {
    const quote = builder.blockquote([])

    this.addRichText(response, quote)
    this.addChildren(response, quote)

    return quote
}


export async function equation(this: NotionToMdast, genericResponse: BlockObjectResponse) {
    const response = genericResponse as EquationBlockObjectResponse

    return builder.math(response.equation.expression)
}

export async function table(this: NotionToMdast, genericResponse: BlockObjectResponse) {
    const rows = await this.translateChildren(genericResponse.id)
    return builder.table(undefined, rows)
}

export async function table_row(this: NotionToMdast, genericResponse: BlockObjectResponse) {
    const response = genericResponse as TableRowBlockObjectResponse

    let cells = []
    for (const richText of response.table_row.cells) {
        const cell = builder.tableCell(await this.translateRichText(richText))
        cells.push(cell)
    }

    return builder.tableRow(cells)
}

export async function divider(_: BlockObjectResponse) {
    return builder.separator()
}


export async function callout(this: NotionToMdast, response: BlockObjectResponse) {
    const callout = builder.callout()

    this.addRichText(response, callout)
    this.addChildren(response, callout)

    return callout
}

export const image = translateMedia
export const video = translateMedia

export async function translateMedia(this: NotionToMdast, response: BlockObjectResponse) {
    // @ts-ignore
    const innerObject = response[response.type]

    let url
    switch (innerObject.type) {
        case "file":
            url = innerObject.file.url
            break
        case "external":
            url = innerObject.external.url
            break
    }

    const link = builder.paragraph(builder.image(url, undefined, url))
    const caption = builder.paragraph(await this.translateRichText(innerObject.caption))

    return [link, caption]
}

export async function pdf(this: NotionToMdast, genericResponse: BlockObjectResponse) {
    const response = genericResponse as PdfBlockObjectResponse

    let url
    switch (response.pdf.type) {
        case "file":
            url = response.pdf.file.url
            break
        case "external":
            url = response.pdf.external.url
            break
    }

    const link = builder.paragraph(builder.link(url, undefined, builder.text(url)))
    const caption = builder.paragraph(await this.translateRichText(response.pdf.caption))

    return [link, caption]
}

export async function file(this: NotionToMdast, genericResponse: BlockObjectResponse) {
    const response = genericResponse as FileBlockObjectResponse

    const name = response.file.name

    let url
    switch (response.file.type) {
        case "file":
            url = response.file.file.url
            break
        case "external":
            url = response.file.external.url
            break
    }

    const link = builder.paragraph(builder.link(url, undefined, builder.text(name)))
    const caption = builder.paragraph(await this.translateRichText(response.file.caption))

    return [link, caption]
}


export async function embed(this: NotionToMdast, genericResponse: BlockObjectResponse) {
    const response = genericResponse as EmbedBlockObjectResponse

    const htmlCode = `<iframe src=${response.embed.url}></iframe>`
    const embed = builder.paragraph(builder.html(htmlCode))

    const caption = builder.paragraph(await this.translateRichText(response.embed.caption))

    return [embed, caption]
}

export const link_preview = translateExternalLink
export const bookmark = translateExternalLink

async function translateExternalLink(this: NotionToMdast, response: BlockObjectResponse) {
    //@ts-ignore
    const innerObject = response[response.type]
    const url = innerObject.url

    const link = builder.paragraph(builder.link(url, undefined, builder.text(url)))
    const caption = builder.paragraph(await this.translateRichText(innerObject.caption))

    return [link, caption]
}

export const column_list = translateContainer
export const column = translateContainer
export const synced_block = translateContainer

async function translateContainer(this: NotionToMdast, response: BlockObjectResponse) {
    return await this.translateChildren(response.id)
}

export async function child_page(this: NotionToMdast, genericResponse: BlockObjectResponse) {
    const response = genericResponse as ChildPageBlockObjectResponse

    const pageReponse = await this.client.pages.retrieve({
        page_id: response.id
    })

    let url
    if (!isFullPage(pageReponse)) {
        url = pageReponse.id
    } else {
        url = pageReponse.url
    }

    const link = builder.link(url, undefined, builder.text(response.child_page.title))
    link.data = { child: { id: response.id } }

    return builder.paragraph(link)
}
