<script lang="ts">
	import type { IconName } from '$data/icons';

	import type { PublicAgentFeatureSection } from '$lib/content/constants/agents';
	import type { IphoneMockContentId } from '$lib/ui/templates/device-mocks/iphone-15-pro/iphoneMock.types';
	import type { TelegramMockAgentBranding } from '$lib/ui/templates/device-mocks/iphone-15-pro/telegramMockBranding';

	import AnimatedBeamMultipleAgent from '$lib/ui/templates/landing-page/AnimatedBeamMultipleAgent.svelte';
	import AnimatedBeamSingleChannel from '$lib/ui/templates/landing-page/AnimatedBeamSingleChannel.svelte';
	import Iphone15ProMock from '$lib/ui/templates/device-mocks/iphone-15-pro/Iphone15ProMock.svelte';
	import Iphone15ProMockContent from '$lib/ui/templates/device-mocks/iphone-15-pro/Iphone15ProMockContent.svelte';

	type Props = {
		section: Pick<
			PublicAgentFeatureSection,
			'deviceMockContent' | 'imageAlt' | 'subtitle'
		>;
		telegramAgentBranding?: TelegramMockAgentBranding;
		channelIconName?: IconName | null;
	};

	let { section, telegramAgentBranding, channelIconName = null }: Props = $props();
</script>

<div
	class="flex h-full w-full flex-col items-center gap-6 sm:flex-row sm:items-stretch sm:gap-4"
	aria-hidden="true"
>
	<div class="flex min-h-72 min-w-0 flex-1 items-stretch">
		{#if channelIconName}
			<AnimatedBeamSingleChannel {channelIconName} />
		{:else}
			<AnimatedBeamMultipleAgent />
		{/if}
	</div>
	<div
		class="mx-auto flex h-[360px] w-full max-w-[200px] shrink-0 items-center justify-center overflow-hidden sm:h-full sm:max-w-[220px] lg:max-w-[240px]"
		role="img"
		aria-label={section.imageAlt ?? section.subtitle}
	>
		<Iphone15ProMock class="h-full w-auto max-w-full">
			<Iphone15ProMockContent
				content={section.deviceMockContent as IphoneMockContentId | undefined}
				{telegramAgentBranding}
			/>
		</Iphone15ProMock>
	</div>
</div>
