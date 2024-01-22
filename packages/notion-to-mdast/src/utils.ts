import type { GetPageResponse } from "@notionhq/client/build/src/api-endpoints";
import { isFullPage } from "@notionhq/client";
import type { PageTranslator } from ".";

export function getTitle(this: PageTranslator, pageResponse: GetPageResponse) {
    if (!isFullPage(pageResponse)) {
        return
    }
    const properties = pageResponse.properties

    if (!("title" in properties)) {
        return;
    }
    const title = properties.title;

    if (title.type != "title") {
        return;
    }

    return this.translateRichText(title.title)
}
