# notion-to-obsidian

This project is a WIP (work-in-progress), it should not be used yet.

## Motivation

Notion's markdown export is buggy. Not only it completely breaks bold and italic text, but it's result is not obsidian-compatible.

I decided to create my own obsidian export with obsidian compatibility while learning javascript/typescript. This project contains my first ever lines on these languages so proceed with caution.

I first attempted this project with Python and string manipulation, starting from notion's export and converting it to an obsidian compatible language, but I did not like the result. Instead, I will use Notion's API to convert the original pages to markdown.

## Usage

After a week trying to setup the project for compatibility with ES and JS modules in Node, I decided to setup the project with Bun. It worked flawlessly

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
bun run index.ts
```

## Roadmap

- [ ] Single page to stdout
    - [x] Paragraph
    - [x] Mention
    - [x] Headings
    - [x] Code
    - [x] Quote
    - [x] Equation
    - [x] Table
    - [x] Image
    - [x] Video
    - [x] PDF
    - [x] File
    - [x] Embed
    - [x] Bookmark
    - [x] Link Preview
    - [ ] Synced block (as container)
    - [ ] Toggle blocks (as container)
    - [ ] Column list and column (as container)
    - [ ] Callout (with ofm)
    - [ ] Numbered list item
    - [ ] Bulleted list item
    - [ ] To do (with gfm)
    - [ ] Child page
    - ~~Breadcrumb~~
    - ~~Child database~~
    - ~~Divider~~
    - ~~Table of contents~~
    - ~~Template~~
- [ ] Single page to file
- [ ] Nested pages support
