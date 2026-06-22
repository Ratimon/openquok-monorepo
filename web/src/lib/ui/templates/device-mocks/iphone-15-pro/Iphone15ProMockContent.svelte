<script lang="ts">
	import type { IconName } from '$data/icons';

	import type { IphoneMockContentId } from '$lib/ui/templates/device-mocks/iphone-15-pro/iphoneMock.types';
	import OpenquokLoginMock from '$lib/ui/templates/device-mocks/iphone-15-pro/content/OpenquokLoginMock.svelte';
	import TelegramAnalyticsMock from '$lib/ui/templates/device-mocks/iphone-15-pro/content/TelegramAnalyticsMock.svelte';
	import TelegramConnectMock from '$lib/ui/templates/device-mocks/iphone-15-pro/content/TelegramConnectMock.svelte';
	import type { TelegramMockAgentBranding } from '$lib/ui/templates/device-mocks/iphone-15-pro/telegramMockBranding';
	import { DEFAULT_TELEGRAM_MOCK_AGENT_BRANDING } from '$lib/ui/templates/device-mocks/iphone-15-pro/telegramMockBranding';

	type Props = {
		content?: IphoneMockContentId;
		telegramAgentBranding?: TelegramMockAgentBranding;
	};

	let {
		content,
		telegramAgentBranding = DEFAULT_TELEGRAM_MOCK_AGENT_BRANDING
	}: Props = $props();

	let agentIcon = $derived(telegramAgentBranding.agentIcon);
	let agentLabel = $derived(telegramAgentBranding.agentLabel);
</script>

{#if content === 'telegram-connect'}
	<TelegramConnectMock {agentIcon} {agentLabel} />
{:else if content === 'openquok-login'}
	<OpenquokLoginMock {agentIcon} {agentLabel} />
{:else if content === 'telegram-analytics'}
	<TelegramAnalyticsMock {agentIcon} {agentLabel} />
{/if}
