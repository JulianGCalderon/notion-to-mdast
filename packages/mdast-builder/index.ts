import type { Blockquote, Break, Code, Delete, Emphasis, Heading, Html, Image, InlineCode, Link, List, ListItem, Paragraph, Root, Strong, Table, TableCell, TableRow, Text, ThematicBreak } from "mdast"
import type { InlineMath, Math } from "mdast-util-math"
import type { Literal, Node, Parent } from "unist"

export type Children = Node | Node[] | (() => Node | Node[])

function normalizeChildren(children?: Children): Node[] {
    if (Array.isArray(children)) {
        return children
    } else if (typeof children === "function") {
        return normalizeChildren(children())
    } else if (typeof children === "undefined") {
        return []
    } else {
        return [children]
    }
}

function valueNode(type: string, value: unknown): Literal {
    return {
        type,
        value,
    }
}

function parentNode(type: string, kids?: Children): Parent {
    return {
        type,
        children: normalizeChildren(kids)
    }
}

export function text(value: string): Text { return valueNode("text", value) as Text }
export function inlineCode(value: string): InlineCode { return valueNode("inlineCode", value) as InlineCode }
export function html(value: string): Html { return valueNode("html", value) as Html }
export function strong(kids?: Children): Strong { return parentNode("strong", kids) as Strong }
export function emphasis(kids?: Children): Emphasis { return parentNode("emphasis", kids) as Emphasis }
export function strike(kids?: Children): Delete { return parentNode("delete", kids) as Delete }

export function brk(): Break { return { type: "break" } }
export function separator(): ThematicBreak { return { type: "thematicBreak" } }

export function paragraph(kids?: Children): Paragraph { return parentNode("paragraph", kids) as Paragraph }
export function blockquote(kids?: Children): Blockquote { return parentNode("blockquote", kids) as Blockquote }
export function code(lang: string, value: string): Code {
    return { ...valueNode("code", value), lang } as Code
}
export function heading(depth: number, kids?: Children): Heading {
    if (depth < 1) throw new Error(`Invalid depth: ${depth}`)
    return { ...parentNode("heading", kids), depth } as Heading
}

export type Align = "left" | "right" | "center"
export function table(align?: (Align | null)[], kids?: Children): Table {
    return { ...parentNode("table", kids), align } as Table
}
export function tableRow(kids?: Children): TableRow { return parentNode("tableRow", kids) as TableRow }
export function tableCell(kids?: Children): TableCell { return parentNode("tableCell", kids) as TableCell }


export function root(kids?: Children): Root { return parentNode("root", kids) as Root }
export function rootWithTitle(depth: number, title: Children, kids?: Children): Root {
    return root([heading(depth, title), ...normalizeChildren(kids)])
}

export function image(
    url: string,
    title?: string,
    alt?: string,
    kids?: Children
): Image {
    return {
        ...parentNode("image", kids),
        url,
        title,
        alt
    } as Image
}
export function link(url: string, title: string = "", kids?: Children): Link {
    return { ...parentNode("link", kids), url, title } as Link
}

export type ListType = "ordered" | "unordered"
export function list(ordered: ListType, kids: Children): List {
    return {
        ...parentNode("list", kids),
        ordered: ordered === "ordered"
    } as List
}
export function listItem(kids: Children): ListItem { return parentNode("listItem", kids) as ListItem }
export function taskListItem(kids: Children, checked: boolean) {
    return {
        ...parentNode("listItem", kids),
        checked
    }
}

// MATH
export function math(expression: string): Math { return valueNode("math", expression) as Math }
export function inlineMath(expression: string): InlineMath { return valueNode("inlineMath", expression) as InlineMath }

// OFM
export function callout(kids?: Children) { return parentNode("callout", kids) }
