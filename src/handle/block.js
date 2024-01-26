import { u } from "unist-builder";
import { toString } from "mdast-util-to-string";
export async function paragraph(response) {
    // @ts-ignore
    const inner = response[response.type];
    const richText = inner.rich_text;
    return u("paragraph", await this.translateRichText(richText));
}
export async function heading_1(response) {
    return await heading.call(this, response, 2);
}
export async function heading_2(response) {
    return await heading.call(this, response, 3);
}
export async function heading_3(response) {
    return await heading.call(this, response, 4);
}
async function heading(response, depth) {
    // @ts-ignore
    const inner = response[response.type];
    const phrasing = await this.translateRichText(inner.rich_text);
    const heading = u("heading", { depth }, phrasing);
    const isToggleable = inner.is_toggleable;
    if (!isToggleable) {
        return heading;
    }
    const content = await this.translateChildren(response.id);
    return u("list", { ordered: false }, [
        u("listItem", [heading, ...content])
    ]);
}
export async function code(genericResponse) {
    const response = genericResponse;
    const lang = response.code.language;
    const content = toString(await this.translateRichText(response.code.rich_text));
    return u("code", { lang }, content);
}
export async function equation(genericResponse) {
    const response = genericResponse;
    return u("math", response.equation.expression);
}
export async function quote(genericResponse) {
    const response = genericResponse;
    const phrasing = await paragraph.call(this, response);
    const content = await this.translateChildren(response.id);
    return u("blockquote", [phrasing, ...content]);
}
export async function callout(genericResponse) {
    const response = genericResponse;
    const phrasing = await paragraph.call(this, response);
    const content = await this.translateChildren(response.id);
    return u("containerDirective", { name: "callout" }, [phrasing, ...content]);
}
export async function table(genericResponse) {
    const rows = await this.translateChildren(genericResponse.id);
    return u("table", rows);
}
export async function table_row(genericResponse) {
    const response = genericResponse;
    const cells = response.table_row.cells.map(async (richText) => {
        return u("tableCell", await this.translateRichText(richText));
    });
    return u("tableRow", await Promise.all(cells));
}
export const toggle = bulleted_list_item;
export async function bulleted_list_item(response) {
    const phrasing = await paragraph.call(this, response);
    const content = await this.translateChildren(response.id);
    return u("list", { ordered: false }, [
        u("listItem", [phrasing, ...content])
    ]);
}
export async function numbered_list_item(response) {
    const phrasing = await paragraph.call(this, response);
    const content = await this.translateChildren(response.id);
    return u("list", { ordered: true }, [
        u("listItem", [phrasing, ...content])
    ]);
}
export async function to_do(genericResponse) {
    const response = genericResponse;
    const phrasing = await paragraph.call(this, response);
    const content = await this.translateChildren(response.id);
    return u("list", { ordered: false }, [
        u("listItem", { checked: response.to_do.checked }, [phrasing, ...content])
    ]);
}
export const column_list = container;
export const column = container;
export const synced_block = container;
async function container(response) {
    return await this.translateChildren(response.id);
}
export async function divider(_) {
    return u("thematicBreak");
}
export const image = attachment;
export const video = attachment;
export async function attachment(response) {
    // @ts-ignore
    const inner = response[response.type];
    const url = inner.url || inner[inner.type].url;
    const name = inner.name || url;
    const link = u("paragraph", [u("image", { url: url, alt: name })]);
    const caption = u("paragraph", await this.translateRichText(inner.caption));
    return [link, caption];
}
export const pdf = link;
export const link_preview = link;
export const bookmark = link;
export const file = link;
export async function link(response) {
    //@ts-ignore
    const inner = response[response.type];
    const url = inner.url || inner[inner.type].url;
    const name = inner.name || url;
    const link = u("paragraph", [u("link", { url: url }, [u("text", name)])]);
    const caption = u("paragraph", await this.translateRichText(inner.caption));
    return [link, caption];
}
export async function embed(genericResponse) {
    const response = genericResponse;
    const htmlCode = `<iframe src=${response.embed.url}></iframe>`;
    const embed = u("paragraph", u("html", htmlCode));
    const caption = u("paragraph", await this.translateRichText(response.embed.caption));
    return [embed, caption];
}
export async function child_page(genericResponse) {
    const response = genericResponse;
    const page = await this.client.pages.retrieve({ page_id: response.id });
    //@ts-ignore
    let url = page.url || page.id;
    return u("paragraph", [
        u("link", { url }, [u("text", response.child_page.title)])
    ]);
}
