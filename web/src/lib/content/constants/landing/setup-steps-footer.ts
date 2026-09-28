export type PublicSetupStepsFooter = {
	footerPrompt: string;
	footerLinkLabel: string;
	footerLinkHref: string;
};

export const PUBLIC_SETUP_STEPS_FOOTER_PROMPT = 'New to OpenQuok?';

const PUBLIC_API_SETUP_STEPS_FOOTER = {
	footerPrompt: PUBLIC_SETUP_STEPS_FOOTER_PROMPT,
	footerLinkLabel: 'Read the getting started guide',
	footerLinkHref: '/docs/getting-started-for-public-api'
} satisfies PublicSetupStepsFooter;

const PUBLIC_CLI_SETUP_STEPS_FOOTER = {
	footerPrompt: PUBLIC_SETUP_STEPS_FOOTER_PROMPT,
	footerLinkLabel: 'Read the CLI getting started guide',
	footerLinkHref: '/docs/getting-started-for-cli'
} satisfies PublicSetupStepsFooter;

const PUBLIC_MCP_INTRO_SETUP_STEPS_FOOTER = {
	footerPrompt: PUBLIC_SETUP_STEPS_FOOTER_PROMPT,
	footerLinkLabel: 'Read the MCP getting started guide',
	footerLinkHref: '/docs/getting-started-for-mcp'
} satisfies PublicSetupStepsFooter;

export function getPublicApiSetupStepsFooter(): PublicSetupStepsFooter {
	return PUBLIC_API_SETUP_STEPS_FOOTER;
}

export function getPublicAgentSetupStepsFooter(docsPath: string): PublicSetupStepsFooter {
	const href = docsPath.trim();
	return {
		footerPrompt: PUBLIC_SETUP_STEPS_FOOTER_PROMPT,
		footerLinkLabel: 'Read the agent setup guide',
		footerLinkHref: href || '/docs/agent-setup-guides'
	};
}

export function getPublicMcpSetupStepsFooter(
	tab: 'mcp' | 'skill',
	docsPath: string
): PublicSetupStepsFooter {
	if (tab === 'skill') {
		return PUBLIC_CLI_SETUP_STEPS_FOOTER;
	}

	const href = docsPath.trim();
	return {
		footerPrompt: PUBLIC_SETUP_STEPS_FOOTER_PROMPT,
		footerLinkLabel: 'Read the MCP client setup guide',
		footerLinkHref: href || PUBLIC_MCP_INTRO_SETUP_STEPS_FOOTER.footerLinkHref
	};
}
