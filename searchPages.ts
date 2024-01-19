import { Client } from "@notionhq/client";

require("dotenv").config();

const notionClient = new Client({
    auth: process.env.NOTION_API_KEY,
});

const query = process.argv[2] || "";

(async () => {
    const response = await notionClient.search({
        query: query,
        filter: {
            value: "page",
            property: "object"
        }
    });

    console.log(response)
})();

