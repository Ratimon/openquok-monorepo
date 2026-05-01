<script lang="ts">
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		/** Optional reply count next to the comment icon (main post uses total scheduled replies). */
		commentCount?: number;
		class?: string;
	};

	let { commentCount = 0, class: className = '' }: Props = $props();
</script>

<div
	class="mt-2 flex max-w-full flex-wrap items-center gap-x-5 gap-y-1 text-base-content {className}"
	aria-hidden="true"
>
	<span class="inline-flex items-center rounded-full p-1.5 text-base-content/85">
		<AbstractIcon name={icons.ThreadsActionLike.name} class="size-[22px]" width="22" height="22" />
	</span>
	<span class="inline-flex items-center gap-1.5 rounded-full p-1.5 text-base-content/85">
		<AbstractIcon name={icons.ThreadsActionComment.name} class="size-[22px]" width="22" height="22" />
		{#if commentCount > 0}
			<span class="min-w-[1ch] text-[14px] leading-none tabular-nums text-base-content/80">
				{commentCount}
			</span>
		{/if}
	</span>
	<span class="inline-flex items-center rounded-full p-1.5 text-base-content/85">
		<AbstractIcon name={icons.ThreadsActionRepost.name} class="size-[22px]" width="22" height="22" />
	</span>
	<span class="inline-flex items-center rounded-full p-1.5 text-base-content/85">
		<AbstractIcon name={icons.ThreadsActionSend.name} class="size-[22px]" width="22" height="22" />
	</span>
</div>
