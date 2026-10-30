/** Agent-host and MCP × `/agents/{slug}/reddit` hero — aligned with `/channels/reddit`. */
export function buildRedditHandoffAgentSurfaceHeroTitle(surfaceLabel: string): string {
	return `Draft in OpenQuok with ${surfaceLabel}\npost on reddit.com — lower ban risk`;
}

export function buildRedditHandoffMcpHeroDescription(clientLabel: string): string {
	return `Connect ${clientLabel} to OpenQuok over MCP. Draft Reddit markdown in your workspace — you submit on reddit.com when due. No server auto-post, reducing ban risk.`;
}

export function buildRedditHandoffAgentHostHeroDescription(agentLabel: string): string {
	return `Message ${agentLabel} to draft Reddit markdown. Queue posts in OpenQuok — you submit on reddit.com when due. No server auto-post, reducing lower ban risk.`;
}
