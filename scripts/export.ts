import { unified } from "unified"
import remarkStringify from "remark-stringify"
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkOfm from "remark-ofm"
import remarkListMerge from "remark-list-merge";
import { PageTranslator } from "../packages/notion-to-mdast";
import { Client } from "@notionhq/client";
import type { Root } from "mdast";

require("dotenv").config();

const client = new Client({
    auth: process.env.NOTION_API_KEY,
});

const translator = new PageTranslator(client)
let pageRoot = await translator.translatePage(process.env.PAGE_ID!)

const newPageRoot = await unified()
    .use(remarkListMerge)
    .run(pageRoot) as Root

const pageString = unified()
    .use(remarkStringify, { emphasis: "_" })
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkOfm)
    .stringify(newPageRoot)

console.log(pageString)

