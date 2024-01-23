import { Client, isFullPage, iteratePaginatedAPI } from "@notionhq/client";
import { toString } from "mdast-util-to-string";
import { PageTranslator } from "notion-to-mdast";


const client = new Client({ auth: process.env.NOTION_API_KEY });
const translator = new PageTranslator(client)

for await (const searchResponse of iteratePaginatedAPI(client.search, {
    filter: {
        value: 'page',
        property: 'object'
    },
})) {
    if (!(isFullPage(searchResponse))) {
        continue
    }

    const title = toString(await translator.getTitle(searchResponse))
    const pageInfo = {
        title,
        id: searchResponse.id,
    }

    console.log(JSON.stringify(pageInfo, null, 1))
}
