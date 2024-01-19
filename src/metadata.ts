import type { GetPageResponse } from "@notionhq/client/build/src/api-endpoints";
import { translateRichText } from "./translate";

export function getTitle(pageResponse: GetPageResponse) {
    if (!("properties" in pageResponse)) {
        return;
    }
    const properties = pageResponse.properties;

    if (!("title" in properties)) {
        return;
    }
    const title = properties.title;

    if (title.type != "title") {
        return;
    }

    return title.title.map((richText) => translateRichText(richText));
}
