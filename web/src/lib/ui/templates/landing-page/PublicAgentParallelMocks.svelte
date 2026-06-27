<script lang="ts">
	import type { PublicAgentParallelMockItem } from '$lib/content/constants/publicAgentConfig';
	import type { DesktopMockContentId } from '$lib/ui/templates/device-mocks/desktop/desktopMock.types';
	import type { IphoneMockContentId } from '$lib/ui/templates/device-mocks/iphone-15-pro/iphoneMock.types';
	import type { TerminalMockContentId } from '$lib/ui/templates/device-mocks/terminal/terminalMock.types';
	import type { TelegramMockAgentBranding } from '$lib/ui/templates/device-mocks/iphone-15-pro/telegramMockBranding';

	import { cn } from '$lib/ui/helpers/common';

	import DesktopMock from '$lib/ui/templates/device-mocks/desktop/DesktopMock.svelte';
	import DesktopMockContent from '$lib/ui/templates/device-mocks/desktop/DesktopMockContent.svelte';
	import Iphone15ProMock from '$lib/ui/templates/device-mocks/iphone-15-pro/Iphone15ProMock.svelte';
	import Iphone15ProMockContent from '$lib/ui/templates/device-mocks/iphone-15-pro/Iphone15ProMockContent.svelte';
	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';
	import TerminalCommandMockContent from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMockContent.svelte';

	type Props = {
		items: PublicAgentParallelMockItem[];
		sectionSubtitle: string;
		telegramAgentBranding?: TelegramMockAgentBranding;
	};

	let { items, sectionSubtitle, telegramAgentBranding }: Props = $props();

	const isThreeUpLayout = $derived(items.length === 3);

	function itemLayoutClass(index: number, total: number): string {
		if (total === 3) {
			if (index === 0) {
				return 'absolute left-0 top-0 z-10 w-[76%] max-w-md sm:w-[70%]';
			}

			if (index === 1) {
				return 'absolute left-[5%] top-[22%] z-20 w-[76%] max-w-md sm:left-[7%] sm:top-[26%] sm:w-[70%]';
			}

			return 'absolute right-0 bottom-0 z-30 w-[44%] max-w-[168px] sm:max-w-[190px] lg:max-w-[210px]';
		}

		if (total <= 1) return 'relative w-full';

		if (index === 0) {
			return 'relative z-10 w-full sm:max-w-[88%]';
		}

		return 'relative z-20 -mt-6 w-full sm:-mt-10 sm:ml-auto sm:max-w-[88%]';
	}
</script>

<div
	class={cn(
		'relative mx-auto w-full py-2',
		isThreeUpLayout
			? 'min-h-[400px] max-w-2xl sm:min-h-[460px] lg:min-h-[500px] lg:max-w-3xl'
			: 'flex max-w-xl flex-col gap-0 sm:max-w-2xl lg:max-w-3xl'
	)}
	role="img"
	aria-label={items.map((item) => item.imageAlt).filter(Boolean).join('; ') || sectionSubtitle}
>
	{#each items as item, index (index)}
		<div class={itemLayoutClass(index, items.length)}>
			{#if item.deviceMock === 'terminal'}
				{#if item.terminalCode}
					<TerminalCommandMock
						code={item.terminalCode}
						ariaLabel={item.imageAlt ?? sectionSubtitle}
						class="text-[12px] shadow-xl sm:text-[13px]"
					/>
				{:else}
					<TerminalCommandMockContent
						content={item.deviceMockContent as TerminalMockContentId | undefined}
					/>
				{/if}
			{:else if item.deviceMock === 'desktop'}
				<div
					class={cn(
						'overflow-hidden shadow-2xl',
						index > 0 && items.length > 1 && !isThreeUpLayout && 'scale-[0.96] sm:scale-[0.98]'
					)}
					role="img"
					aria-label={item.imageAlt ?? sectionSubtitle}
				>
					<DesktopMock class="size-full">
						<DesktopMockContent
							content={item.deviceMockContent as DesktopMockContentId | undefined}
							{telegramAgentBranding}
						/>
					</DesktopMock>
				</div>
			{:else if item.deviceMock === 'iphone-15-pro'}
				<div
					class={cn(
						'mx-auto flex items-center justify-center overflow-hidden drop-shadow-2xl',
						isThreeUpLayout
							? 'h-[260px] w-full sm:h-[300px] lg:h-[320px]'
							: 'h-[300px] w-full max-w-[220px] sm:h-[340px] sm:max-w-[240px]',
						index > 0 && items.length > 1 && !isThreeUpLayout && 'scale-[0.94] sm:scale-[0.96]'
					)}
					role="img"
					aria-label={item.imageAlt ?? sectionSubtitle}
				>
					<Iphone15ProMock class="h-full w-auto max-w-full">
						<Iphone15ProMockContent
							content={item.deviceMockContent as IphoneMockContentId | undefined}
							{telegramAgentBranding}
						/>
					</Iphone15ProMock>
				</div>
			{/if}
		</div>
	{/each}
</div>
