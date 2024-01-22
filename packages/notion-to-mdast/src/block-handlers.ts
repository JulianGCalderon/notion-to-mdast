import type { BlockObjectResponse, BulletedListItemBlockObjectResponse, CalloutBlockObjectResponse, CodeBlockObjectResponse, EquationBlockObjectResponse, NumberedListItemBlockObjectResponse, ParagraphBlockObjectResponse, QuoteBlockObjectResponse, TableRowBlockObjectResponse, ToDoBlockObjectResponse, ToggleBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"

import * as builder from "mdast-builder"
import { PageTranslator } from "."
import { toString as nodeToString } from "mdast-util-to-string"

export async function bulleted_list_item(this: PageTranslator, genericResponse: BlockObjectResponse) {
    const response = genericResponse as BulletedListItemBlockObjectResponse

    const richText = response.bulleted_list_item.rich_text
    const firstChild = builder.paragraph(await this.translateRichText(richText))

    const remainingChildren = await this.translateChildren(response.id)
    const children = [firstChild, ...remainingChildren]

    return builder.list("unordered", builder.listItem(children))
}


export async function numbered_list_item(this: PageTranslator, genericResponse: BlockObjectResponse) {
    const response = genericResponse as NumberedListItemBlockObjectResponse

    const richText = response.numbered_list_item.rich_text
    const firstChild = builder.paragraph(await this.translateRichText(richText))

    const remainingChildren = await this.translateChildren(response.id)
    const children = [firstChild, ...remainingChildren]

    return builder.list("ordered", builder.listItem(children))
}

export async function to_do(this: PageTranslator, genericResponse: BlockObjectResponse) {
    const response = genericResponse as ToDoBlockObjectResponse

    const richText = response.to_do.rich_text
    const firstChild = builder.paragraph(await this.translateRichText(richText))

    const remainingChildren = await this.translateChildren(response.id)
    const children = [firstChild, ...remainingChildren]

    return builder.list("unordered", builder.taskListItem(children, response.to_do.checked))
}

export async function paragraph(this: PageTranslator, genericResponse: BlockObjectResponse) {
    const response = genericResponse as ParagraphBlockObjectResponse

    const richText = response.paragraph.rich_text
    return builder.paragraph(await this.translateRichText(richText))
}

async function translateHeading(this: PageTranslator, depth: number, response: BlockObjectResponse) {
    //@ts-ignore
    const richText = response[response.type].rich_text
    //@ts-ignore
    const isToggleable = response[response.type].is_toggleable

    const phrasingContent = await this.translateRichText(richText)
    const heading = builder.heading(depth + 1, phrasingContent)
    if (!isToggleable) {
        return heading
    }

    const remainingChildren = await this.translateChildren(response.id)
    const children = [heading, ...remainingChildren]

    return builder.list("unordered", builder.listItem(children))
}

export async function heading_1(this: PageTranslator, response: BlockObjectResponse) {
    return translateHeading.call(this, 1, response)
}

export async function heading_2(this: PageTranslator, response: BlockObjectResponse) {
    return translateHeading.call(this, 2, response)
}

export async function heading_3(this: PageTranslator, response: BlockObjectResponse) {
    return translateHeading.call(this, 3, response)
}


export async function code(this: PageTranslator, genericResponse: BlockObjectResponse) {
    const response = genericResponse as CodeBlockObjectResponse

    const language = response.code.language

    const text = await this.translateRichText(response.code.rich_text)
    const plainText = nodeToString(text)

    return builder.code(language, plainText)
}


export async function quote(this: PageTranslator, genericResponse: BlockObjectResponse) {
    const response = genericResponse as QuoteBlockObjectResponse

    const richText = response.quote.rich_text
    const firstChild = builder.paragraph(await this.translateRichText(richText))

    const remainingChildren = await this.translateChildren(response.id)
    const children = [firstChild, ...remainingChildren]

    return builder.blockquote(children)
}


export async function equation(this: PageTranslator, genericResponse: BlockObjectResponse) {
    const response = genericResponse as EquationBlockObjectResponse

    return builder.math(response.equation.expression)
}

export async function callout(this: PageTranslator, genericResponse: BlockObjectResponse) {
    const response = genericResponse as CalloutBlockObjectResponse

    const richText = response.callout.rich_text
    const firstChild = builder.paragraph(await this.translateRichText(richText))

    const remainingChildren = await this.translateChildren(response.id)
    const children = [firstChild, ...remainingChildren]

    return builder.callout(children)
}

export async function table(this: PageTranslator, genericResponse: BlockObjectResponse) {
    const rows = await this.translateChildren(genericResponse.id)
    return builder.table(undefined, rows)
}

export async function table_row(this: PageTranslator, genericResponse: BlockObjectResponse) {
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

export async function toggle(this: PageTranslator, genericResponse: BlockObjectResponse) {
    const response = genericResponse as ToggleBlockObjectResponse

    const richText = response.toggle.rich_text
    const firstChild = builder.paragraph(await this.translateRichText(richText))

    const remainingChildren = await this.translateChildren(response.id)
    const children = [firstChild, ...remainingChildren]

    return builder.list("unordered", builder.listItem(children))
}

export const image = translateEmbed
export const video = translateEmbed
export const pdf = translateEmbed
export const embed = translateEmbed
export const link = translateLink
export const file = translateLink
export const bookmark = translateLink
export const link_preview = translateLink

async function translateEmbed(this: PageTranslator, response: BlockObjectResponse) {
    const url = urlFromLink(response)

    const title = await titleFromLink.call(this, response)

    return builder.paragraph(builder.image(url, undefined, title))
}

async function translateLink(this: PageTranslator, response: BlockObjectResponse) {
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

async function titleFromLink(this: PageTranslator, linkResponse: BlockObjectResponse) {
    //@ts-ignore
    const link = linkResponse[linkResponse.type]
    return link["name"]
        || nodeToString(await this.translateRichText(link["caption"]))
}

export const column_list = translateContainer
export const column = translateContainer
export const synced_block = translateContainer

async function translateContainer(this: PageTranslator, response: BlockObjectResponse) {
    return await this.translateChildren(response.id)
}
