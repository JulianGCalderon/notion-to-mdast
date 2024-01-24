import { isFullPage, type Client } from "@notionhq/client"
import type { GetPageResponse } from "@notionhq/client/build/src/api-endpoints"
import { VFile } from "vfile"
import { NotionToMdast } from "../notion-to-mdast/notion-to-mdast"
import { toString } from "mdast-util-to-string"

export class NotionToVFile {
    client: Client
    toMdast: NotionToMdast

    constructor(client: Client) {
        this.client = client
        this.toMdast = new NotionToMdast(client)
    }

    async translatePage(pageId: string, baseDir: string): Promise<VFile> {
        const pageResponse = await this.client.pages.retrieve({
            page_id: pageId
        })

        const file = new VFile()

        file.stem = await this.getTitle(pageResponse)
        file.extname = ".md"
        file.dirname = baseDir

        return file
    }

    async getTitle(pageResponse: GetPageResponse) {
        if (!isFullPage(pageResponse)) {
            return
        }
        const properties = pageResponse.properties

        if (!("title" in properties)) {
            return;
        }
        const title = properties.title;

        if (title.type != "title") {
            return;
        }

        return toString(await this.toMdast.translateRichText(title.title))
    }
}
