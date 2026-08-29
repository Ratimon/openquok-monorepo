export type SafariMockContentId =
	| 'openclaw-docs-overview'
	| 'hermes-docs-overview'
	| 'grok-bot-docs-overview'
	| 'thinkrail-docs-overview'
	| import('$lib/ui/templates/device-mocks/safari/mcpClientVerifyMockConfig').McpVerifySafariMockContentId
	| import('$lib/ui/templates/device-mocks/safari/mcpClientVerifyMockConfig').McpInstallSafariMockContentId;
