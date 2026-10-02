<script lang="ts">
	import { icons } from '$data/icons';

	import { cn } from '$lib/ui/helpers/common';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type ToggleResult = { ok: true; bookmarked: boolean } | { ok: false; error: string };

	type Props = {
		siteId: string;
		siteSlug: string;
		isBookmarked?: boolean;
		disabled?: boolean;
		size?: 'sm' | 'md';
		class?: string;
		onToggle: (params: { siteId: string; siteSlug: string }) => Promise<ToggleResult>;
	};

	let {
		siteId,
		siteSlug,
		isBookmarked = false,
		disabled = false,
		size = 'sm',
		class: className = '',
		onToggle
	}: Props = $props();

	let bookmarked = $state(false);
	let busy = $state(false);

	$effect(() => {
		bookmarked = isBookmarked;
	});

	const label = $derived(bookmarked ? 'Remove saved site' : 'Save site');
	const buttonSize = $derived(size === 'sm' ? 'sm' : 'default');

	async function handleClick(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		if (busy || disabled) return;

		busy = true;
		try {
			const result = await onToggle({ siteId, siteSlug });
			if (result.ok) {
				bookmarked = result.bookmarked;
			}
		} finally {
			busy = false;
		}
	}
</script>

<Button
	type="button"
	variant={bookmarked ? 'primary' : 'outline'}
	size={buttonSize}
	class={cn(
		bookmarked
			? 'border-primary shadow-sm shadow-primary/20'
			: 'border-base-300/80 bg-base-100/80 text-base-content/70 hover:border-primary/40 hover:text-primary',
		className
	)}
	aria-pressed={bookmarked}
	aria-label={label}
	title={label}
	disabled={disabled || busy}
	onclick={handleClick}
>
	{#if bookmarked}
		<AbstractIcon
			name={icons.Star.name}
			class="size-4 fill-primary-content text-primary-content"
			width="16"
			height="16"
			aria-hidden="true"
		/>
	{:else}
		<AbstractIcon
			name={icons.Bookmark.name}
			class="size-4"
			width="16"
			height="16"
			aria-hidden="true"
		/>
	{/if}
	<span class="sr-only">{label}</span>
</Button>
