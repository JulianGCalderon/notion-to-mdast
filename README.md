# notion-to-mdast

Notion's markdown export is buggy and lacks support for many features. This library aims to provide customizable alternative by using the official API to translate pages into a syntax tree, which can then be used to generate markdown or other formats.

An [integration](https://www.notion.so/my-integrations) must be created to use this library. You must also find the id of the target page, the script [search](./scripts/search.ts) can be used to find it.

## Install

To install, run:

```bash
npm install notion-to-mdast
```

## Usage

We must utilize `ToMdast` to convert the notion page to a syntax tree, and then compile it using the `unified` ecosystem.

The following code is a snippet of the [translate](./scripts/translate.ts) script.

```typescript
const client = new Client({
    auth: process.env.NOTION_API_KEY,
});

const toMdast = new ToMdast(client)
const root = await toMdast.translatePage(process.env.PAGE_ID!) as Root

const content = unified()
    .use(remarkStringify, { emphasis: "_" })
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkFrontmatter)
    .stringify(root)

console.log(content)
```

## API

### `new ToMdast(client: Client, options?: ToMdastOptions)`

Creates a new `ToMdast` instance. `options` is used to customize the output

### `ToMdast#translatePage(pageId: string): Promise<Root>`

Translates a page into a syntax tree

### `Options`

Customize the output of the syntax tree

```typescript
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
```

A handle is a function that takes in a response and returns a node or an array of nodes. The `this` context is the `ToMdast` instance. With `Options` the handles for each block type and rich text type can be customized. See [handles](src/handles.ts) for the default handles.

The metadata of the page is obtained from the page properties, and can also be customized with handles.

## Roadmap

- [x] Paragraph
- [x] Mention
- [x] Headings
- [x] Code
- [x] Quote
- [x] Equation
- [x] Table
- [x] Callout (with ofm)
- [x] Toggle blocks (as list item)
- [x] Numbered list item
- [x] Bulleted list item
- [x] To do (with gfm)
- [x] Divider
- [x] Image
- [x] Video
- [x] PDF
- [x] File
- [x] Embed
- [x] Bookmark
- [x] Link Preview
- [x] Synced block (as container)
- [x] Column list and column (as container)
- [x] Child page (as link)
- [x] Metadata
