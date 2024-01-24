import { Client } from "@notionhq/client";
import type { Root } from "mdast";
import { unified } from "unified"
import remarkStringify from "remark-stringify"
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkOfm from "remark-ofm"
import remarkListMerge from "remark-list-merge";
import remarkFrontmatter from "remark-frontmatter";
import { write } from "to-vfile";
import { mkdir, rm } from "node:fs/promises";
import { NotionToMdast } from "./notion-to-mdast/notion-to-mdast";
import { NotionToVFile } from "./notion-to-vfile/notion-to-file";
import loadChilds from "./load-childs/load-childs";
import { join } from "path";

require("dotenv").config();

rm(process.env.BASE_DIR!, { recursive: true, force: true })

const client = new Client({
    auth: process.env.NOTION_API_KEY,
});

const notionToMdast = new NotionToMdast(client)
const notionToVFile = new NotionToVFile(client)

const runProcessor = unified()
    .use(remarkListMerge)
    .use(loadChilds);
const stringifyProcessor = unified()
    .use(remarkStringify, { emphasis: "_" })
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkOfm)
    .use(remarkFrontmatter);

async function migrate(baseDir: string, pageId: string) {
    let pageFile = await notionToVFile.translatePage(pageId, baseDir)
    let pageTree = await notionToMdast.translatePage(pageId)

    pageTree = await runProcessor
        .run(pageTree, pageFile) as Root

    const pageString = stringifyProcessor
        .stringify(pageTree)

    if (pageFile.dirname)
        await mkdir(pageFile.dirname, { recursive: true })

    pageFile.value = pageString

    write(pageFile)

    for (const child of pageFile.data.childs || []) {
        migrate(join(pageFile.dirname || "", pageFile.stem || ""), child)
    }
}

migrate(process.env.BASE_DIR!, process.env.PAGE_ID!)

