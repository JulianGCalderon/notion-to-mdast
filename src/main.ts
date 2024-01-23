import { Client } from "@notionhq/client";
import type { Root } from "mdast";
import { NotionToMdast } from "./notion-to-mdast/notion-to-mdast.ts";
import { unified } from "unified"
import remarkStringify from "remark-stringify"
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkOfm from "remark-ofm"
import remarkListMerge from "remark-list-merge";
import remarkFrontmatter from "remark-frontmatter";
import { NotionToVFile } from "./notion-to-vfile/notion-to-file.ts";
import { write } from "to-vfile";
import { mkdir, rm } from "node:fs/promises";

require("dotenv").config();

rm(process.env.BASE_DIR!, { recursive: true, force: true })

const client = new Client({
    auth: process.env.NOTION_API_KEY,
});

const notionToMdast = new NotionToMdast(client)
let pageTree = await notionToMdast.translatePage(process.env.PAGE_ID!)

const notionToVFile = new NotionToVFile(client)
let pageFile = await notionToVFile.translatePage(process.env.BASE_DIR!, process.env.PAGE_ID!)

pageTree = await unified()
    .use(remarkListMerge)
    .run(pageTree, pageFile) as Root

const pageString = unified()
    .use(remarkStringify, { emphasis: "_" })
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkOfm)
    .use(remarkFrontmatter)
    .stringify(pageTree)

if (pageFile.dirname)
    await mkdir(pageFile.dirname, { recursive: true })

pageFile.value = pageString

write(pageFile)
