<script lang="ts">
	import type {
		DevtoOrganizationOption,
		DevtoTagOption
	} from '$lib/ui/components/posts/providers/provider.types';

	import { untrack } from 'svelte';

	import { icons } from '$data/icons';
	import { integrationsRepository } from '$lib/integrations';
	import { uploadSocialPostComposerMediaFiles } from '$lib/posts';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import MediaLibraryModal from '$lib/ui/components/media/MediaLibraryModal.svelte';
	import DevtoTags from '$lib/ui/components/posts/providers/devto/DevtoTags.svelte';
	import { Dropzone } from '$lib/ui/dropzone';
	import { toast } from '$lib/ui/sonner';

	const DEVTO_COVER_MAX_BYTES = 2 * 1024 * 1024;
	const LIVE_INTEGRATION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	const LANDING_MOCK_ORGANIZATIONS: DevtoOrganizationOption[] = [
		{ id: 1, name: 'OpenQuok', username: 'openquok' }
	];

	type Props = {
		title?: string;
		canonical?: string;
		organization?: number | undefined;
		series?: string;
		tags?: DevtoTagOption[];
		mainImage?: { path: string } | undefined;
		organizationId?: string | null;
		integrationId?: string;
		uploadUid?: string;
		disabled?: boolean;
	};

	let {
		title = $bindable(''),
		canonical = $bindable(''),
		organization = $bindable<number | undefined>(undefined),
		series = $bindable(''),
		tags = $bindable<DevtoTagOption[]>([]),
		mainImage = $bindable<{ path: string } | undefined>(undefined),
		organizationId = null,
		integrationId = '',
		uploadUid = '',
		disabled = false
	}: Props = $props();

	let mediaLibraryOpen = $state(false);
	let uploadBusy = $state(false);
	let dropzoneFiles = $state<FileList | null>(null);
	let tagSuggestions = $state<DevtoTagOption[]>([]);
	let organizations = $state<DevtoOrganizationOption[]>([]);

	const canLoadTools = $derived(
		!disabled && Boolean(organizationId) && LIVE_INTEGRATION_ID.test(integrationId)
	);

	const displayOrganizations = $derived(
		organizations.length > 0
			? organizations
			: integrationId.startsWith('landing-mock-')
				? LANDING_MOCK_ORGANIZATIONS
				: []
	);

	$effect(() => {
		if (!canLoadTools || !organizationId) return;
		const orgId = organizationId;
		const channelId = integrationId;
		void untrack(() => loadTools(orgId, channelId));
	});

	async function loadTools(orgId: string, channelId: string) {
		const [tagsResult, orgsResult] = await Promise.all([
			integrationsRepository.triggerIntegrationTool({
				organizationId: orgId,
				integrationId: channelId,
				methodName: 'tags'
			}),
			integrationsRepository.triggerIntegrationTool({
				organizationId: orgId,
				integrationId: channelId,
				methodName: 'organizations'
			})
		]);
		if (tagsResult.ok) {
			tagSuggestions = parseTagOptions(tagsResult.output);
		}
		if (orgsResult.ok) {
			organizations = parseOrganizations(orgsResult.output);
		}
	}

	function parseTagOptions(output: unknown): DevtoTagOption[] {
		if (!Array.isArray(output)) return [];
		const out: DevtoTagOption[] = [];
		const seen = new Set<string>();
		for (const item of output) {
			if (!item || typeof item !== 'object') continue;
			const rec = item as { value?: unknown; label?: unknown };
			const label =
				typeof rec.label === 'string'
					? rec.label.trim()
					: typeof rec.value === 'string'
						? rec.value.trim()
						: '';
			if (!label) continue;
			const key = label.toLowerCase();
			if (seen.has(key)) continue;
			seen.add(key);
			const value = typeof rec.value === 'string' && rec.value.trim() ? rec.value.trim() : label;
			out.push({ value, label });
		}
		return out;
	}

	function parseOrganizations(output: unknown): DevtoOrganizationOption[] {
		if (!Array.isArray(output)) return [];
		const out: DevtoOrganizationOption[] = [];
		const seen = new Set<number>();
		for (const item of output) {
			if (!item || typeof item !== 'object') continue;
			const rec = item as { id?: unknown; name?: unknown; username?: unknown };
			const id = typeof rec.id === 'number' ? rec.id : Number(rec.id);
			if (!Number.isFinite(id) || id <= 0 || seen.has(id)) continue;
			seen.add(id);
			out.push({
				id,
				name: typeof rec.name === 'string' ? rec.name : String(id),
				username: typeof rec.username === 'string' ? rec.username : ''
			});
		}
		return out;
	}

	function validateCoverFile(file: File): string | null {
		if (!file.type.toLowerCase().startsWith('image/')) {
			return 'Cover image must be an image file.';
		}
		if (file.size > DEVTO_COVER_MAX_BYTES) {
			return 'Cover image must be 2 MB or smaller.';
		}
		return null;
	}

	async function ingestCoverFiles(files: FileList | null) {
		if (!files?.length || disabled || uploadBusy) return;
		const file = files[0];
		const validationError = validateCoverFile(file);
		if (validationError) {
			toast.error(validationError);
			return;
		}
		if (!uploadUid) {
			toast.error('Upload is not available. Try choosing from the media library.');
			return;
		}
		uploadBusy = true;
		try {
			const transfer = new DataTransfer();
			transfer.items.add(file);
			const batch = await uploadSocialPostComposerMediaFiles(transfer.files, uploadUid);
			if (!batch.ok) {
				toast.error(batch.message);
				return;
			}
			const first = batch.items[0];
			if (first?.path) {
				mainImage = { path: first.path };
				toast.success('Cover image attached.');
			}
		} finally {
			uploadBusy = false;
			dropzoneFiles = null;
		}
	}

	function onOrganizationChange(event: Event) {
		const raw = (event.currentTarget as HTMLSelectElement).value;
		organization = raw ? Number.parseInt(raw, 10) : undefined;
	}
