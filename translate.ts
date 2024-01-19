import { Client } from "@notionhq/client";
import builder from "mdast-builder"

const notionClient = new Client({
    auth: process.env.NOTION_API_KEY,
});

export async function translatePage(pageId: string) {
    return builder.root()
}
