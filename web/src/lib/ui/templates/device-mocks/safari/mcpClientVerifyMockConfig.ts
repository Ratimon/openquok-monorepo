import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

import type { McpClient } from '$lib/developers/utils/getMcpClientConfig';
import { MCP_CLIENT_DOCS_SLUG } from '$lib/developers/utils/getMcpClientConfig';

export type McpVerifySafariMockContentId =
	| 'mcp-verify-cursor'
	| 'mcp-verify-claude-code'
	| 'mcp-verify-claude-cowork'
	| 'mcp-verify-vscode-copilot'
	| 'mcp-verify-devin-desktop'
	| 'mcp-verify-amp'
	| 'mcp-verify-codex'
	| 'mcp-verify-gemini-cli'
	| 'mcp-verify-warp';

export type McpInstallSafariMockContentId =
	| 'mcp-install-cursor'
	| 'mcp-install-claude-code'
	| 'mcp-install-claude-cowork'
	| 'mcp-install-vscode-copilot'
	| 'mcp-install-devin-desktop'
	| 'mcp-install-amp'
	| 'mcp-install-codex'
	| 'mcp-install-gemini-cli'
	| 'mcp-install-warp';

export type McpVerifyMockLayout = 'ide' | 'terminal' | 'cowork';

export type McpClientVerifyMockTheme = {
	layout: McpVerifyMockLayout;
	mockUrl: string;
	productLabel: string;
	panelLabel: string;
	icon: IconName;
	surfaceClass: string;
	accentClass: string;
	accentSoftClass: string;
	borderClass: string;
	/** Highlighted config entry in IDE explorer mock. */
	configFileHint?: string;
};

const VERIFY_USER_PROMPT = 'List my connected social media accounts';

export const MCP_VERIFY_USER_PROMPT = VERIFY_USER_PROMPT;

export const MCP_VERIFY_CHANNELS = [
	'Facebook — My Brand Page',
	'Instagram — @mybrand (Business)',
	'Threads — @mybrand'
] as const;

const THEMES: Record<McpClient, McpClientVerifyMockTheme> = {
	Cursor: {
		layout: 'ide',
		mockUrl: 'cursor.com',
		productLabel: 'Cursor',
		panelLabel: 'Agent',
		icon: icons.Code.name,
		surfaceClass: 'bg-[#181818]',
		accentClass: 'text-violet-300',
		accentSoftClass: 'bg-violet-500/15 text-violet-200',
		borderClass: 'border-white/10',
		configFileHint: '.cursor/mcp.json'
	},
	'Claude Code': {
		layout: 'terminal',
		mockUrl: 'docs.anthropic.com/claude-code',
		productLabel: 'Claude Code',
		panelLabel: 'Session',
		icon: icons.Claude.name,
		surfaceClass: 'bg-[#141413]',
		accentClass: 'text-[#d77655]',
		accentSoftClass: 'bg-[#d77655]/15 text-[#f0c4b2]',
		borderClass: 'border-white/10'
	},
	'Claude Cowork': {
		layout: 'cowork',
		mockUrl: 'claude.com/cowork',
		productLabel: 'Claude Cowork',
		panelLabel: 'Connectors',
		icon: icons.ClaudeGlyph.name,
		surfaceClass: 'bg-[#f7f3ef]',
		accentClass: 'text-[#b85c3d]',
		accentSoftClass: 'bg-[#d77655]/12 text-[#8f4a31]',
		borderClass: 'border-[#e7ddd4]'
	},
	'VS Code / Copilot': {
		layout: 'ide',
		mockUrl: 'code.visualstudio.com',
		productLabel: 'VS Code',
		panelLabel: 'Copilot Chat',
		icon: icons.FolderCode.name,
		surfaceClass: 'bg-[#1e1e1e]',
		accentClass: 'text-sky-300',
		accentSoftClass: 'bg-sky-500/15 text-sky-200',
		borderClass: 'border-white/10',
		configFileHint: 'mcp.json'
	},
	'Devin Desktop': {
		layout: 'ide',
		mockUrl: 'docs.devin.ai',
		productLabel: 'Devin Desktop',
		panelLabel: 'Devin Local',
		icon: icons.Devin.name,
		surfaceClass: 'bg-[#101418]',
		accentClass: 'text-cyan-300',
		accentSoftClass: 'bg-cyan-500/15 text-cyan-100',
		borderClass: 'border-white/10',
		configFileHint: 'mcp_config.json'
	},
	Amp: {
		layout: 'ide',
		mockUrl: 'amp.dev',
		productLabel: 'Amp',
		panelLabel: 'Chat',
		icon: icons.Terminal.name,
		surfaceClass: 'bg-[#121212]',
		accentClass: 'text-amber-300',
		accentSoftClass: 'bg-amber-500/15 text-amber-100',
		borderClass: 'border-white/10',
		configFileHint: 'amp.settings.json'
	},
	Codex: {
		layout: 'terminal',
		mockUrl: 'openai.com/codex',
		productLabel: 'Codex',
		panelLabel: 'codex',
		icon: icons.ChatGPT.name,
		surfaceClass: 'bg-[#0d1117]',
		accentClass: 'text-emerald-300',
		accentSoftClass: 'bg-emerald-500/15 text-emerald-100',
		borderClass: 'border-white/10'
	},
	'Gemini CLI': {
		layout: 'terminal',
		mockUrl: 'gemini.google.com',
		productLabel: 'Gemini CLI',
		panelLabel: 'gemini',
		icon: icons.Gemini.name,
		surfaceClass: 'bg-[#131314]',
		accentClass: 'text-blue-300',
		accentSoftClass: 'bg-blue-500/15 text-blue-100',
		borderClass: 'border-white/10'
	},
	Warp: {
		layout: 'terminal',
		mockUrl: 'warp.dev',
		productLabel: 'Warp',
		panelLabel: 'Warp AI',
		icon: icons.Terminal.name,
		surfaceClass: 'bg-[#111015]',
		accentClass: 'text-fuchsia-300',
		accentSoftClass: 'bg-fuchsia-500/15 text-fuchsia-100',
		borderClass: 'border-white/10'
	}
};

