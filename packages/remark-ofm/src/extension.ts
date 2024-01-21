import type { Node, Parent } from "mdast"
import type { Info, Options, State } from "mdast-util-to-markdown"
import type { Processor } from "unified"
import type { Callout } from ".."

export default function remarkOfm(this: Processor) {
    const data = this.data()

    const toMarkdownExtensions =
        //@ts-ignore
        data.toMarkdownExtensions || (data.toMarkdownExtensions = [])

    toMarkdownExtensions.push(ofmToMarkdown())
}

function ofmToMarkdown(): Options {
    return {
        extensions: [
            {
                handlers: { callout }
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
