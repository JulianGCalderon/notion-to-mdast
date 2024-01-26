import { u } from "unist-builder";
export async function text(genericResponse) {
    let response = genericResponse;
    let text = await mention.call(this, response);
    let link = response.text.link;
    if (link) {
        return u("link", { url: link.url }, [text]);
    }
    else {
        return text;
    }
}
export async function equation(genericResponse) {
    const response = genericResponse;
    return u("inlineMath", response.equation.expression);
}
export async function mention(genericResponse) {
    const response = genericResponse;
    if (response.annotations.code) {
        return u("inlineCode", response.plain_text);
    }
    let text = u("text", response.plain_text);
    if (response.annotations.bold) {
        text = u("strong", [text]);
    }
    if (response.annotations.italic) {
        text = u("emphasis", [text]);
    }
    if (response.annotations.strikethrough) {
        text = u("delete", [text]);
    }
    return text;
}
