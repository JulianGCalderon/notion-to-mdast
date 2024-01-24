import type { Processor } from "unified"
import ofmToMarkdown from "./src/to-markdown"
export type { Callout } from "./src/types.ts"
export type { InternalLink } from "./src/types"

export default function remarkOfm(this: Processor) {
    const data = this.data()

    // @ts-ignore: This property is used by `remark-stringify`
    const toMarkdownExtensions = data.toMarkdownExtensions || (data.toMarkdownExtensions = [])

    toMarkdownExtensions.push(ofmToMarkdown())
}

