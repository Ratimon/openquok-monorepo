import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

export type TelegramMockAgentBranding = {
	agentIcon: IconName;
	agentLabel: string;
};

export const DEFAULT_TELEGRAM_MOCK_AGENT_BRANDING: TelegramMockAgentBranding = {
	agentIcon: icons.OpenClaw.name,
	agentLabel: 'OpenClaw'
};
