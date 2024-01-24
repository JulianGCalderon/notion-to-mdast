import type { Node, Parent, Root } from "mdast";
import * as builder from "mdast-builder";
import { toString } from "mdast-util-to-string";
import { join } from "path";
import type { InternalLink } from "remark-ofm";
import { CONTINUE, visit } from "unist-util-visit";
import type { VFile } from "vfile";

export default function loadChilds() {
    return function(tree: Root, file: VFile) {
        if (!file.data.childs) {
            file.data.childs = []
        }

        visit(tree, isChildLink, loadChild)

        function loadChild(genericNode: Node, _index?: number, _parent?: Parent) {
            genericNode.type = "internalLink"
            const node = genericNode as InternalLink


            const name = toString(node.children[0])
            const url = join(file.stem || "", name)

            //@ts-ignore
            file.data.childs.push(node.data.child.id)

            node.url = url
            node.children[0] = builder.text(name)
            node.data = {}

            return CONTINUE
        }
    }
}

function isChildLink(genericNode: Node, _index?: number, _parent?: Node) {
    return genericNode.type == "link"
        // @ts-ignore
        && genericNode.data?.child
}


