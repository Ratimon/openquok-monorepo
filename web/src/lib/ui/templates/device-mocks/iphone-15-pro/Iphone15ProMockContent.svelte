<script lang="ts">
	import type { IphoneMockContentId } from '$lib/ui/templates/device-mocks/iphone-15-pro/iphoneMock.types';

	import TelegramConnectMock from '$lib/ui/templates/device-mocks/iphone-15-pro/content/TelegramConnectMock.svelte';

	type Props = {
		content?: IphoneMockContentId;
	};

	let { content }: Props = $props();
</script>

{#if content === 'telegram-connect'}
	<TelegramConnectMock />
{/if}
