/**
 * Maintainer map for **`/agents/{mcpSlug}/{channelSlug}`** (MCP client × social channel).
 *
 * There is no `mcps/channels/{channelSlug}.ts` tree — unlike skill-based agent hosts, MCP channel
 * landings are **composed at runtime** from:
 *
 * | What you change | Where |
 * | --- | --- |
 * | MCP client hero, setup steps, FAQ, features | `mcps/hosts/{mcpSlug}.ts` (+ `mcps/general.ts`, `mergeMcpLandingFaqItems`, register in `mcps/seeds.ts`) |
 * | Social network identity, bento, channel FAQ | `channels/catalog/platforms/{channelSlug}.ts` (+ `catalog/seeds.ts`) |
 * | How base + channel merge into the page VM | `web/src/lib/content/utils/buildMcpChannelLandingVm.ts` |
 * | Routing, hub grid links, slug resolution | `agents/channels/index.ts` (`getPublicAgentChannelBySlug`, `listPublicAgentChannelsForHub`) |
 *
 * **Skill-based agent hosts** (OpenClaw, Grok Bot, Hermes, ThinkRail) use host-first overrides in
 * `agents/channels/{host}.ts` when copy must differ per host×channel — see `PUBLIC_AGENT_CHANNEL_HOST_SLUGS`.
 *
 * Registry entry: `publicProgrammaticLandingRegistry.ts` → surface id `mcp-channel`.
 */

export { buildMcpChannelLandingVm } from '$lib/content/utils/buildMcpChannelLandingVm';
