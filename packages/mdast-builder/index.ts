import type { Literal, Node, Parent } from "unist";

export type Children = Node | Node[] | (() => Node | Node[]);

function normalizeChildren(children?: Children): Node[] {
    if (Array.isArray(children)) {
        return children;
    } else if (typeof children === "function") {
        return normalizeChildren(children());
    } else if (typeof children === "undefined") {
        return [];
    } else {
        return [children];
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

export function text(value: string) { return valueNode("text", value); }
export function inlineCode(value: string) { return valueNode("inlineCode", value); }
export function html(value: string) { return valueNode("html", value); }
export function strong(kids?: Children) { return parentNode("strong", kids); }
export function emphasis(kids?: Children) { return parentNode("emphasis", kids); }
export function strike(kids?: Children) { return parentNode("delete", kids); }

export function brk() { return Object.freeze({ type: "break" }) }
export function separator() { return text("---") }

export function paragraph(kids?: Children) { return parentNode("paragraph", kids) }
export function blockquote(kids?: Children) { return parentNode("blockquote", kids); }
export function code(lang: string, value: string) {
    return { ...valueNode("code", value), lang }
}
export function heading(depth: number, kids?: Children) {
    if (depth < 1) throw new Error(`Invalid depth: ${depth}`);
    return { ...parentNode("heading", kids), depth };
};

export type Align = "left" | "right" | "center"
export function table(align?: (Align | null)[], kids?: Children) {
    return { ...parentNode("table", kids), align }
}
export function tableCell(kids?: Children) { return parentNode("tableCell", kids); }
export function tableRow(kids?: Children) { return parentNode("tableRow", kids); }


export function root(kids?: Children) { return parentNode("root", kids) }
export function rootWithTitle(depth: number, title: Children, kids?: Children) {
    return root([heading(depth, title), ...normalizeChildren(kids)]);
};

export function image(
    url: string,
    title?: string,
    alt?: string,
    kids?: Children
) {
    return {
        ...parentNode("image", kids),
        url,
        title,
        alt
    }
}
export function link(url: string, title: string = "", kids?: Children) {
    return { ...parentNode("link", kids), url, title }
}

export type ListType = "ordered" | "unordered"
export function list(ordered: ListType, kids: Children) {
    return {
        ...parentNode("list", kids),
        ordered: ordered === "ordered"
    };
}
export function listItem(kids: Children) { return parentNode("listItem", kids) }

// MATH
export function math(expression: string) { return valueNode("math", expression) }
export function inlineMath(expression: string) { return valueNode("inlineMath", expression) }

// OFM
export function callout(kids?: Children) { return parentNode("callout", kids) }
