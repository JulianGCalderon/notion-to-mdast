import type { Link, List, ListItem, Node, Parent, Root } from "mdast";
import { CONTINUE, visit } from "unist-util-visit";
import type { VFile } from "vfile";

export default function loadChilds() {
    return function(tree: Root, file: VFile) {
        visit(tree, isChildLink, loadChild)
    }
}

function isChildLink(genericNode: Node, index?: number, parent?: Node) {
    return genericNode.type == "link"
        // @ts-ignore
        && genericNode.data?.child
}

function loadChild(node: Node, index?: number, parent?: Parent) {
    console.log(node)

    return CONTINUE
}

