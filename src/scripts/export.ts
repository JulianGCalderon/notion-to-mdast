import { unified } from "unified"
import { translatePage } from "../translate";
import remarkStringify from "remark-stringify"
import type { Root } from "mdast";
import remarkMath from "remark-math";

require("dotenv").config();

let pageRoot = await translatePage(process.env.PAGE_ID!);

let textualPageTree = JSON.stringify(pageRoot, null, 1)
console.error("\n" + textualPageTree)

let pageString = unified()
    .use(remarkMath)
    .use(remarkStringify).stringify(pageRoot as Root)
console.log(pageString)