const VERIFY_CONTENT_ID_BY_CLIENT = Object.fromEntries(
	(Object.keys(THEMES) as McpClient[]).map((client) => [
		client,
		`mcp-verify-${MCP_CLIENT_DOCS_SLUG[client]}` as McpVerifySafariMockContentId
	])
) as Record<McpClient, McpVerifySafariMockContentId>;

const INSTALL_CONTENT_ID_BY_CLIENT = Object.fromEntries(
	(Object.keys(THEMES) as McpClient[]).map((client) => [
		client,
		`mcp-install-${MCP_CLIENT_DOCS_SLUG[client]}` as McpInstallSafariMockContentId
	])
) as Record<McpClient, McpInstallSafariMockContentId>;

const THEME_BY_VERIFY_CONTENT_ID = Object.fromEntries(
	(Object.keys(THEMES) as McpClient[]).map((client) => [
		VERIFY_CONTENT_ID_BY_CLIENT[client],
		THEMES[client]
	])
) as Record<McpVerifySafariMockContentId, McpClientVerifyMockTheme>;

const THEME_BY_INSTALL_CONTENT_ID = Object.fromEntries(
	(Object.keys(THEMES) as McpClient[]).map((client) => [
		INSTALL_CONTENT_ID_BY_CLIENT[client],
		THEMES[client]
	])
) as Record<McpInstallSafariMockContentId, McpClientVerifyMockTheme>;

export function getMcpVerifySafariContentId(client: McpClient): McpVerifySafariMockContentId {
	return VERIFY_CONTENT_ID_BY_CLIENT[client];
}

export function getMcpInstallSafariContentId(client: McpClient): McpInstallSafariMockContentId {
	return INSTALL_CONTENT_ID_BY_CLIENT[client];
}

export function getMcpInstallMockTheme(
	content: McpInstallSafariMockContentId
): McpClientVerifyMockTheme {
	return THEME_BY_INSTALL_CONTENT_ID[content];
}

export function getMcpVerifyMockTheme(
	content: McpVerifySafariMockContentId
): McpClientVerifyMockTheme {
	return THEME_BY_VERIFY_CONTENT_ID[content];
}

export function getMcpVerifyMockThemeForClient(client: McpClient): McpClientVerifyMockTheme {
	return THEMES[client];
}
