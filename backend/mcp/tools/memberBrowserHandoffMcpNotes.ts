/** Provider identifiers that never publish from OpenQuok servers (member completes in browser). */
const MEMBER_BROWSER_HANDOFF_PROVIDER_IDS = new Set(["reddit"]);

export const MEMBER_BROWSER_HANDOFF_MCP_TOOL_DESCRIPTION_APPENDIX =
    "Reddit exception (member browser handoff): OpenQuok does not publish to reddit.com. " +
    "Use type draft to prepare title, subreddit, and body for human review. " +
    "type schedule or now only queues a due-time handoff (post becomes AWAITING_MEMBER); " +
    "the member submits on reddit.com (extension can copy, open submit, and autofill). " +
    "Do not claim the post went live on Reddit from this tool.";

export const MEMBER_BROWSER_HANDOFF_MCP_OUTPUT_NOTE =
    "Reddit handoff only — not server-published. Member must submit on reddit.com; " +
    "use draft when you are preparing copy, not scheduling an automatic Reddit publish.";

export function isMemberBrowserHandoffProviderIdentifier(identifier: string): boolean {
    return MEMBER_BROWSER_HANDOFF_PROVIDER_IDS.has(identifier.trim().toLowerCase());
}

export function memberBrowserHandoffFieldsForProvider(identifier: string): {
    memberBrowserHandoff: true;
    agentNote: string;
} | null {
    if (!isMemberBrowserHandoffProviderIdentifier(identifier)) {
        return null;
    }
    return {
        memberBrowserHandoff: true,
        agentNote: MEMBER_BROWSER_HANDOFF_MCP_OUTPUT_NOTE,
    };
}

export function workspaceMemberBrowserHandoffAgentNote(
    integrationIdentifiers: Record<string, string>
): string | undefined {
    const hasHandoff = Object.values(integrationIdentifiers).some(isMemberBrowserHandoffProviderIdentifier);
    return hasHandoff ? MEMBER_BROWSER_HANDOFF_MCP_OUTPUT_NOTE : undefined;
}
