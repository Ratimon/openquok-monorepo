<script lang="ts">
	import type { WorkspaceChannelGroupViewModel } from '$lib/channels';
	import type { AutoLaunchProductProfileDto } from '$lib/auto-launch/auto-launch.types';

	import { getRootPathAccount, getRootPathProducts } from '$lib/area-protected';
	import { autoLaunchRepository } from '$lib/auto-launch';
	import { route } from '$lib/utils/path';
	import { icons } from '$data/icons';

	import AddDirectoryLaunch from '$lib/ui/components/auto-launch/AddDirectoryLaunch.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		workspaceId: string | null;
		channelGroups: WorkspaceChannelGroupViewModel[];
	};

	let { workspaceId, channelGroups }: Props = $props();

	const productsPath = route(`${getRootPathAccount()}/${getRootPathProducts()}`);

	let profiles = $state<AutoLaunchProductProfileDto[]>([]);
	let loading = $state(false);

	const groupedProfiles = $derived.by(() => {
		const byGroup = new Map<string | 'ungrouped', AutoLaunchProductProfileDto[]>();
		for (const profile of profiles) {
			const key = profile.integrationCustomerId ?? 'ungrouped';
			const list = byGroup.get(key) ?? [];
			list.push(profile);
			byGroup.set(key, list);
		}
		return byGroup;
	});

	function groupLabel(integrationCustomerId: string | 'ungrouped'): string {
		if (integrationCustomerId === 'ungrouped') return 'Workspace products';
		return channelGroups.find((g) => g.id === integrationCustomerId)?.name ?? 'Channel group';
	}

	$effect(() => {
		if (!workspaceId) {
			profiles = [];
			return;
		}
		loading = true;
		void autoLaunchRepository.listProfiles(workspaceId).then((rows) => {
			profiles = rows;
			loading = false;
		});
	});
</script>

<section class="mt-10 border-t border-base-300 pt-8" aria-labelledby="directory-launches-heading">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 id="directory-launches-heading" class="text-lg font-semibold text-base-content">
				Directory launches
			</h2>
			<p class="mt-1 text-sm text-base-content/70">
				Product profiles for extension-assisted directory submissions.
			</p>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			<Button href={productsPath} variant="outline" size="sm" class="gap-1.5">
				<AbstractIcon name={icons.Rocket.name} class="h-4 w-4" width="16" height="16" />
				My Products
			</Button>
			<AddDirectoryLaunch buttonLabel="Launch to…" buttonVariant="secondary" buttonClass="btn-sm" />
		</div>
	</div>

	{#if !workspaceId}
		<p class="mt-4 text-sm text-base-content/70">Select a workspace to see product profiles.</p>
	{:else if loading}
		<p class="mt-4 flex items-center gap-2 text-sm text-base-content/70">
			<AbstractIcon name={icons.LoaderCircle.name} class="h-4 w-4 animate-spin" width="16" height="16" />
			Loading product profiles…
		</p>
	{:else if profiles.length === 0}
		<p class="mt-4 text-sm text-base-content/70">
			No product profiles yet.
			<a class="link link-primary" href={productsPath}>Create one on My Products</a>.
		</p>
	{:else}
		<div class="mt-4 space-y-6">
			{#each [...groupedProfiles.entries()] as [groupId, groupProfiles] (groupId)}
				<div>
					<h3 class="text-sm font-semibold text-base-content/80">{groupLabel(groupId)}</h3>
					<ul class="mt-2 space-y-2">
						{#each groupProfiles as profile (profile.id)}
							<li
								class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-base-300 px-3 py-2"
							>
								<div class="min-w-0">
									<p class="font-medium text-base-content">{profile.name}</p>
									{#if profile.tagline}
										<p class="text-sm text-base-content/70 truncate">{profile.tagline}</p>
									{/if}
								</div>
								<div class="flex flex-wrap gap-2">
									<Button href={`${productsPath}?edit=${profile.id}`} variant="outline" size="sm">
										Edit
									</Button>
									<AddDirectoryLaunch
										buttonLabel="Launch to…"
										buttonVariant="outline"
										buttonClass="btn-sm"
										productProfileId={profile.id}
									/>
									<Button
										href={`${productsPath}?submissions=${profile.id}`}
										variant="ghost"
										size="sm"
									>
										Submissions
									</Button>
								</div>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	{/if}
</section>
