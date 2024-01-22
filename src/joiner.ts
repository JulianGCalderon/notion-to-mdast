import type { Node, Root } from "mdast";
import { visit } from "unist-util-visit";

export default function remarkListJoin() {
    return function(tree: Root) {
        visit(tree, "list", joinerVisitor)
    }
}

function joinerVisitor(node: Node, index?: number, parent?: Node) {
    console.error(node, index)
}
