import { CONTINUE, visit } from "unist-util-visit";
export default function remarkListMerge() {
    return function (tree) {
        visit(tree, "list", mergerVisitor);
    };
}
function mergerVisitor(node, index, parent) {
    if (!parent || index == undefined) {
        return CONTINUE;
    }
    let toDelete = 0;
    while (shouldBeMerged(node, index + toDelete + 1, parent)) {
        toDelete += 1;
    }
    const deletedNodes = parent.children.splice(index + 1, toDelete);
    const deletedItems = deletedNodes.flatMap((list) => list.children);
    node.children.push(...deletedItems);
    return CONTINUE;
}
function shouldBeMerged(node, index, parent) {
    const adjacentNode = parent.children[index];
    return adjacentNode?.type == "list" && node.ordered == adjacentNode.ordered;
}
