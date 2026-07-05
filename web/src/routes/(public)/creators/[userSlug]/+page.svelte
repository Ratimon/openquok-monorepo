<script lang="ts">
	import type { PageData } from './$types';

	import { getRootPathPublicCreators } from '$lib/area-public/constants/getRootPathPublicCreators';
	import { url } from '$lib/utils/path';

	import * as Avatar from '$lib/ui/components/avatar';
	import ListingHubBreadcrumb from '$lib/ui/components/extensions/ListingHubBreadcrumb.svelte';
	import SupabaseUserAvatar from '$lib/ui/supabase/SupabaseUserAvatar.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import ExtensionCard from '$lib/ui/templates/extensions/ExtensionCard.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import SubSectionInnerContainer from '$lib/ui/layouts/SubSectionInnerContainer.svelte';
	import SubSectionOuterContainer from '$lib/ui/layouts/SubSectionOuterContainer.svelte';
	import StackHubCard from '$lib/ui/templates/stacks/StackHubCard.svelte';
	import * as Tabs from '$lib/ui/tabs';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let creator = $derived(data.creator);
	let buildingBlocks = $derived(data.buildingBlocks);
	let playbooks = $derived(data.playbooks);
	let displayName = $derived(data.displayName);

	const creatorsIndexHref = url(`/${getRootPathPublicCreators()}`);

	let activeTab = $state<'building-blocks' | 'playbooks'>('building-blocks');

	$effect.pre(() => {
		activeTab =
			buildingBlocks.length === 0 && playbooks.length > 0 ? 'playbooks' : 'building-blocks';
	});

	function statLabel(count: number, singular: string, plural: string): string {
		return count === 1 ? `1 ${singular}` : `${count} ${plural}`;
	}
</script>

<SectionOuterContainer class="bg-base-100">
	<SubSectionOuterContainer class="md:py-10">
		<SubSectionInnerContainer class="max-w-7xl py-8">
			<ListingHubBreadcrumb
				hubHref={creatorsIndexHref}
				hubLabel="Creators"
				pageTitle={displayName}
				class="mb-6"
			/>
			<div class="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
				<div class="flex flex-col gap-6 sm:flex-row sm:items-start">
					<Avatar.Root class="size-24 shrink-0 rounded-full">
						<SupabaseUserAvatar
							url={creator.avatarUrl}
							size={96}
							alt={displayName}
							imageOnly
						/>
						<Avatar.Fallback>
							{displayName.charAt(0).toUpperCase()}
						</Avatar.Fallback>
					</Avatar.Root>
					<div>
						<h1 class="mb-2 text-3xl font-bold">{displayName}</h1>
						{#if creator.username}
							<p class="mb-3 text-sm text-base-content/60">@{creator.username}</p>
						{/if}
						{#if creator.tagLine}
							<p class="mb-4 text-base-content/70">{creator.tagLine}</p>
						{/if}
						<div class="flex flex-wrap gap-3 text-sm text-base-content/70">
							<span>{statLabel(creator.extensionCount, 'building block', 'building blocks')}</span>
							<span aria-hidden="true">·</span>
							<span>{statLabel(creator.stackCount, 'playbook', 'playbooks')}</span>
							<span aria-hidden="true">·</span>
							<span>{statLabel(creator.totalLikes, 'like', 'likes')}</span>
							<span aria-hidden="true">·</span>
							<span>{statLabel(creator.totalBookmarks, 'bookmark', 'bookmarks')}</span>
						</div>
					</div>
				</div>
				<Button variant="outline" href={creatorsIndexHref}>All creators</Button>
			</div>

			<Tabs.Root bind:value={activeTab} class="w-full space-y-6">
				<Tabs.List class="grid w-full max-w-md grid-cols-2">
					<Tabs.Trigger value="building-blocks">
						Building blocks ({buildingBlocks.length})
					</Tabs.Trigger>
					<Tabs.Trigger value="playbooks">
						Playbooks ({playbooks.length})
					</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content value="building-blocks">
					{#if buildingBlocks.length === 0}
						<p class="rounded-2xl border border-dashed border-base-content/15 p-8 text-center text-base-content/70">
							No published building blocks yet.
						</p>
					{:else}
						<ul class="grid grid-cols-1 gap-4">
							{#each buildingBlocks as extensionVm (extensionVm.id)}
								<li>
									<ExtensionCard extensionVm={extensionVm} expanded={false} />
								</li>
							{/each}
						</ul>
					{/if}
				</Tabs.Content>

				<Tabs.Content value="playbooks">
					{#if playbooks.length === 0}
						<p class="rounded-2xl border border-dashed border-base-content/15 p-8 text-center text-base-content/70">
							No published playbooks yet.
						</p>
					{:else}
						<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{#each playbooks as stackVm (stackVm.id)}
								<li>
									<StackHubCard
										stackVm={stackVm}
										showOwnerSubtitle={false}
									/>
								</li>
							{/each}
						</ul>
					{/if}
				</Tabs.Content>
			</Tabs.Root>
		</SubSectionInnerContainer>
	</SubSectionOuterContainer>
</SectionOuterContainer>
