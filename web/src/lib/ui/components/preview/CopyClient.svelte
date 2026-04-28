<script lang="ts">
	import Button from '$lib/ui/buttons/Button.svelte';
	import { toast } from '$lib/ui/sonner';

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
</script>

<Button type="button" onclick={() => void copyLink()}>
	Share with Others
</Button>

