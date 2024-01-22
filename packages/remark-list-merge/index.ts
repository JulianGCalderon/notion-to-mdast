import type { List, ListItem, Parent, Root } from "mdast";
import { CONTINUE, visit } from "unist-util-visit";

export default function remarkListMerge() {
    return function(tree: Root) {
        visit(tree, "list", mergerVisitor)
    }
}

function mergerVisitor(node: List, index?: number, parent?: Parent) {
    if (!parent || index == undefined) {
        return CONTINUE
    }

    let toDelete = 0
    while (shouldBeMerged(node, index + toDelete + 1, parent)) {
        toDelete += 1
    }

    const deletedNodes = parent.children.splice(index + 1, toDelete) as Array<List>
    const deletedItems = deletedNodes.flatMap((list) => list.children) as Array<ListItem>

    node.children.push(...deletedItems)

    return CONTINUE
}

function shouldBeMerged(node: List, index: number, parent: Parent) {
    const adjacentNode = parent.children[index]
    return adjacentNode?.type == "list" && node.ordered == adjacentNode.ordered
}
