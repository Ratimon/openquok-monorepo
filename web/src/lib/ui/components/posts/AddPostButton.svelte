<script lang="ts">
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	export type PostCommentMode = 'ALL' | 'POST' | 'COMMENT';

	export type TranslateFn = (key: string, fallback: string) => string;

	type Props = {
		onclick: () => void;
		postComment: PostCommentMode;
		disabled?: boolean;
		t?: TranslateFn;
	};

	let { onclick, postComment, disabled = false, t }: Props = $props();

	const [labelKey, labelFallback] = $derived.by((): [string, string] => {
		// Mirror the original flow: choose a translation key + fallback by postComment mode.
		// Note: upstream's `add_post` fallback is "Add post in a thread".
		if (postComment === 'POST') return ['add_post', 'Add post in a thread'];
		if (postComment === 'COMMENT') return ['add_comment', 'Add comment'];
		return ['add_comment_or_post', 'Add comment or post'];
	});

	const label = $derived((t ? t(labelKey, labelFallback) : labelFallback) ?? labelFallback);
</script>

<div class="flex">
	<button
		type="button"
		onclick={onclick}
		disabled={disabled}
		class="select-none cursor-pointer h-[34px] rounded-[6px] flex bg-[#D82D7E] gap-[8px] justify-center items-center pl-[16px] pr-[20px] text-[13px] font-[600] mt-[12px] text-white disabled:opacity-60 disabled:cursor-not-allowed"
	>
		<AbstractIcon name={icons.Plus.name} class="size-4" width="16" height="16" />
		<span>{label}</span>
	</button>
</div>

