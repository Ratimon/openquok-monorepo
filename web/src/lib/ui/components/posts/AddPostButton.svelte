<script lang="ts">
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	export type PostCommentMode = 'ALL' | 'POST' | 'COMMENT';

	export type TranslateFn = (key: string, fallback: string) => string;

	type Props = {
		onclick: () => void;
		postComment: PostCommentMode;
		onOpenPlugSettings?: () => void;
		disabled?: boolean;
		t?: TranslateFn;
	};

	let { onclick, postComment, onOpenPlugSettings = undefined, disabled = false, t }: Props = $props();

	const [labelKey, labelFallback] = $derived.by((): [string, string] => {
		// Mirror the original flow: choose a translation key + fallback by postComment mode.
		// Note: upstream's `add_post` fallback is "Add post in a thread".
		if (postComment === 'POST') return ['add_post', 'Add post in a thread'];
		if (postComment === 'COMMENT') return ['add_comment', 'Add comment'];
		return ['add_comment_or_post', 'Add comment or post'];
	});

	const label = $derived((t ? t(labelKey, labelFallback) : labelFallback) ?? labelFallback);
</script>

<div class="mt-[12px] flex flex-wrap items-center gap-2">
	<button
		type="button"
		onclick={onclick}
		disabled={disabled}
		class="select-none cursor-pointer h-[34px] rounded-[6px] flex bg-[#D82D7E] gap-[8px] justify-center items-center pl-[16px] pr-[20px] text-[13px] font-[600] text-white disabled:opacity-60 disabled:cursor-not-allowed"
	>
		<AbstractIcon name={icons.Plus.name} class="size-4" width="16" height="16" />
		<span>{label}</span>
	</button>

	{#if onOpenPlugSettings}
		<button
			type="button"
			onclick={onOpenPlugSettings}
			disabled={disabled}
			class="select-none cursor-pointer h-[34px] rounded-[6px] flex border border-base-300 bg-base-100/40 gap-[8px] justify-center items-center px-[14px] text-[13px] font-[600] text-base-content/80 hover:bg-base-100/70 disabled:opacity-60 disabled:cursor-not-allowed"
		>
			<AbstractIcon name={icons.Cog.name} class="size-4" width="16" height="16" />
			<span>Plug settings</span>
		</button>
	{/if}
</div>

