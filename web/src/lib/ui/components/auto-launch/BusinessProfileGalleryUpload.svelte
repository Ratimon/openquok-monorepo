<script lang="ts">
	import type { DatabaseName } from '$lib/core/Image.repository.svelte';

	import { BUSINESS_PROFILE_MAX_GALLERY_URLS } from 'openquok-common';

	import { AUTO_LAUNCH_PROFILE_MEDIA_BUCKET } from '$lib/auto-launch/constants/config';
	import { resolveAutoLaunchProfileImageUrl } from '$lib/auto-launch/utils/autoLaunchProfileMediaImages';
	import { imageRepository } from '$lib/core/index';
	import { DeleteImagePresenter } from '$lib/core/DeleteImage.presenter.svelte';
	import { DownloadImagePresenter } from '$lib/core/DownloadImage.presenter.svelte';
	import { FileUploadStatus } from '$lib/core/UploadImage.presenter.svelte';
	import { UploadImagePresenter } from '$lib/core/UploadImage.presenter.svelte';
	import { SupabaseImageUploadAreaPresenter } from '$lib/core/SupabaseImageUploadArea.presenter.svelte';
	import { icons } from '$data/icons';
	import { toast } from '$lib/ui/sonner';
	import { cn } from '$lib/ui/helpers/common';

	import { untrack } from 'svelte';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import Label from '$lib/ui/label/Label.svelte';

	type Props = {
		urls: string[];
		onChange: (paths: string[]) => void;
		disabled?: boolean;
	};

	let { urls, onChange, disabled = false }: Props = $props();

	const databaseName: DatabaseName = AUTO_LAUNCH_PROFILE_MEDIA_BUCKET;

	type SlotState = {
		presenter: SupabaseImageUploadAreaPresenter;
		localFile: File | null;
		localPreviewUrl: string | null;
	};

	function createSlot(): SlotState {
		return {
			presenter: new SupabaseImageUploadAreaPresenter(
				new DownloadImagePresenter(imageRepository),
				new UploadImagePresenter(imageRepository),
				new DeleteImagePresenter(imageRepository)
			),
			localFile: null,
			localPreviewUrl: null
		};
	}

	let slots = $state<SlotState[]>(
		Array.from({ length: BUSINESS_PROFILE_MAX_GALLERY_URLS }, () => createSlot())
	);

	let loadedStorageKeys = $state<string[]>(
		Array.from({ length: BUSINESS_PROFILE_MAX_GALLERY_URLS }, () => '')
	);

	let dragRowIndex = $state<number | null>(null);

	const reorderButtonClass =
		'h-7 w-7 shrink-0 border-base-content/25 bg-base-100 p-0 text-base-content shadow-sm hover:bg-base-200';
	/** Matches stacked up/down controls (2× h-7 + gap-0.5). */
	const removeButtonClass = cn(reorderButtonClass, 'h-[3.625rem] w-7');

	$effect(() => {
		const paths = urls;
		for (let i = 0; i < BUSINESS_PROFILE_MAX_GALLERY_URLS; i++) {
			const storageKey = (paths[i] ?? '').trim();
			const slot = untrack(() => slots[i]);
			const priorKey = untrack(() => loadedStorageKeys[i]);
			if (!slot || slot.localFile || storageKey === priorKey) continue;

			const nextKeys = untrack(() => [...loadedStorageKeys]);
			nextKeys[i] = storageKey;
			loadedStorageKeys = nextKeys;

			if (!storageKey) {
				slot.presenter.reset();
				continue;
			}
			void slot.presenter.loadImage(databaseName, storageKey);
		}
	});

	type FilledRow = { storageIndex: number };

	function pathAt(index: number): string | undefined {
		return urls[index]?.trim() ? urls[index] : undefined;
	}

	function rowIsFilled(index: number): boolean {
		return Boolean(pathAt(index) || slots[index]?.localFile);
	}

	function filledRows(): FilledRow[] {
		const rows: FilledRow[] = [];
		for (let i = 0; i < BUSINESS_PROFILE_MAX_GALLERY_URLS; i++) {
			if (rowIsFilled(i)) rows.push({ storageIndex: i });
		}
		return rows;
	}

	function nextEmptyStorageIndex(): number | null {
		for (let i = 0; i < BUSINESS_PROFILE_MAX_GALLERY_URLS; i++) {
			if (!rowIsFilled(i)) return i;
		}
		return null;
	}

	function resolvedStoredPreview(
		blobOrUrl: string | null | undefined,
		storagePath: string | undefined
	): string | null {
		if (blobOrUrl?.startsWith('blob:') || /^https?:\/\//i.test(blobOrUrl ?? '')) {
			return blobOrUrl ?? null;
		}
		return storagePath ? resolveAutoLaunchProfileImageUrl(storagePath) : null;
	}

	function slotDisplayUrl(storageIndex: number): string | null {
		const slot = slots[storageIndex];
		const path = pathAt(storageIndex);
		if (!slot) return null;
		return (
			slot.localPreviewUrl ??
			resolvedStoredPreview(slot.presenter.uploadAreaVm.imageURL, path) ??
			(path ? resolveAutoLaunchProfileImageUrl(path) : null)
		);
	}

	function slotUploading(storageIndex: number): boolean {
		return slots[storageIndex]?.presenter.uploadAreaVm.uploadStatus === FileUploadStatus.UPLOADING;
	}

	function handleFileChange(storageIndex: number, event: Event) {
		const files = (event.target as HTMLInputElement).files;
		if (!files?.length) return;
		const file = files[0];
		const slot = slots[storageIndex];
		if (!slot) return;
		if (slot.localPreviewUrl) URL.revokeObjectURL(slot.localPreviewUrl);
		slot.localFile = file;
		slot.localPreviewUrl = URL.createObjectURL(file);
		slots = [...slots];
	}

	function clearSlotLocal(storageIndex: number) {
		const slot = slots[storageIndex];
		if (!slot) return;
		if (slot.localPreviewUrl) URL.revokeObjectURL(slot.localPreviewUrl);
		slot.localFile = null;
		slot.localPreviewUrl = null;
		const input = document.getElementById(
			`business-profile-gallery-${storageIndex}`
		) as HTMLInputElement | null;
		if (input) input.value = '';
		slots = [...slots];
	}

	function removeAtStorageIndex(storageIndex: number) {
		const slot = slots[storageIndex];
		if (slot) {
			slot.presenter.reset();
			clearSlotLocal(storageIndex);
		}
		const nextPaths: string[] = [];
		for (let i = 0; i < BUSINESS_PROFILE_MAX_GALLERY_URLS; i++) {
			if (i === storageIndex) continue;
			const path = pathAt(i);
			if (path) nextPaths.push(path);
		}
		onChange(nextPaths);
	}

	function reorderFilledRows(fromRow: number, toRow: number) {
		if (fromRow === toRow || disabled) return;
		const rows = filledRows();
		if (fromRow < 0 || toRow < 0 || fromRow >= rows.length || toRow >= rows.length) return;

		const rowData = rows.map(({ storageIndex }) => ({
			path: pathAt(storageIndex) ?? '',
			slot: slots[storageIndex] ?? createSlot()
		}));

		const [moved] = rowData.splice(fromRow, 1);
		rowData.splice(toRow, 0, moved);

		const newSlots = Array.from({ length: BUSINESS_PROFILE_MAX_GALLERY_URLS }, () => createSlot());
		for (let i = 0; i < rowData.length; i++) {
			newSlots[i] = rowData[i].slot;
		}

		slots = newSlots;
		const orderedPaths = rowData.map((row) => row.path).filter((p) => p.trim().length > 0);
		onChange(orderedPaths);
	}

	function moveRow(rowIndex: number, direction: 'up' | 'down') {
		const target = direction === 'up' ? rowIndex - 1 : rowIndex + 1;
		reorderFilledRows(rowIndex, target);
	}

	function handleDragStart(rowIndex: number) {
		dragRowIndex = rowIndex;
	}

	function handleDragOver(event: DragEvent, rowIndex: number) {
		event.preventDefault();
		if (dragRowIndex === null || dragRowIndex === rowIndex || disabled) return;
		reorderFilledRows(dragRowIndex, rowIndex);
		dragRowIndex = rowIndex;
	}

	function handleDragEnd() {
		dragRowIndex = null;
	}

	function handleRowDragStart(event: DragEvent, rowIndex: number) {
		if (disabled) return;
		if (!event.dataTransfer) return;
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/plain', String(rowIndex));
		handleDragStart(rowIndex);
	}

	export function hasPendingUpload(): boolean {
		return slots.some((slot) => Boolean(slot.localFile));
	}

	export async function uploadPending(uploadUid: string): Promise<string[]> {
		const result = [...urls];
		for (let i = 0; i < BUSINESS_PROFILE_MAX_GALLERY_URLS; i++) {
			const slot = slots[i];
			if (!slot?.localFile) continue;
			try {
				await slot.presenter.uploadImage(databaseName, slot.localFile, uploadUid);
				const filePath = slot.presenter.uploadAreaVm.filePath;
				if (!filePath) {
					toast.error(`Gallery image ${i + 1} failed to upload.`);
					continue;
				}
				while (result.length <= i) {
					result.push('');
				}
				result[i] = filePath;
				clearSlotLocal(i);
			} catch {
				toast.error(`Gallery image ${i + 1} failed to upload.`);
			}
		}
		const trimmed = result.filter((p) => p.trim().length > 0).slice(0, BUSINESS_PROFILE_MAX_GALLERY_URLS);
		onChange(trimmed);
		return trimmed;
	}

	async function removeStored(storageIndex: number) {
		const path = pathAt(storageIndex);
		if (!path || disabled) return;
		const slot = slots[storageIndex];
		try {
			if (slot) {
				await slot.presenter.deleteImage(databaseName, path);
				slot.presenter.reset();
				clearSlotLocal(storageIndex);
			}
			removeAtStorageIndex(storageIndex);
		} catch {
			toast.error('Could not remove gallery image.');
		}
	}

	const rows = $derived(filledRows());
	const canAddMore = $derived(rows.length < BUSINESS_PROFILE_MAX_GALLERY_URLS);
	const addIndex = $derived(nextEmptyStorageIndex());
