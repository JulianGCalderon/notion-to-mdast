import { Client, isFullPage, iteratePaginatedAPI } from "@notionhq/client";
import { title } from "../src/handle/property";
import { ToMdast } from "../src";
import { argv } from "bun";

const client = new Client({ auth: process.env.NOTION_API_KEY });
const toMdast = new ToMdast(client);

const query = argv[2] || undefined;

for await (const searchResponse of iteratePaginatedAPI(client.search, {
    query: query,
    filter: {
        value: 'page',
        property: 'object'
    },
})) {
    if (!(isFullPage(searchResponse))) {
        continue
    }

    const summary = {
        title: await title.call(toMdast, searchResponse.properties.title),
        id: searchResponse.id,
        url: searchResponse.url,
    }

    console.log(summary)
}
