<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type {
		BackgroundPanelVm,
		DesignTemplateProgrammerModel,
		ExportCanvasToMediaFn,
		PolotnoTemplateListPageProgrammerModel,
		StockPhotoViewModel
	} from '$lib/canvas';
	import type { PostMediaProgrammerModel } from '$lib/posts';
	import type { LaunchProviderCommentsMode } from '$lib/ui/components/posts/providers/provider.types';

	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import DesignEditorGlyph from '$lib/ui/components/posts/DesignEditorGlyph.svelte';
	import MediaGeneration from '$lib/ui/components/media/MediaGeneration.svelte';
	import * as Popover from '$lib/ui/popover';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { goto } from '$app/navigation';
	import { getRootPathAccount } from '$lib/area-protected';
	import { absoluteUrl, route } from '$lib/utils/path';
	import { signaturesRepository } from '$lib/signatures';
	import { uploadSocialPostComposerMediaFiles } from '$lib/posts';
	import { toast } from '$lib/ui/sonner';

	interface ComposerMediaToolbarProps {
		stockPhotosVm: readonly StockPhotoViewModel[];
		designTemplatesVm: readonly DesignTemplateProgrammerModel[];
		fetchPolotnoTemplateListPage: (
			params: { query: string; page: number },
			signal?: AbortSignal
		) => Promise<PolotnoTemplateListPageProgrammerModel>;
		backgroundPanelVm: BackgroundPanelVm;
		exportCanvasToMedia: ExportCanvasToMediaFn;
		items?: PostMediaProgrammerModel[];
		disabled?: boolean;
		uploadUid: string;
		/** Workspace whose shared signatures are listed. */
		organizationId?: string | null;
		onInsertSignature?: (text: string) => void;
		class?: string;
		composerMode?: 'global' | 'custom';
		focusedProviderIdentifier?: string | null;
		/** When `'no-media'` and there is at least one item, block adding more media. */
		commentsMode?: LaunchProviderCommentsMode;
	}

	let {
		stockPhotosVm,
		designTemplatesVm,
		fetchPolotnoTemplateListPage,
		backgroundPanelVm,
		exportCanvasToMedia,
		items = $bindable([]),
		disabled = false,
		uploadUid,
		organizationId = null,
		onInsertSignature = undefined,
		class: className = '',
		composerMode = 'global',
		focusedProviderIdentifier = null,
		commentsMode = true
	}: ComposerMediaToolbarProps = $props();

	type MediaGenerationProps = ComponentProps<typeof MediaGeneration>;

	let fileInput = $state.raw<HTMLInputElement | undefined>(undefined);
	let uploadBusy = $state(false);
	let designOpen = $state(false);
	const mediaLocked = $derived(commentsMode === 'no-media' && items.length > 0);
	let signatureOpen = $state(false);
	let signatureBusy = $state(false);
	let signatures = $state<Array<{ id: string; title: string; content: string; isDefault: boolean }>>([]);

	const iconBtn =
		'border-base-300/90 bg-base-200/45 text-base-content/85 hover:bg-base-300/55 hover:text-base-content focus-visible:ring-primary/40 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-sm backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-35';

	async function uploadFiles(files: FileList | null) {
		if (mediaLocked) return;
		if (!files?.length || disabled || uploadBusy || !uploadUid) return;
		uploadBusy = true;
		try {
			const batch = await uploadSocialPostComposerMediaFiles(files, uploadUid);
			if (!batch.ok) {
				toast.error(batch.message);
				return;
			}
			items = [...items, ...batch.items];
			if (batch.items.length) {
				toast.success(batch.items.length === 1 ? 'Image attached.' : 'Images attached.');
			}
		} finally {
			uploadBusy = false;
		}
	}

	function onFileChange(e: Event) {
		const t = e.currentTarget as HTMLInputElement;
		void uploadFiles(t.files);
		t.value = '';
	}

	function onAddFromDesign(added: PostMediaProgrammerModel[]) {
		if (added.length) {
			items = [...items, ...added];
		}
	}

	async function loadSignaturesIfNeeded() {
		if (!organizationId?.trim()) return;
		if (signatureBusy) return;
		signatureBusy = true;
		try {
			const res = await signaturesRepository.listForOrganization(organizationId.trim());
			if (res.ok) {
				signatures = res.items;
			} else {
				toast.error(res.error);
			}
		} finally {
			signatureBusy = false;
		}
	}

	function insertSignature(text: string) {
		const trimmed = (text ?? '').trim();
		if (!trimmed) return;
		onInsertSignature?.(trimmed);
		signatureOpen = false;
	}

	function openSignaturesSettings() {
		signatureOpen = false;
		void goto(absoluteUrl(`${route(getRootPathAccount())}/settings?section=signature`));
	}

	const mediaGenerationFields = $derived.by(
		(): Omit<MediaGenerationProps, 'open'> => ({
			stockPhotosVm,
			designTemplatesVm,
			fetchPolotnoTemplateListPage,
			backgroundPanelVm,
			exportCanvasToMedia,
			disabled: disabled || uploadBusy || mediaLocked,
			uploadUid,
			composerMode,
			focusedProviderIdentifier,
			onAdd: onAddFromDesign
		})
	);
</script>

<div
	class="border-base-300/80 bg-base-100/90 flex items-center gap-1 rounded-xl border p-1 shadow-md backdrop-blur-md {className}"
	role="toolbar"
	aria-label="Post media"
