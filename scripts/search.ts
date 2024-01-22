import { Client, isFullPage, iteratePaginatedAPI } from "@notionhq/client";
import { getTitle } from "../src/metadata";
import { toString } from "mdast-util-to-string";


const notionClient = new Client({ auth: process.env.NOTION_API_KEY });

(async () => {
    for await (const searchResponse of iteratePaginatedAPI(notionClient.search, {
        filter: {
            value: 'page',
            property: 'object'
        },
    })) {

        console.log(searchResponse)

        if (!(isFullPage(searchResponse))) {
            continue
        }

        const title = toString(getTitle(searchResponse))
        const pageInfo = {
            title,
            id: searchResponse.id,
        }

        console.log(JSON.stringify(pageInfo, null, 1))
    }
})();