</script>

<div class="space-y-4">
	<div class="space-y-1">
		<label class="text-xs font-medium text-base-content/70" for="devto-title">Title</label>
		<input
			id="devto-title"
			type="text"
			class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
			placeholder="Article title (at least 2 characters)"
			bind:value={title}
			{disabled}
		/>
	</div>

	<div class="space-y-1">
		<label class="text-xs font-medium text-base-content/70" for="devto-canonical"
			>Canonical URL (optional)</label
		>
		<input
			id="devto-canonical"
			type="url"
			class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
			placeholder="https://example.com/original-post"
			bind:value={canonical}
			{disabled}
		/>
		<p class="text-xs text-base-content/50">
			If this article already lives on your blog, paste that URL. Dev.to will treat it as the
			original and point readers there. Leave blank for a first-party Dev.to post.
		</p>
	</div>

	<div class="space-y-1">
		<label class="text-xs font-medium text-base-content/70" for="devto-org">Organization</label>
		<select
			id="devto-org"
			class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
			value={organization ?? ''}
			onchange={onOrganizationChange}
			{disabled}
		>
			<option value="">Personal profile</option>
			{#each displayOrganizations as org (org.id)}
				<option value={org.id}>{org.name}{org.username ? ` (@${org.username})` : ''}</option>
			{/each}
		</select>
	</div>

	<div class="space-y-1">
		<label class="text-xs font-medium text-base-content/70" for="devto-series"
			>Series (optional)</label
		>
		<input
			id="devto-series"
			type="text"
			class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
			placeholder="e.g. Shipping notes"
			bind:value={series}
			{disabled}
		/>
		<p class="text-xs text-base-content/50">
			Free-text series name. Dev.to creates the series if it does not already exist.
		</p>
	</div>

	<DevtoTags bind:value={tags} suggestions={tagSuggestions} {disabled} />

	<div class="space-y-2">
		<div class="text-xs font-medium text-base-content/70">Cover image (optional, 1000×420)</div>
		{#if mainImage?.path}
			<p class="text-xs text-base-content/60 break-all">{mainImage.path}</p>
			<button
				type="button"
				class="text-xs text-error hover:underline"
				onclick={() => (mainImage = undefined)}
				{disabled}
			>
				Remove cover
			</button>
		{:else}
			<Dropzone
				accept="image/*"
				bind:files={dropzoneFiles}
				disabled={disabled || uploadBusy}
				class="border-primary/25 hover:border-primary/40 bg-base-200/50 h-36 min-h-32 cursor-pointer border-dashed disabled:cursor-not-allowed disabled:opacity-50"
				onChange={(e) => {
					const input = e.currentTarget as HTMLInputElement;
					void ingestCoverFiles(input.files);
					input.value = '';
				}}
				onDrop={(e) => {
					const list = e.dataTransfer?.files ?? null;
					void ingestCoverFiles(list);
				}}
			>
				<div class="text-base-content/80 pointer-events-none flex flex-col items-center gap-2 px-4 text-center">
					{#if uploadBusy}
						<span class="loading loading-spinner loading-md text-primary"></span>
						<span class="text-sm font-medium">Uploading…</span>
					{:else}
						<span class="relative inline-flex size-10 items-center justify-center text-primary">
							<AbstractIcon name={icons.Images.name} class="size-10" width="40" height="40" />
						</span>
						<div class="space-y-1">
							<p class="text-sm font-medium">Drag and drop a cover image here</p>
							<p class="text-base-content/60 text-xs">or click to browse (max 2 MB)</p>
						</div>
					{/if}
				</div>
			</Dropzone>
			<div class="flex items-center gap-3">
				<div class="bg-base-300 h-px flex-1"></div>
				<span class="text-base-content/50 text-xs">or</span>
				<div class="bg-base-300 h-px flex-1"></div>
			</div>
			<button
				type="button"
				class="border-base-300 bg-base-100 hover:bg-base-200 w-full rounded-md border px-3 py-2 text-sm"
				onclick={() => (mediaLibraryOpen = true)}
				disabled={disabled || uploadBusy}
			>
				Choose from media library
			</button>
		{/if}
	</div>
</div>

<MediaLibraryModal
	bind:open={mediaLibraryOpen}
	{organizationId}
	{disabled}
	mediaLocked={true}
	maxAttachBytes={DEVTO_COVER_MAX_BYTES}
	onAttach={(items) => {
		const first = items[0];
		if (first?.path) {
			mainImage = { path: first.path };
		}
		mediaLibraryOpen = false;
	}}
/>
