import { toString } from "mdast-util-to-string";
import ToMdast from "../index.js";
import type { PropertyResponse } from "../types.js";

export async function title(this: ToMdast, genericResponse: PropertyResponse): Promise<string> {
    const response = genericResponse as PropertyResponse & { type: "title" }

    const phrasing = await this.translateRichText(response.title)

    return toString(phrasing)
}
