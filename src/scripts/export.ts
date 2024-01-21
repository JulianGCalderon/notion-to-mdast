import { unified } from "unified"
import remarkStringify from "remark-stringify"
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import { translatePage } from "../translate";
import type { Root } from "mdast";

require("dotenv").config();

let pageRoot = await translatePage(process.env.PAGE_ID!);

console.error(JSON.stringify(pageRoot, null, 1))

let pageString = unified()
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkStringify, { emphasis: "_" })
    .stringify(pageRoot as Root)

console.log(pageString)

