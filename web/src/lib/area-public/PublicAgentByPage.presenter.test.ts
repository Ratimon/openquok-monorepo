import { describe, expect, it } from 'vitest';

import {
	isPublicMcpLandingPage,
	PublicAgentByPagePresenter
} from '$lib/area-public/PublicAgentByPage.presenter.svelte';
import { getPublicChannelBySlug } from '$lib/content/constants/channels';

describe('PublicAgentByPagePresenter.loadAgentChannelStateless', () => {
	const presenter = new PublicAgentByPagePresenter();

	it('resolves claude-code × peerpush as an MCP directory channel landing', () => {
		const page = presenter.loadAgentChannelStateless('claude-code', 'peerpush');

		expect(page).not.toBeNull();
		expect(page!.channelSlug).toBe('peerpush');
		expect(page!.channelLabel).toBe('PeerPush');
		expect(page!.cliExamplesPath).toBe('/docs/cli-examples/peerpush');
		expect(isPublicMcpLandingPage(page!.landingVm)).toBe(true);

		const vm = page!.landingVm;
		expect(vm.heroTitle).toContain('PeerPush');
		expect(vm.heroDescription).not.toMatch(/calendar|kanban|schedule.*posts/i);
		expect(page!.landingVm.audienceTitle).toContain('OpenQuok');
		expect(vm.workflowSection?.deviceMockContent).toBe('mcp-directory-launch-claude-code');
	});

	it('aligns claude-code × peerpush with catalog directory themes (manual /agents/claude-code/peerpush QA)', () => {
		const catalog = getPublicChannelBySlug('peerpush');
		const page = presenter.loadAgentChannelStateless('claude-code', 'peerpush');

		expect(catalog).toBeDefined();
		expect(page).not.toBeNull();

		expect(catalog!.metaDescription).toMatch(/domain rating/i);
		expect(page!.landingVm.metaDescription).toMatch(/domain rating|listing readiness/i);
		expect(page!.landingVm.workflowSection?.subtitle).toBe('Prompt from your terminal');
		expect(page!.landingVm.heroDescription).not.toMatch(/schedule.*posts|kanban/i);
		expect(catalog!.heroDescription).toContain('peerpush.com');
	});

	it('keeps openclaw × facebook as a social agent channel landing', () => {
		const page = presenter.loadAgentChannelStateless('openclaw', 'facebook');

		expect(page).not.toBeNull();
		expect(page!.landingVm.heroTitle).toContain('Schedule');
		expect(page!.landingVm.heroTitle).toContain('Facebook');
		expect(page!.landingVm.heroDescription).toContain('Telegram');
	});
});
