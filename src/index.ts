import { unified } from "unified"
import remarkStringify from "remark-stringify"
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import type { Root } from "mdast";
import { translatePage } from "./translate";
import remarkOfm from "remark-ofm"

require("dotenv").config();

let pageRoot = await translatePage(process.env.PAGE_ID!);

let pageString = unified()
    .use(remarkStringify, { emphasis: "_" })
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkOfm)
    .stringify(pageRoot as Root)

console.log(pageString)

