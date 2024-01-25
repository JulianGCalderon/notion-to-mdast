import { toString } from "mdast-util-to-string";
import type { ToMdast } from "..";
import type { PropertyResponse } from "../types";

export async function title(this: ToMdast, genericResponse: PropertyResponse): Promise<string> {
    const response = genericResponse as PropertyResponse & { type: "title" }

    const phrasing = await this.translateRichText(response.title)

    return toString(phrasing)
}
