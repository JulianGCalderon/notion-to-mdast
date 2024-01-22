import { unified } from "unified"
import remarkStringify from "remark-stringify"
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkOfm from "remark-ofm"
import remarkListMerge from "remark-list-merge";
import * as builder from "mdast-builder"
import { PageTranslator } from "../packages/notion-to-mdast";
import { Client } from "@notionhq/client";
import type { Root } from "mdast";
import type { BlockObjectResponse, CalloutBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";

require("dotenv").config();

const client = new Client({
    auth: process.env.NOTION_API_KEY,
});

async function callout(this: PageTranslator, genericResponse: BlockObjectResponse) {
    const response = genericResponse as CalloutBlockObjectResponse

    const richText = response.callout.rich_text
    const firstChild = builder.paragraph(await this.translateRichText(richText))

    const remainingChildren = await this.translateChildren(response.id)
    const children = [firstChild, ...remainingChildren]

    return builder.callout(children)
}

const translator = new PageTranslator(client, { blockHandlers: { callout } })
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

