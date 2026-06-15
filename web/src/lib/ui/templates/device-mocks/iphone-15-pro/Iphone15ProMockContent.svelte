<script lang="ts">
	import type { IphoneMockContentId } from '$lib/ui/templates/device-mocks/iphone-15-pro/iphoneMock.types';

	import OpenquokLoginMock from '$lib/ui/templates/device-mocks/iphone-15-pro/content/OpenquokLoginMock.svelte';
	import TelegramAnalyticsMock from '$lib/ui/templates/device-mocks/iphone-15-pro/content/TelegramAnalyticsMock.svelte';
	import TelegramConnectMock from '$lib/ui/templates/device-mocks/iphone-15-pro/content/TelegramConnectMock.svelte';

	type Props = {
		content?: IphoneMockContentId;
	};

	let { content }: Props = $props();
</script>

{#if content === 'telegram-connect'}
	<TelegramConnectMock />
{:else if content === 'openquok-login'}
	<OpenquokLoginMock />
{:else if content === 'telegram-analytics'}
	<TelegramAnalyticsMock />
{/if}
