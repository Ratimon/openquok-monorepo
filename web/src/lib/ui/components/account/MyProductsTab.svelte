<script lang="ts">
	import type {
		AutoLaunchProductsComposerTab,
		AutoLaunchProductLaunchCardRowViewModel,
		AutoLaunchProfileSavePayload
	} from '$lib/auto-launch/AutoLaunchProducts.presenter.svelte';
	import type { AutoLaunchDestinationDto } from '$lib/auto-launch/auto-launch.types';
	import type {
		AutoLaunchProductProfileDto,
		AutoLaunchSubmissionDto
	} from '$lib/auto-launch/auto-launch.types';

	import { icons } from '$data/icons';

	import ProductProfileComposer from '$lib/ui/components/auto-launch/ProductProfileComposer.svelte';
	import BusinessProfileCard from '$lib/ui/components/auto-launch/BusinessProfileCard.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		workspaceId: string | null;
		suggestedAuthEmail: string | null;
		loading: boolean;
		profileLaunchCardRowsVm: AutoLaunchProductLaunchCardRowViewModel[];
		publishedDestinations: AutoLaunchDestinationDto[];
		composerOpen: boolean;
		composerSubmitting: boolean;
		editingProfile: AutoLaunchProductProfileDto | null;
		composerInitialTab: AutoLaunchProductsComposerTab | null;
		onOpenCreate: () => void;
		onOpenEdit: (profileId: string, tab?: AutoLaunchProductsComposerTab) => void;
		onCreateDirectoryVariant: (
			mainProfileId: string,
			directorySiteKey: string
		) => Promise<{ ok: true; profileId: string } | { ok: false; error: string }>;
		onDeleteProfile: (profileId: string) => void;
		onSaveProfile: (
			values: AutoLaunchProfileSavePayload,
			uploadMediaForProfile: (profileId: string) => Promise<
				| { logoUrl?: string | null; galleryUrls?: string[] }
				| undefined
			>
		) => void | Promise<void>;
		onComposerCancel: () => void;
		onDirectoryListingSaved?: (submission: AutoLaunchSubmissionDto) => void | Promise<void>;
		onDirectoryListingRemoved?: (payload: {
			productProfileId: string;
			submissionId: string;
		}) => void | Promise<void>;
	};

	let {
		workspaceId,
		suggestedAuthEmail,
		loading,
		profileLaunchCardRowsVm,
		publishedDestinations,
		composerOpen = $bindable(),
		composerSubmitting,
		editingProfile,
		composerInitialTab,
		onOpenCreate,
		onOpenEdit,
		onCreateDirectoryVariant,
		onDeleteProfile,
		onSaveProfile,
		onComposerCancel,
		onDirectoryListingSaved,
		onDirectoryListingRemoved
	}: Props = $props();

	let composerRef: ProductProfileComposer | undefined = $state();
</script>

<div class="flex flex-wrap items-center justify-between gap-3">
	<p class="text-sm text-base-content/70">
		Business profiles hold your product copy for directory launches and can link social channels on the
		Channels tab.
	</p>
	<div class="flex flex-wrap gap-2">
		<Button type="button" variant="outline" onclick={onOpenCreate}>New business profile</Button>
	</div>
</div>

{#if !workspaceId}
	<p class="mt-6 text-sm text-base-content/70">Select a workspace to manage business profiles.</p>
{:else if loading}
	<p class="mt-6 flex items-center gap-2 text-sm text-base-content/70">
		<AbstractIcon name={icons.LoaderCircle.name} class="h-4 w-4 animate-spin" width="16" height="16" />
		Loading business profiles…
	</p>
{:else if profileLaunchCardRowsVm.length === 0}
	<p class="mt-6 text-sm text-base-content/70">
		No business profiles yet. Create one to launch on directories and group social channels.
	</p>
{:else}
	<ul class="mt-6 flex flex-col gap-4">
		{#each profileLaunchCardRowsVm as row, index (row.profileId)}
			<li>
				<BusinessProfileCard
					vm={row.cardVm}
					directorySiteRows={row.directorySiteRows}
					submissionsByDestinationId={row.submissionsByDestinationId}
					{publishedDestinations}
					directoryVariants={row.directoryVariants}
					variantProfileIdsBySiteKey={row.variantProfileIdsBySiteKey}
					onCreateDirectoryVariant={onCreateDirectoryVariant}
					organizationId={workspaceId ?? ''}
					{suggestedAuthEmail}
					directoryChannelsDefaultOpen={index === 0}
					onDirectoryListingSaved={onDirectoryListingSaved}
					onDirectoryListingRemoved={onDirectoryListingRemoved}
					onEdit={onOpenEdit}
					onDelete={(id) => onDeleteProfile(id)}
				/>
			</li>
		{/each}
	</ul>
{/if}

<ProductProfileComposer
	bind:this={composerRef}
	bind:open={composerOpen}
	organizationId={workspaceId}
	initial={editingProfile}
	initialTab={composerInitialTab}
	submitting={composerSubmitting}
	title={editingProfile ? 'Edit business profile' : 'New business profile'}
	onSubmit={(values) =>
		void onSaveProfile(values, async (profileId) => composerRef?.uploadMediaForProfile(profileId))}
	onCancel={onComposerCancel}
/>