</script>

<div class="space-y-3">
	<div>
		<p class="text-sm font-medium text-base-content">Screenshots</p>
		<p class="text-xs text-base-content/60">
			Up to {BUSINESS_PROFILE_MAX_GALLERY_URLS} images. Drag or use the arrow buttons to reorder. Upload runs when
			you save the profile.
		</p>
	</div>

	<div class="overflow-hidden rounded-lg border border-base-300/80 bg-base-100/40">
		{#if rows.length === 0}
			<p class="px-3 py-4 text-sm text-base-content/55">No screenshots yet.</p>
		{:else}
			<ul class="divide-y divide-base-300/70">
				{#each rows as row, rowIndex (`gallery-row-${rowIndex}-${row.storageIndex}`)}
					{@const storageIndex = row.storageIndex}
					{@const displayUrl = slotDisplayUrl(storageIndex)}
					{@const path = pathAt(storageIndex)}
					{@const pending = Boolean(slots[storageIndex]?.localFile)}
					<li
						class="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3"
						ondragover={(event) => handleDragOver(event, rowIndex)}
						ondragenter={(event) => event.preventDefault()}
						ondrop={(event) => event.preventDefault()}
					>
						<div class="flex min-w-0 flex-1 items-center gap-3">
							<span
								role="button"
								tabindex={disabled ? -1 : 0}
								draggable={!disabled}
								class={cn(
									'inline-flex shrink-0 touch-none text-base-content/45 transition hover:text-base-content',
									disabled ? 'cursor-not-allowed opacity-40' : 'cursor-grab active:cursor-grabbing'
								)}
								aria-label="Reorder screenshot {rowIndex + 1}"
								ondragstart={(event) => handleRowDragStart(event, rowIndex)}
								ondragend={handleDragEnd}
							>
								<AbstractIcon
									name={icons.GripVertical.name}
									width="16"
									height="16"
									aria-hidden="true"
								/>
							</span>
							{#if displayUrl}
								<img
									class="size-14 shrink-0 rounded-md border border-base-300 object-cover"
									src={displayUrl}
									alt="Screenshot {rowIndex + 1}"
								/>
							{:else}
								<div
									class="flex size-14 shrink-0 items-center justify-center rounded-md border border-dashed border-base-300 bg-base-200/50 text-xs text-base-content/45"
								>
									—
								</div>
							{/if}
							<div class="min-w-0">
								<p class="text-sm font-medium text-base-content">Screenshot {rowIndex + 1}</p>
								<p class="text-xs text-base-content/55">
									{#if pending}
										Pending upload on save
									{:else}
										Uploaded
									{/if}
								</p>
							</div>
						</div>

						<div class="flex shrink-0 items-center gap-2 self-end sm:self-center">
							<div class="flex flex-col gap-0.5" role="group" aria-label="Reorder screenshot {rowIndex + 1}">
								<Button
									type="button"
									variant="outline"
									size="sm"
									class={reorderButtonClass}
									disabled={disabled || rowIndex === 0}
									aria-label="Move screenshot {rowIndex + 1} up"
									onclick={() => moveRow(rowIndex, 'up')}
								>
									<AbstractIcon name={icons.ArrowUp.name} width="16" height="16" aria-hidden="true" />
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									class={reorderButtonClass}
									disabled={disabled || rowIndex === rows.length - 1}
									aria-label="Move screenshot {rowIndex + 1} down"
									onclick={() => moveRow(rowIndex, 'down')}
								>
									<AbstractIcon name={icons.ArrowDown.name} width="16" height="16" aria-hidden="true" />
								</Button>
							</div>

							{#if pending}
								<Button
									type="button"
									variant="outline"
									size="sm"
									class={removeButtonClass}
									disabled={disabled}
									aria-label="Clear pending screenshot {rowIndex + 1}"
									onclick={() => clearSlotLocal(storageIndex)}
								>
									<AbstractIcon
										name={icons.X2.name}
										class="size-[1.125rem]"
										width="18"
										height="18"
										aria-hidden="true"
									/>
								</Button>
							{:else if path}
								<Button
									type="button"
									variant="outline"
									size="sm"
									class={cn(removeButtonClass, 'text-error hover:bg-error/10')}
									disabled={disabled || slotUploading(storageIndex)}
									aria-label="Remove screenshot {rowIndex + 1}"
									onclick={() => void removeStored(storageIndex)}
								>
									<AbstractIcon
										name={icons.X2.name}
										class="size-[1.125rem]"
										width="18"
										height="18"
										aria-hidden="true"
									/>
								</Button>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		{/if}

		{#if canAddMore && addIndex !== null}
			<div class="border-t border-base-300/70 p-3">
				<div class="relative rounded-lg border border-dashed border-base-300/90 bg-base-200/30 px-3 py-4">
					{#if slotUploading(addIndex)}
						<div class="absolute inset-0 flex items-center justify-center rounded-lg bg-base-200/80">
							<span class="animate-pulse text-xs">Uploading…</span>
						</div>
					{/if}
					<Label class="sr-only" for="business-profile-gallery-{addIndex}">Add screenshot</Label>
					<input
						id="business-profile-gallery-{addIndex}"
						type="file"
						accept="image/*"
						disabled={disabled || slotUploading(addIndex)}
						onchange={(e) => handleFileChange(addIndex, e)}
						class={cn(
							'file-input file-input-bordered file-input-sm w-full',
							(disabled || slotUploading(addIndex)) && 'pointer-events-none opacity-50'
						)}
					/>
				</div>
			</div>
		{/if}
	</div>
</div>
