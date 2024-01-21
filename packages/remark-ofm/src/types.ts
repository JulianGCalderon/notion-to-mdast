import type { Parent } from "mdast"

export interface Callout extends Parent {
    type: 'callout'
}

declare module 'mdast-util-to-markdown' {
    interface ConstructNameMap {
        callout: 'callout'
    }
}

// Add nodes to tree.
declare module 'mdast' {
    interface BlockContentMap {
        callout: Callout
    }

    interface RootContentMap {
        callout: Callout
    }
}
