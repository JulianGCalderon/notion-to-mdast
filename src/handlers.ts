import type { BlockObjectResponse, CalloutBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { PageTranslator } from "notion-to-mdast"
import * as builder from "mdast-builder"

export async function callout(this: PageTranslator, genericResponse: BlockObjectResponse) {
    const response = genericResponse as CalloutBlockObjectResponse

    const richText = response.callout.rich_text
    const firstChild = builder.paragraph(await this.translateRichText(richText))

    const remainingChildren = await this.translateChildren(response.id)
    const children = [firstChild, ...remainingChildren]

    return builder.callout(children)
}
