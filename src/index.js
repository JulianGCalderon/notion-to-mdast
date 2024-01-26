import { iteratePaginatedAPI, isFullBlock, isFullPage } from "@notionhq/client";
import { u } from "unist-builder";
import { unified } from "unified";
import remarkListMerge from "./transformer/list-merge.js";
import * as blockHandles from "./handle/block.js";
import * as richTextHandles from "./handle/richtext.js";
import * as propertyHandles from "./handle/property.js";
export default class ToMdast {
    client;
    blockHandles;
    richTextHandles;
    propertyHandles;
    constructor(client, options) {
        this.client = client;
        this.blockHandles = { ...blockHandles, ...options?.blockHandles };
        this.richTextHandles = { ...richTextHandles, ...options?.richTextHandles };
        this.propertyHandles = { ...propertyHandles, ...options?.propertyHandles };
    }
    async translatePage(pageId) {
        const metadata = await this.translateMetadata(pageId);
        const children = [...metadata, ...await this.translateChildren(pageId)];
        const root = u("root", children);
        return await unified()
            .use(remarkListMerge)
            .run(root);
    }
    async translateMetadata(pageId) {
        const response = await this.client.pages.retrieve({ page_id: pageId });
        if (!isFullPage(response)) {
            return [];
        }
        const promises = Object.entries(response.properties).map(async ([key, value]) => {
            const handle = this.propertyHandles[value.type];
            if (!handle) {
                console.error("No handler for property:", value.type);
                return [];
            }
            const content = await handle.call(this, value);
            return u("yaml", { value: `${key}: ${content}` });
        });
        return (await Promise.all(promises)).flat();
    }
    async translateChildren(blockId) {
        const childrenResponses = iteratePaginatedAPI(this.client.blocks.children.list, { block_id: blockId });
        const promises = [];
        for await (const response of childrenResponses) {
            promises.push(this.translateBlock(response));
        }
        return (await Promise.all(promises)).flat();
    }
    async translateBlock(response) {
        if (!isFullBlock(response)) {
            console.error("Received partial response", response.id);
            return [];
        }
        const handler = this.blockHandles[response.type];
        if (!handler) {
            console.error("No handler for block:", response.type);
            return [];
        }
        return await handler.call(this, response);
    }
    async translateRichText(responses) {
        const promises = responses.map((response) => {
            const handler = this.richTextHandles[response.type];
            return handler.call(this, response);
        });
        return await Promise.all(promises);
    }
}
