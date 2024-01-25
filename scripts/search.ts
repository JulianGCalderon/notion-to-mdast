import { Client, isFullPage, iteratePaginatedAPI } from "@notionhq/client";

const client = new Client({ auth: process.env.NOTION_API_KEY });

for await (const searchResponse of iteratePaginatedAPI(client.search, {
    filter: {
        value: 'page',
        property: 'object'
    },
})) {
    if (!(isFullPage(searchResponse))) {
        continue
    }

    console.log(JSON.stringify(searchResponse, null, 1))
}
