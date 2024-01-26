import { toString } from "mdast-util-to-string";
export async function title(genericResponse) {
    const response = genericResponse;
    const phrasing = await this.translateRichText(response.title);
    return toString(phrasing);
}
