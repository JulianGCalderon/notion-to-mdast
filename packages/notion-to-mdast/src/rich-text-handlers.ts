/*
export function text(genericResponse: Response) {
    let text = mention.call(this, genericResponse)

    let link = textRichTextResponse.text.link
    if (!link) {
        return text
    }

    return builder.link(link.url, undefined, text)
}

export function equation(genericResponse: Response) {
    const response = genericResponse as EquationRichTextItemResponse


    return builder.inlineMath(equationRichTextResponse.equation.expression)
}

export function mention(genericResponse: Response) {
    const response = genericResponse as RichTextItemResponse

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
*/
