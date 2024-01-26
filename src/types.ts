import type { BlockObjectResponse, PageObjectResponse, RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints.js"
import type { Node } from "mdast"
import ToMdast from "./index.js"

export type Options = {
    blockHandles?: Partial<BlockHandles>
    richTextHandles?: Partial<RichTextHandles>
    propertyHandles?: Partial<PropertyHandles>
}

export type BlockHandle = (this: ToMdast, response: BlockObjectResponse) => Promise<Node | Node[]>
export type BlockHandles = Record<BlockObjectResponse['type'], BlockHandle>

export type RichTextHandle = (this: ToMdast, response: RichTextItemResponse) => Promise<Node>
export type RichTextHandles = Record<RichTextItemResponse['type'], RichTextHandle>

export type PropertyResponse = PageObjectResponse['properties'][keyof PageObjectResponse['properties']]
export type PropertyHandle = (this: ToMdast, response: PropertyResponse) => Promise<string>
export type PropertyHandles = Record<PropertyResponse['type'], PropertyHandle>
