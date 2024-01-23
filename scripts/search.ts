import { Client, isFullPage, iteratePaginatedAPI } from "@notionhq/client";
import { NotionToVFile } from "../src/notion-to-vfile/notion-to-file";


const client = new Client({ auth: process.env.NOTION_API_KEY });
const toVFile = new NotionToVFile(client)

for await (const searchResponse of iteratePaginatedAPI(client.search, {
    filter: {
        value: 'page',
        property: 'object'
    },
})) {
    if (!(isFullPage(searchResponse))) {
        continue
    }

    const title = await toVFile.getTitle(searchResponse)
    const pageInfo = {
        title,
        id: searchResponse.id,
    }

    console.log(JSON.stringify(pageInfo, null, 1))
}
