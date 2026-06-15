<script lang="ts">
	import type { PublicAgentFeatureSection } from '$lib/content/constants/publicAgentConfig';
	import type { IphoneMockContentId } from '$lib/ui/templates/device-mocks/iphone-15-pro/iphoneMock.types';
	import type { SafariMockContentId } from '$lib/ui/templates/device-mocks/safari/safariMock.types';
	import type { TerminalMockContentId } from '$lib/ui/templates/device-mocks/terminal/terminalMock.types';

	import Iphone15ProMock from '$lib/ui/templates/device-mocks/iphone-15-pro/Iphone15ProMock.svelte';
	import Iphone15ProMockContent from '$lib/ui/templates/device-mocks/iphone-15-pro/Iphone15ProMockContent.svelte';
	import SafariMock from '$lib/ui/templates/device-mocks/safari/SafariMock.svelte';
	import SafariMockContent from '$lib/ui/templates/device-mocks/safari/SafariMockContent.svelte';
	import TerminalCommandMockContent from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMockContent.svelte';

	type Props = {
		section: Pick<
			PublicAgentFeatureSection,
			'deviceMock' | 'deviceMockContent' | 'imageAlt' | 'subtitle'
		>;
	};

	let { section }: Props = $props();
</script>

{#if section.deviceMock === 'safari'}
	<div class="aspect-auto size-full overflow-hidden" role="img" aria-label={section.imageAlt ?? section.subtitle}>
		<SafariMock class="size-full">
			<SafariMockContent content={section.deviceMockContent as SafariMockContentId | undefined} />
		</SafariMock>
	</div>
{:else if section.deviceMock === 'iphone-15-pro'}
	<div
		class="mx-auto flex h-[420px] w-full max-w-[260px] items-center justify-center overflow-hidden sm:h-[460px] sm:max-w-[280px] lg:h-[500px] lg:max-w-[300px]"
		role="img"
		aria-label={section.imageAlt ?? section.subtitle}
	>
		<Iphone15ProMock class="h-full w-auto max-w-full">
			<Iphone15ProMockContent content={section.deviceMockContent as IphoneMockContentId | undefined} />
		</Iphone15ProMock>
	</div>
{:else if section.deviceMock === 'terminal'}
	<TerminalCommandMockContent
		content={section.deviceMockContent as TerminalMockContentId | undefined}
	/>
{/if}
