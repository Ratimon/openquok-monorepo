<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { toast } from '$lib/ui/sonner';

	type Props = {
		/** When false, shows a locked control and calls `onUpgradeRequired` instead of copying. */
		enabled?: boolean;
		onUpgradeRequired?: () => void;
	};

	let { enabled = true, onUpgradeRequired }: Props = $props();

	function shareUrlWithoutQuery(): string {
		if (typeof window === 'undefined') return '';
		return window.location.href.split('?')[0] ?? window.location.href;
	}

	async function copyLink(): Promise<void> {
		try {
			await navigator.clipboard.writeText(shareUrlWithoutQuery());
			toast.success('Link copied to clipboard');
		} catch {
			toast.error('Could not copy link');
		}
	}

	function handleClick(): void {
		if (!enabled) {
			onUpgradeRequired?.();
			return;
		}
		void copyLink();
	}
</script>

<Button
	type="button"
	class="gap-1.5"
	variant={enabled ? 'primary' : 'warning'}
	onclick={handleClick}
>
	{#if !enabled}
		<AbstractIcon name={icons.Lock.name} class="size-4" width="16" height="16" focusable="false" />
	{/if}
	Share with Others
</Button>
