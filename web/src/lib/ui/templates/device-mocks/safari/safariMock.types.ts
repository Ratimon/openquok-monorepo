export type SafariMockContentId =
	| 'chrome-web-store-openquok'
	| 'directory-site-peerpush'
	| 'directory-site-uneed'
	| 'external-site-placeholder'
	| 'openclaw-docs-overview'
	| 'hermes-docs-overview'
	| 'grok-bot-docs-overview'
	| 'dots-docs-overview'
	| 'meta-muse-docs-overview'
	| 'thinkrail-docs-overview'
	| 'manus-docs-overview'
	| 'gemini-docs-overview'
	| 'claude-duet-docs-overview'
	| import('$lib/ui/templates/device-mocks/safari/mcpClientVerifyMockConfig').McpVerifySafariMockContentId
	| import('$lib/ui/templates/device-mocks/safari/mcpClientVerifyMockConfig').McpInstallSafariMockContentId;