>
	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		multiple
		class="hidden"
		onchange={onFileChange}
	/>
	<!-- 1: add images from disk -->
	<button
		type="button"
		class={iconBtn}
		disabled={disabled || uploadBusy || mediaLocked}
		onclick={() => fileInput?.click()}
		aria-label="Add images from your device"
		title="Add images"
	>
		{#if uploadBusy}
			<span class="loading loading-spinner loading-sm text-primary"></span>
		{:else}
			<span class="relative inline-flex size-6 items-center justify-center">
				<AbstractIcon name={icons.Image.name} class="size-6" width="24" height="24" />
				<span
					class="bg-primary text-primary-content ring-base-100 absolute -right-1 -bottom-1 flex size-3.5 items-center justify-center rounded-full ring-2"
					aria-hidden="true"
				>
					<AbstractIcon name={icons.Plus.name} class="size-2.5" width="10" height="10" />
				</span>
			</span>
		{/if}
	</button>
	<!-- 2: design / canvas modal -->
	<button
		type="button"
		class={iconBtn}
		disabled={disabled || uploadBusy || mediaLocked}
		onclick={() => (designOpen = true)}
		aria-label="Open design editor"
		title="Design media"
	>
		<DesignEditorGlyph badgeSurfaceClass="rounded-sm bg-base-200/45 shadow-none ring-0" />
	</button>

	<!-- 3: signatures -->
	<Popover.Root
		bind:open={signatureOpen}
		onOpenChange={(o: boolean) => {
			signatureOpen = o;
			if (o) void loadSignaturesIfNeeded();
		}}
	>
		<Popover.Trigger
			class={iconBtn}
			disabled={disabled || uploadBusy || !organizationId?.trim()}
			aria-label="Insert signature"
			title="Signature"
		>
			<span class="relative inline-flex size-6 items-center justify-center">
				<AbstractIcon name={icons.Hash.name} class="size-5" width="20" height="20" />
				<span
					class="bg-primary text-primary-content ring-base-100 absolute -right-1 -bottom-1 flex size-3.5 items-center justify-center rounded-full ring-2"
					aria-hidden="true"
				>
					<AbstractIcon name={icons.Plus.name} class="size-2.5" width="10" height="10" />
				</span>
			</span>
		</Popover.Trigger>
		<Popover.Content align="start" side="top" class="w-80 p-3">
			<div class="flex items-start justify-between gap-2">
				<div class="min-w-0 flex-1">
					<div class="text-sm font-semibold text-base-content">Signatures</div>
					<p class="mt-1 text-xs leading-snug text-base-content/70">
						Insert a workspace snippet eg. hashtags, sign-offs, or other text you use often.
					</p>
				</div>
				{#if signatureBusy}
					<span class="loading loading-spinner loading-sm shrink-0 text-primary"></span>
				{/if}
			</div>
			<div class="mt-2 max-h-64 overflow-auto">
				{#if !organizationId?.trim()}
					<div class="rounded-md border border-base-300 bg-base-100 p-3 text-sm text-base-content/70">
						Select a workspace to load signatures.
					</div>
				{:else if signatures.length === 0 && !signatureBusy}
					<div class="flex flex-col gap-2 rounded-md border border-base-300 bg-base-100 p-3 text-sm text-base-content/70">
						<p>No signatures for this workspace yet.</p>
						<Button type="button" variant="primary" size="sm" class="w-full" onclick={openSignaturesSettings}>
							Open Signatures settings
						</Button>
					</div>
				{:else}
					<div class="flex flex-col gap-2">
						{#each signatures as s (s.id)}
							<button
								type="button"
								class="w-full rounded-md border border-base-300 bg-base-100 px-3 py-2 text-start hover:bg-base-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
								onclick={() => insertSignature(s.content)}
							>
								<div class="flex items-center justify-between gap-2">
									<div class="truncate text-sm font-medium text-base-content">{s.title}</div>
									{#if s.isDefault}
										<span class="badge badge-sm badge-primary">Default</span>
									{/if}
								</div>
								<div class="mt-1 line-clamp-2 whitespace-pre-wrap text-xs text-base-content/60">
									{s.content}
								</div>
							</button>
						{/each}
						<Button
							type="button"
							variant="outline"
							size="sm"
							class="w-full shrink-0"
							onclick={openSignaturesSettings}
						>
							Manage signatures
						</Button>
					</div>
				{/if}
			</div>
		</Popover.Content>
	</Popover.Root>

	<!-- 4–5: parity placeholders (not wired yet) -->
	<!-- <button type="button" class={iconBtn} disabled aria-label="AI image (coming soon)" title="Coming soon">
		<AbstractIcon name={icons.Sparkles.name} class="size-5" width="20" height="20" />
	</button>
	<button type="button" class={iconBtn} disabled aria-label="Video (coming soon)" title="Coming soon">
		<span class="relative inline-flex size-6 items-center justify-center">
			<AbstractIcon name={icons.ClapperBoard.name} class="size-5" width="20" height="20" />
			<span
				class="bg-primary text-primary-content ring-base-100 absolute -right-1 -bottom-1 flex size-3.5 items-center justify-center rounded-full ring-2"
				aria-hidden="true"
			>
				<AbstractIcon name={icons.Plus.name} class="size-2.5" width="10" height="10" />
			</span>
		</span>
	</button> -->
</div>

<MediaGeneration {...mediaGenerationFields} bind:open={designOpen} />
