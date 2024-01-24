import type { Node, Parent } from "mdast"
import type { Info, Options, State } from "mdast-util-to-markdown"
import type { Callout, InternalLink } from ".."

export default function ofmToMarkdown(): Options {
    return {
        extensions: [
            {
                handlers: { callout, internalLink, internalEmbed }
            }
        ]
    }
}

// I have no idea what i'm doing
function callout(node: Node, _: Parent | undefined, state: State, info: Info): string {
    let calloutNode = node as Callout
    const exit = state.enter('callout')

    const tracker = state.createTracker(info)

    let value = tracker.move("> [!note]")
    value += tracker.move("\n")

    tracker.shift(2)
    value += tracker.move(state.indentLines(
        state.containerFlow(calloutNode, tracker.current()),
        prefixWithLessThan
    ))

    exit()
    return value
}

function prefixWithLessThan(value: string, _line: number, blank: boolean) {
    return '>' + (blank ? '' : ' ') + value
}

function internalLink(genericNode: Node, _: Parent | undefined, state: State, info: Info): string {
    let node = genericNode as InternalLink

    const exit = state.enter('internalLink')
    const tracker = state.createTracker(info)

    let value = tracker.move("[[")
    value += tracker.move(
        state.safe(node.url, {
            before: "[[",
            after: node.children ? '|' : ']',
            ...tracker.current()
        })
    )

    if (node.children) {
        value += tracker.move("|")

        // @ts-ignore
        value += tracker.move(state.containerPhrasing(node, {
            before: "|",
            after: ']',
            ...tracker.current()
        })
        )
    }

    value += tracker.move("]]")

    exit()
    return value
}

function internalEmbed(node: Node, parent: Parent | undefined, state: State, info: Info): string {
    const exit = state.enter('internalEmbed')

    const tracker = state.createTracker(info)
    let value = tracker.move("!")

    info = Object.assign(info, tracker.current())
    value += internalEmbed(node, parent, state, info)

    exit()
    return value
}
