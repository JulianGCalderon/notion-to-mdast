import type { Alternative, Parent, PhrasingContent, Resource } from "mdast"

export interface Callout extends Parent {
    type: "callout"
}

export interface InternalLink extends Parent, Resource {
    type: "internalLink"
    children: PhrasingContent[]
}

export interface InternalEmbed extends Alternative, Parent, Resource {
    type: "internalEmbed"
    children: PhrasingContent[]
}

declare module 'mdast-util-to-markdown' {
    interface ConstructNameMap {
        callout: 'callout'
        internalLink: 'internalLink'
        internalEmbed: 'internalEmbed'
    }
}

declare module 'mdast' {
    interface BlockContentMap {
        callout: Callout
    }

    interface RootContentMap {
        callout: Callout
        internalLink: InternalLink
        internalEmbed: InternalEmbed
    }

    interface PhrasingContentMap {
        internalLink: InternalLink
        internalEmbed: InternalEmbed
    }
}
