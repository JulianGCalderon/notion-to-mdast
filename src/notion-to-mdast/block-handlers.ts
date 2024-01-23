import type { BlockObjectResponse, CodeBlockObjectResponse, EquationBlockObjectResponse, ParagraphBlockObjectResponse, TableRowBlockObjectResponse, ToDoBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"

import * as builder from "mdast-builder"
import { NotionToMdast } from "./notion-to-mdast"
import { toString as nodeToString } from "mdast-util-to-string"

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

export const image = translateEmbed
export const video = translateLink
export const pdf = translateLink
export const embed = translateLink
export const link = translateLink
export const file = translateLink
export const bookmark = translateLink
export const link_preview = translateLink

async function translateEmbed(this: NotionToMdast, response: BlockObjectResponse) {
    const url = urlFromLink(response)

    const title = await titleFromLink.call(this, response)

    return builder.paragraph(builder.image(url, undefined, title))
}

async function translateLink(this: NotionToMdast, response: BlockObjectResponse) {
    const url = urlFromLink(response)

    const caption = await titleFromLink.call(this, response)
    const title = builder.text(caption || url)

    return builder.paragraph(builder.link(url, undefined, title))
}

function urlFromLink(linkResponse: BlockObjectResponse) {
    //@ts-ignore
    const link = linkResponse[linkResponse.type]
    return link[link.type]?.url
        || link.url
}

async function titleFromLink(this: NotionToMdast, linkResponse: BlockObjectResponse) {
    //@ts-ignore
    const link = linkResponse[linkResponse.type]
    return link["name"]
        || nodeToString(await this.translateRichText(link["caption"]))
}

export const column_list = translateContainer
export const column = translateContainer
export const synced_block = translateContainer

async function translateContainer(this: NotionToMdast, response: BlockObjectResponse) {
    return await this.translateChildren(response.id)
}
