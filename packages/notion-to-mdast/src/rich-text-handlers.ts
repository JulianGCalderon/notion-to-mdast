import type { EquationRichTextItemResponse, MentionRichTextItemResponse, RichTextItemResponse, TextRichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"
import type { PageTranslator } from "."
import * as builder from "mdast-builder"
import type { Node } from "mdast"

export async function text(this: PageTranslator, genericResponse: RichTextItemResponse) {
    let response = genericResponse as TextRichTextItemResponse
    let text = await mention.call(this, response)

    let link = response.text.link
    if (!link) {
        return text
    }

    return builder.link(link.url, undefined, text)
}

export async function equation(genericResponse: RichTextItemResponse) {
    const response = genericResponse as EquationRichTextItemResponse

    return builder.inlineMath(response.equation.expression)
}

export async function mention(genericResponse: RichTextItemResponse) {
    const response = genericResponse as MentionRichTextItemResponse

    if (response.annotations.code) {
        return builder.inlineCode(response.plain_text)
    }

    let text = builder.text(response.plain_text) as Node
    if (response.annotations.bold) {
        text = builder.strong(text)
    }
    if (response.annotations.italic) {
        text = builder.emphasis(text)
    }
    if (response.annotations.strikethrough) {
        text = builder.strike(text)
    }

    return text
}
