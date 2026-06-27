<script lang="ts">
	import type { PublicAgentFeatureSection } from '$lib/content/constants/publicAgentConfig';
	import type { DesktopMockContentId } from '$lib/ui/templates/device-mocks/desktop/desktopMock.types';
	import type { IphoneMockContentId } from '$lib/ui/templates/device-mocks/iphone-15-pro/iphoneMock.types';
	import type { SafariMockContentId } from '$lib/ui/templates/device-mocks/safari/safariMock.types';
	import type { SettingsPanelMockContentId } from '$lib/ui/templates/device-mocks/settings-panel/settingsPanelMock.types';
	import type { TerminalMockContentId } from '$lib/ui/templates/device-mocks/terminal/terminalMock.types';
	import type { TelegramMockAgentBranding } from '$lib/ui/templates/device-mocks/iphone-15-pro/telegramMockBranding';

	import DesktopMock from '$lib/ui/templates/device-mocks/desktop/DesktopMock.svelte';
	import DesktopMockContent from '$lib/ui/templates/device-mocks/desktop/DesktopMockContent.svelte';
	import Iphone15ProMock from '$lib/ui/templates/device-mocks/iphone-15-pro/Iphone15ProMock.svelte';
	import Iphone15ProMockContent from '$lib/ui/templates/device-mocks/iphone-15-pro/Iphone15ProMockContent.svelte';
	import SafariMock from '$lib/ui/templates/device-mocks/safari/SafariMock.svelte';
	import SafariMockContent from '$lib/ui/templates/device-mocks/safari/SafariMockContent.svelte';
	import SettingsPanelMockContent from '$lib/ui/templates/device-mocks/settings-panel/SettingsPanelMockContent.svelte';
	import TerminalCommandMockContent from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMockContent.svelte';

	type Props = {
		section: Pick<
			PublicAgentFeatureSection,
			'deviceMock' | 'deviceMockContent' | 'imageAlt' | 'subtitle'
		>;
		telegramAgentBranding?: TelegramMockAgentBranding;
	};

	let { section, telegramAgentBranding }: Props = $props();
</script>

{#if section.deviceMock === 'desktop'}
	<div
		class="aspect-auto size-full overflow-hidden"
		role="img"
		aria-label={section.imageAlt ?? section.subtitle}
	>
		<DesktopMock class="size-full">
			<DesktopMockContent
				content={section.deviceMockContent as DesktopMockContentId | undefined}
				{telegramAgentBranding}
			/>
		</DesktopMock>
	</div>
{:else if section.deviceMock === 'settings-panel'}
	<div
		class="aspect-auto size-full overflow-hidden rounded-xl border border-base-content/10 shadow-lg"
		role="img"
		aria-label={section.imageAlt ?? section.subtitle}
	>
		<SettingsPanelMockContent
			content={section.deviceMockContent as SettingsPanelMockContentId | undefined}
		/>
	</div>
{:else if section.deviceMock === 'safari'}
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
			<Iphone15ProMockContent
				content={section.deviceMockContent as IphoneMockContentId | undefined}
				{telegramAgentBranding}
			/>
		</Iphone15ProMock>
	</div>
{:else if section.deviceMock === 'terminal'}
	<TerminalCommandMockContent
		content={section.deviceMockContent as TerminalMockContentId | undefined}
	/>
{/if}
