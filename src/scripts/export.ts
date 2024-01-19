import { unified } from "unified"
import { translatePage } from "../translate";
import remarkStringify from "remark-stringify"
import type { Root } from "mdast";
import remarkMath from "remark-math";

require("dotenv").config();

let pageRoot = await translatePage(process.env.PAGE_ID!);

let pageString = unified()
    .use(remarkMath)
    .use(remarkStringify, { emphasis: "_" })
    .stringify(pageRoot as Root)

console.log(pageString)

