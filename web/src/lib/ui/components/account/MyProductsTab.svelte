<script lang="ts">
	import { page } from '$app/state';

	import { protectedHomePagePresenter } from '$lib/area-protected';
	import { autoLaunchRepository } from '$lib/auto-launch';
	import type { AutoLaunchSubmissionDto } from '$lib/auto-launch/auto-launch.types';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { toast } from '$lib/ui/sonner';
	import { icons } from '$data/icons';

	import AddDirectoryLaunch from '$lib/ui/components/auto-launch/AddDirectoryLaunch.svelte';
	import ProductProfileComposer from '$lib/ui/components/auto-launch/ProductProfileComposer.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	const productsPresenter = protectedHomePagePresenter.autoLaunchProductsPresenter;

	const workspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);
	const profiles = $derived(productsPresenter.profilesVm);
	const loading = $derived(productsPresenter.loading);

	let composerOpen = $state(false);
	let composerSubmitting = $state(false);
	let editingProfileId = $state<string | null>(null);
	let destinationNameById = $state<Record<string, string>>({});
	let submissionsByProfileId = $state<Record<string, AutoLaunchSubmissionDto[]>>({});

	const editingProfile = $derived(
		editingProfileId ? profiles.find((p) => p.id === editingProfileId) ?? null : null
	);

	async function loadLaunchProgress() {
		if (!workspaceId) return;
		const [destinations, ...submissionLists] = await Promise.all([
			autoLaunchRepository.listDestinations(),
			...profiles.map((p) => autoLaunchRepository.listSubmissions(workspaceId, { productProfileId: p.id }))
		]);
		destinationNameById = Object.fromEntries(destinations.map((d) => [d.id, d.name]));
		const byProfile: Record<string, typeof submissionLists[number]> = {};
		profiles.forEach((p, i) => {
			byProfile[p.id] = submissionLists[i] ?? [];
		});
		submissionsByProfileId = byProfile;
	}

	$effect(() => {
		if (!workspaceId) return;
		void productsPresenter.loadProfiles().then(() => loadLaunchProgress());
	});

	$effect(() => {
		const editId = page.url.searchParams.get('edit');
		if (editId && profiles.some((p) => p.id === editId)) {
			editingProfileId = editId;
			composerOpen = true;
		}
	});

	function openCreate() {
		editingProfileId = null;
		composerOpen = true;
	}

	async function saveProfile(values: {
		name: string;
		tagline: string | null;
		description: string | null;
		websiteUrl: string | null;
		logoUrl: string | null;
	}) {
		if (!workspaceId) return;
		composerSubmitting = true;
		try {
			if (editingProfileId) {
				const result = await autoLaunchRepository.updateProfile(editingProfileId, values);
				if (!result.ok) {
					toast.error(result.error);
					return;
				}
				toast.success('Business profile updated.');
			} else {
				const result = await autoLaunchRepository.createProfile({
					organizationId: workspaceId,
					...values,
					profileData: {}
				});
				if (!result.ok) {
					toast.error(result.error);
					return;
				}
				toast.success('Business profile created.');
			}
			composerOpen = false;
			editingProfileId = null;
			await productsPresenter.loadProfiles();
			await loadLaunchProgress();
			await protectedHomePagePresenter.loadChannelGroups();
		} finally {
			composerSubmitting = false;
		}
	}

	async function removeProfile(id: string) {
		const result = await autoLaunchRepository.deleteProfile(id);
		if (!result.ok) {
			toast.error(result.error ?? 'Could not delete profile.');
			return;
		}
		toast.success('Business profile removed.');
		await productsPresenter.loadProfiles();
	}
</script>

<div class="flex flex-wrap items-center justify-between gap-3">
	<p class="text-sm text-base-content/70">
		Business profiles hold your product copy for directory launches and can link social channels on the
		Channels tab.
	</p>
	<div class="flex flex-wrap gap-2">
		<Button type="button" variant="outline" onclick={openCreate}>New business profile</Button>
	</div>
</div>

{#if !workspaceId}
	<p class="mt-6 text-sm text-base-content/70">Select a workspace to manage business profiles.</p>
{:else if loading}
	<p class="mt-6 flex items-center gap-2 text-sm text-base-content/70">
		<AbstractIcon name={icons.LoaderCircle.name} class="h-4 w-4 animate-spin" width="16" height="16" />
		Loading business profiles…
	</p>
{:else if profiles.length === 0}
	<p class="mt-6 text-sm text-base-content/70">
		No business profiles yet. Create one to launch on directories and group social channels.
	</p>
{:else}
	<ul class="mt-6 space-y-3">
		{#each profiles as profile (profile.id)}
			<li class="rounded-xl border border-base-300 p-4">
				<div class="flex flex-wrap items-start justify-between gap-3">
					<div class="min-w-0">
						<h2 class="text-base font-semibold text-base-content">{profile.name}</h2>
						{#if profile.tagline}
							<p class="text-sm text-base-content/70">{profile.tagline}</p>
						{/if}
						{#if profile.websiteUrl}
							<p class="mt-1 text-sm text-base-content/60">{profile.websiteUrl}</p>
						{/if}
					</div>
					<div class="flex flex-wrap gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onclick={() => {
								editingProfileId = profile.id;
								composerOpen = true;
							}}
						>
							Edit
						</Button>
						<AddDirectoryLaunch
							buttonLabel="Add Channel"
							buttonVariant="secondary"
							buttonClass="btn-sm"
							sitePickerFirst={true}
							productProfileId={profile.id}
						/>
						<Button type="button" variant="ghost" size="sm" onclick={() => void removeProfile(profile.id)}>
							Delete
						</Button>
					</div>
				</div>
				{#if (submissionsByProfileId[profile.id] ?? []).length > 0}
					<div class="mt-3 border-t border-base-300/60 pt-3">
						<p class="text-xs font-medium text-base-content/80">Directory launches (this product)</p>
						<ul class="mt-2 space-y-1.5">
							{#each submissionsByProfileId[profile.id] ?? [] as submission (submission.id)}
								<li class="flex flex-wrap items-center gap-2 text-xs text-base-content/70">
									<span class="font-medium text-base-content/85">
										{destinationNameById[submission.destinationId] ?? 'Directory'}
									</span>
									<span class="badge badge-xs badge-ghost">{submission.status}</span>
									{#if submission.completedAt}
										<span>· {new Date(submission.completedAt).toLocaleDateString()}</span>
									{/if}
								</li>
							{/each}
						</ul>
						<p class="mt-2 text-xs text-base-content/50">
							Launch progress is per product. Saved → Backlinks is only a site bookmark shortlist.
						</p>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
{/if}

<ProductProfileComposer
	bind:open={composerOpen}
	initial={editingProfile}
	submitting={composerSubmitting}
	title={editingProfileId ? 'Edit business profile' : 'New business profile'}
	onSubmit={saveProfile}
	onCancel={() => {
		editingProfileId = null;
	}}
/>
