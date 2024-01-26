import { Client, isFullPage, iteratePaginatedAPI } from "@notionhq/client";
import { title } from "../src/handle/property.js";
import ToMdast from "../src/index.js";
const client = new Client({ auth: process.env.NOTION_API_KEY });
const toMdast = new ToMdast(client);
import 'dotenv/config';
const query = process.argv[2] || undefined;
(async () => {
    for await (const searchResponse of iteratePaginatedAPI(client.search, {
        query: query,
        filter: {
            value: 'page',
            property: 'object'
        },
    })) {
        if (!(isFullPage(searchResponse))) {
            continue;
        }
        const summary = {
            title: await title.call(toMdast, searchResponse.properties.title),
            id: searchResponse.id,
            url: searchResponse.url,
        };
        console.log(summary);
    }
})();
