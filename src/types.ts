import type { BlockObjectResponse, RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"
import type { Node } from "mdast"
import type { ToMdast } from "."

export type Options = {
    blockHandles?: Partial<BlockHandles>
    richTextHandles?: Partial<RichTextHandles>
}

export type BlockHandles = Record<BlockObjectResponse['type'], BlockHandle>
export type RichTextHandles = Record<RichTextItemResponse['type'], RichTextHandle>
export type BlockHandle = (this: ToMdast, response: BlockObjectResponse) => Promise<Node | Node[]>
export type RichTextHandle = (this: ToMdast, response: RichTextItemResponse) => Promise<Node>
