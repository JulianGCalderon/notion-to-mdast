import { unified } from "unified"
import remarkStringify from "remark-stringify"
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkListJoiner from "./joiner.ts";
import type { Root } from "mdast";
import { translatePage } from "./translate";
import remarkOfm from "remark-ofm"

require("dotenv").config();

let pageRoot = await translatePage(process.env.PAGE_ID!);

const stringifyProcessor = unified()
    .use(remarkStringify, { emphasis: "_" })
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkOfm)

const runProcessor = unified()
    .use(remarkListJoiner)

let pageString =
    await runProcessor.run(pageRoot as Root).then((pageRoot) => {
        return stringifyProcessor.stringify(pageRoot as Root)
    })

console.log(pageString)

