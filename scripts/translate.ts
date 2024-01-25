import { unified } from "unified"
import remarkStringify from "remark-stringify"
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkDirective from "remark-directive";
import type { Root } from "mdast";

import { Client } from "@notionhq/client";
import { ToMdast } from "../src";

require("dotenv").config();

const client = new Client({
    auth: process.env.NOTION_API_KEY,
});

const xxx = new ToMdast(client)
const root = await xxx.translatePage(process.env.PAGE_ID!) as Root

const content = unified()
    .use(remarkStringify, { emphasis: "_" })
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkFrontmatter)
    .stringify(root)

console.log(content)
