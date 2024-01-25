import type { EquationRichTextItemResponse, MentionRichTextItemResponse, RichTextItemResponse, TextRichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"
import type { ToMdast } from ".."

import type { PhrasingContent } from "mdast"
import { u } from "unist-builder"

export async function text(this: ToMdast, genericResponse: RichTextItemResponse) {
    let response = genericResponse as TextRichTextItemResponse
    let text = await mention.call(this, response)

    let link = response.text.link
    if (link) {
        return u("link", { url: link.url }, [text])
    } else {
        return text
    }

}

export async function equation(genericResponse: RichTextItemResponse) {
    const response = genericResponse as EquationRichTextItemResponse

    return u("inlineMath", response.equation.expression)
}

export async function mention(genericResponse: RichTextItemResponse) {
    const response = genericResponse as MentionRichTextItemResponse

    if (response.annotations.code) {
        return u("inlineCode", response.plain_text)
    }

    let text = u("text", response.plain_text) as PhrasingContent
    if (response.annotations.bold) {
        text = u("strong", [text])
    }
    if (response.annotations.italic) {
        text = u("emphasis", [text])
    }
    if (response.annotations.strikethrough) {
        text = u("delete", [text])
    }

    return text
}

