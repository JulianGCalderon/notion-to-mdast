import { unified } from "unified"
import { translatePage } from "./translate";
import remarkStringify from "remark-stringify"

require("dotenv").config();

let pageRoot = await translatePage(process.env.PAGE_ID!);
console.log(pageRoot)

let pageString = unified().use(remarkStringify).stringify(pageRoot)
console.log(pageString)
