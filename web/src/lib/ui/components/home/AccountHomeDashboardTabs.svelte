<script lang="ts">
	import type { Snippet } from 'svelte';

	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Tabs from '$lib/ui/tabs';

	export type AccountHomeDashboardTab = 'channels' | 'posts' | 'feed';

	type Props = {
		activeTab?: AccountHomeDashboardTab;
		showPostsTab: boolean;
		feedUnreadCount?: number;
		channels: Snippet;
		posts: Snippet;
		feed: Snippet;
	};

	let {
		activeTab = $bindable<AccountHomeDashboardTab>('channels'),
		showPostsTab,
		feedUnreadCount = 0,
		channels,
		posts,
		feed
	}: Props = $props();

	const tabTriggerClass =
		'relative inline-flex h-auto min-h-0 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md border-0 !border-b-0 bg-transparent px-2 py-2 text-xs font-medium text-base-content/65 transition-colors sm:px-3 sm:text-sm hover:bg-base-content/10 hover:text-base-content [&.tab-active]:bg-primary [&.tab-active]:font-semibold [&.tab-active]:text-primary-content [&.tab-active]:shadow-md';

	function switchToFeed(): void {
		activeTab = 'feed';
	}
</script>

<div class="min-w-0 space-y-4">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<Tabs.Root bind:value={activeTab} class="min-w-0 flex-1">
			<Tabs.List
				class="grid w-full grid-cols-3 gap-1 rounded-xl bg-base-200 p-1 sm:inline-flex sm:w-auto sm:grid-cols-none"
			>
				<Tabs.Trigger value="channels" class={tabTriggerClass}>
					<AbstractIcon
						name={icons.Grid2x2.name}
						class="size-4 shrink-0"
						width="16"
						height="16"
						aria-hidden="true"
					/>
					<span class="truncate">Channels</span>
				</Tabs.Trigger>
				<Tabs.Trigger value="posts" class={tabTriggerClass}>
					<AbstractIcon
						name={icons.Columns2.name}
						class="size-4 shrink-0"
						width="16"
						height="16"
						aria-hidden="true"
					/>
					<span class="truncate">Posts</span>
				</Tabs.Trigger>
				<Tabs.Trigger value="feed" class={tabTriggerClass}>
					<AbstractIcon
						name={icons.Bell.name}
						class="size-4 shrink-0"
						width="16"
						height="16"
						aria-hidden="true"
					/>
					<span class="truncate">Feed</span>
					{#if feedUnreadCount > 0}
						<span
							class="absolute right-1 top-1 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-semibold leading-none text-primary-content sm:right-0.5 sm:top-0.5"
							aria-hidden="true"
						>
							{feedUnreadCount > 99 ? '99+' : String(feedUnreadCount)}
						</span>
					{/if}
				</Tabs.Trigger>
			</Tabs.List>
		</Tabs.Root>

		<Button
			type="button"
			variant={activeTab === 'feed' ? 'secondary' : 'outline'}
			size="sm"
			class="relative hidden shrink-0 gap-1.5 self-end sm:inline-flex sm:self-auto"
			onclick={switchToFeed}
			aria-pressed={activeTab === 'feed'}
		>
			<AbstractIcon name={icons.Bell.name} class="size-4" width="16" height="16" aria-hidden="true" />
			<span class="hidden sm:inline">Feed</span>
			{#if feedUnreadCount > 0}
				<span
					class="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-content"
					aria-hidden="true"
				>
					{feedUnreadCount > 99 ? '99+' : String(feedUnreadCount)}
				</span>
			{/if}
		</Button>
	</div>

	<div class="min-w-0">
		{#if activeTab === 'channels'}
			{@render channels()}
		{:else if activeTab === 'posts' && showPostsTab}
			<div class="min-w-0 overflow-x-auto">
				{@render posts()}
			</div>
		{:else if activeTab === 'posts' && !showPostsTab}
			<p class="rounded-lg border border-dashed border-base-300 bg-base-100/50 px-4 py-8 text-center text-sm text-base-content/70">
				Connect a social channel on the Channels tab to manage posts on the board.
			</p>
		{:else if activeTab === 'feed'}
			{@render feed()}
		{/if}
	</div>
</div>
