import type { BlockObjectResponse, CalloutBlockObjectResponse, ChildPageBlockObjectResponse, CodeBlockObjectResponse, EmbedBlockObjectResponse, EquationBlockObjectResponse, QuoteBlockObjectResponse, TableRowBlockObjectResponse, ToDoBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import type { ToMdast } from ".."

import { u } from "unist-builder"
import { toString } from "mdast-util-to-string"

export async function paragraph(this: ToMdast, response: BlockObjectResponse) {
    // @ts-ignore
    const inner = response[response.type]

    const richText = inner.rich_text
    return u("paragraph", await this.translateRichText(richText))
}

export async function heading_1(this: ToMdast, response: BlockObjectResponse) {
    return await heading.call(this, response, 2)
}

export async function heading_2(this: ToMdast, response: BlockObjectResponse) {
    return await heading.call(this, response, 3)
}

export async function heading_3(this: ToMdast, response: BlockObjectResponse) {
    return await heading.call(this, response, 4)
}

async function heading(this: ToMdast, response: BlockObjectResponse, depth: 1 | 2 | 3 | 4 | 5 | 6) {
    // @ts-ignore
    const inner = response[response.type]

    const phrasing = await this.translateRichText(inner.rich_text)
    const heading = u("heading", { depth }, phrasing)

    const isToggleable = inner.is_toggleable
    if (!isToggleable) {
        return heading
    }

    const content = await this.translateChildren(response.id)

    return u("list", { ordered: false }, [
        u("listItem", [heading, ...content])
    ])
}


export async function code(this: ToMdast, genericResponse: BlockObjectResponse) {
    const response = genericResponse as CodeBlockObjectResponse

    const lang = response.code.language
    const content = toString(await this.translateRichText(response.code.rich_text))

    return u("code", { lang }, content)
}

export async function equation(this: ToMdast, genericResponse: BlockObjectResponse) {
    const response = genericResponse as EquationBlockObjectResponse

    return u("math", response.equation.expression)
}

export async function quote(this: ToMdast, genericResponse: BlockObjectResponse) {
    const response = genericResponse as QuoteBlockObjectResponse

    const phrasing = await paragraph.call(this, response)
    const content = await this.translateChildren(response.id)

    return u("blockquote", [phrasing, ...content])
}


export async function callout(this: ToMdast, genericResponse: BlockObjectResponse) {
    const response = genericResponse as CalloutBlockObjectResponse

    const phrasing = await paragraph.call(this, response)
    const content = await this.translateChildren(response.id)

    return u("containerDirective", { name: "callout" }, [phrasing, ...content])
}


export async function table(this: ToMdast, genericResponse: BlockObjectResponse) {
    const rows = await this.translateChildren(genericResponse.id)
    return u("table", rows)
}

export async function table_row(this: ToMdast, genericResponse: BlockObjectResponse) {
    const response = genericResponse as TableRowBlockObjectResponse

    const cells = response.table_row.cells.map(async (richText) => {
        return u("tableCell", await this.translateRichText(richText))
    })

    return u("tableRow", await Promise.all(cells))
}

export const toggle = bulleted_list_item
export async function bulleted_list_item(this: ToMdast, response: BlockObjectResponse) {
    const phrasing = await paragraph.call(this, response)
    const content = await this.translateChildren(response.id)

    return u("list", { ordered: false }, [
        u("listItem", [phrasing, ...content])
    ])
}

export async function numbered_list_item(this: ToMdast, response: BlockObjectResponse) {
    const phrasing = await paragraph.call(this, response)
    const content = await this.translateChildren(response.id)

    return u("list", { ordered: true }, [
        u("listItem", [phrasing, ...content])
    ])
}

export async function to_do(this: ToMdast, genericResponse: BlockObjectResponse) {
    const response = genericResponse as ToDoBlockObjectResponse

    const phrasing = await paragraph.call(this, response)
    const content = await this.translateChildren(response.id)


    return u("list", { ordered: false }, [
        u("listItem", { checked: response.to_do.checked }, [phrasing, ...content])
    ])
}

export const column_list = container
export const column = container
export const synced_block = container
async function container(this: ToMdast, response: BlockObjectResponse) {
    return await this.translateChildren(response.id)
}

export async function divider(_: BlockObjectResponse) {
    return u("thematicBreak")
}

export const image = attachment
export const video = attachment

export async function attachment(this: ToMdast, response: BlockObjectResponse) {
    // @ts-ignore
    const inner = response[response.type]

    const url = inner.url || inner[inner.type].url
    const name = inner.name || url

    const link = u("paragraph", [u("image", { url: url, alt: name })])
    const caption = u("paragraph", await this.translateRichText(inner.caption))

    return [link, caption]
}

export const pdf = link
export const link_preview = link
export const bookmark = link
export const file = link

export async function link(this: ToMdast, response: BlockObjectResponse) {
    //@ts-ignore
    const inner = response[response.type]

    const url = inner.url || inner[inner.type].url
    const name = inner.name || url

    const link = u("paragraph", [u("link", { url: url }, [u("text", name)])])
    const caption = u("paragraph", await this.translateRichText(inner.caption))

    return [link, caption]
}

export async function embed(this: ToMdast, genericResponse: BlockObjectResponse) {
    const response = genericResponse as EmbedBlockObjectResponse

    const htmlCode = `<iframe src=${response.embed.url}></iframe>`
    const embed = u("paragraph", u("html", htmlCode))

    const caption = u("paragraph", await this.translateRichText(response.embed.caption))

    return [embed, caption]
}

export async function child_page(this: ToMdast, genericResponse: BlockObjectResponse) {
    const response = genericResponse as ChildPageBlockObjectResponse

    const page = await this.client.pages.retrieve({ page_id: response.id })

    //@ts-ignore
    let url = page.url || page.id

    return u("paragraph", [
        u("link", { url }, [u("text", response.child_page.title)])
    ])
}
