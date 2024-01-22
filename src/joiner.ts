import type { List, ListItem, Parent, Root } from "mdast";
import { CONTINUE, visit } from "unist-util-visit";

export default function remarkListJoin() {
    return function(tree: Root) {
        visit(tree, "list", joinerVisitor)
    }
}

function joinerVisitor(node: List, index?: number, parent?: Parent) {
    if (!parent || !index) {
        return CONTINUE
    }

    let toDelete = 0
    while (shouldBeJoined(node, index + toDelete + 1, parent)) {
        toDelete += 1
    }

    const deletedNodes = parent.children.splice(index + 1, toDelete) as Array<List>
    const deletedItems = deletedNodes.flatMap((list) => list.children) as Array<ListItem>

    node.children.push(...deletedItems)

    return CONTINUE
}

function shouldBeJoined(node: List, index: number, parent: Parent) {
    const adjacentNode = parent.children[index]
    return adjacentNode?.type == "list" && node.ordered == adjacentNode.ordered
}
