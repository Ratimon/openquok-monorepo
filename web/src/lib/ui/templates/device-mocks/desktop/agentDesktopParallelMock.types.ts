import type { IconName } from '$data/icons';

/** Agent host chat previews for parallel desktop sessions on landing pages. */
export type AgentDesktopParallelMockContentId =
	| 'agent-parallel-schedule'
	| 'agent-parallel-analytics';

export type AgentDesktopChatMockProps = {
	agentIcon: IconName;
	agentLabel: string;
};
