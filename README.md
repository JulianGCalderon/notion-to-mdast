# notion-to-mdast

This project translates responses from the notion API into mdast (markdown
abstract syntax tree)

## Motivation

Notion's markdown export is buggy and not customizable. I decided to create my own markdown (mdast) export with with focus on extensibility while learning javascript/typescript. This project contains my first ever lines on these languages so proceed with caution.

## API

This library exposes the `ToMdast` class, which receives a notion client and
provides utilities for converting pages (or blocks) into a syntax tree.

```typescript
new ToMdast(client: Client, options?: Options)
```

With options, the handles for notion types can be replaced

```typescript
export type Options = {
    blockHandles?: Partial<BlockHandles>
    richTextHandles?: Partial<RichTextHandles>
}

export type BlockHandles = Record<BlockObjectResponse['type'], BlockHandle>
export type RichTextHandles = Record<RichTextItemResponse['type'], RichTextHandle>
export type BlockHandle = (this: ToMdast, response: BlockObjectResponse) => Promise<Node | Node[]>
export type RichTextHandle = (this: ToMdast, response: RichTextItemResponse) => Promise<Node>
```

Handles are functions which receive a `BlockObjectRespose` and return the
translated node. See [handle](src/handle) for reference

To convert a page, we can use:

```typescript
ToMdast.translatePage(pageId: string): Promise<Node>
```

## Example

After the translation, the `unified` ecosystem can be used to transform/compile
the syntax tree into the desired format

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

## Script

To install dependencies:

```bash
bun install
```

Before running the script, a `.env` file must be set up to configure both the API key and the target page id.

```.env
NOTION_API_KEY=*********
PAGE_ID=********
```

To run:

```bash
bun run translate
```

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
- [ ] Metadata
