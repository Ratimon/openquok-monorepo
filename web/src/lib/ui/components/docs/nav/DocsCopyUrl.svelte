<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	let copied = $state(false);

	function copyUrl() {
		const url = page.url.href;
		void navigator.clipboard.writeText(url).then(() => {
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		});
	}
</script>

<Button variant="ghost" size="icon" onclick={copyUrl} aria-label="Copy page URL">
	{#if copied}
		<AbstractIcon name="Check" class="size-4" width="16" height="16" />
	{:else}
		<AbstractIcon name="Link" class="size-4" width="16" height="16" />
	{/if}
</Button>
