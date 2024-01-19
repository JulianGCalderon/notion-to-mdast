import { unified } from "unified"
import { translatePage } from "../translate";
import remarkStringify from "remark-stringify"
import type { Root } from "mdast";

require("dotenv").config();

let pageRoot = await translatePage(process.env.PAGE_ID!);


let pageString = unified().use(remarkStringify).stringify(pageRoot as Root)
console.log(pageString)

let textualPageTree = JSON.stringify(pageRoot, null, 1)
console.error(textualPageTree)
