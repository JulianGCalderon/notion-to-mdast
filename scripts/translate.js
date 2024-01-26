import { unified } from "unified";
import remarkStringify from "remark-stringify";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkDirective from "remark-directive";
import { Client } from "@notionhq/client";
import ToMdast from "../src/index.js";
import 'dotenv/config';
const client = new Client({
    auth: process.env.NOTION_API_KEY,
});
const toMdast = new ToMdast(client);
(async () => {
    const root = await toMdast.translatePage(process.env.PAGE_ID);
    const content = unified()
        .use(remarkStringify, { emphasis: "_" })
        .use(remarkMath)
        .use(remarkGfm)
        .use(remarkDirective)
        .use(remarkFrontmatter)
        .stringify(root);
    console.log(content);
})();
