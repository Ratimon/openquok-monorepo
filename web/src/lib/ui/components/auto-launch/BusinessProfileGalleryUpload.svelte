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
	import { toast } from '$lib/ui/sonner';
	import { cn } from '$lib/ui/helpers/common';

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

	$effect(() => {
		const paths = urls;
		for (let i = 0; i < BUSINESS_PROFILE_MAX_GALLERY_URLS; i++) {
			const path = paths[i];
			const slot = slots[i];
			if (!slot || !path || slot.localFile) continue;
			void slot.presenter.loadImage(databaseName, path);
		}
	});

	function slotDisplayUrl(index: number): string | null {
		const slot = slots[index];
		const path = urls[index];
		if (!slot) return null;
		return (
			slot.localPreviewUrl ??
			slot.presenter.uploadAreaVm.imageURL ??
			(path ? resolveAutoLaunchProfileImageUrl(path) : null)
		);
	}

	function slotUploading(index: number): boolean {
		return slots[index]?.presenter.uploadAreaVm.uploadStatus === FileUploadStatus.UPLOADING;
	}

	function handleFileChange(index: number, event: Event) {
		const files = (event.target as HTMLInputElement).files;
		if (!files?.length) return;
		const file = files[0];
		const slot = slots[index];
		if (!slot) return;
		if (slot.localPreviewUrl) URL.revokeObjectURL(slot.localPreviewUrl);
		slot.localFile = file;
		slot.localPreviewUrl = URL.createObjectURL(file);
		slots = [...slots];
	}

	function clearSlotLocal(index: number) {
		const slot = slots[index];
		if (!slot) return;
		if (slot.localPreviewUrl) URL.revokeObjectURL(slot.localPreviewUrl);
		slot.localFile = null;
		slot.localPreviewUrl = null;
		const input = document.getElementById(`business-profile-gallery-${index}`) as HTMLInputElement | null;
		if (input) input.value = '';
		slots = [...slots];
	}

	function removeAtIndex(index: number) {
		const next = urls.filter((_, i) => i !== index);
		onChange(next);
		const slot = slots[index];
		if (slot) {
			slot.presenter.reset();
			clearSlotLocal(index);
		}
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

	async function removeStored(index: number) {
		const path = urls[index];
		if (!path || disabled) return;
		const slot = slots[index];
		try {
			if (slot) {
				await slot.presenter.deleteImage(databaseName, path);
				slot.presenter.reset();
				clearSlotLocal(index);
			}
			removeAtIndex(index);
		} catch {
			toast.error('Could not remove gallery image.');
		}
	}

	function canPickFile(index: number): boolean {
		if (urls[index] || slots[index]?.localFile) return false;
		const occupied = urls.length + slots.filter((s) => s.localFile).length;
		return index < occupied + 1 && occupied < BUSINESS_PROFILE_MAX_GALLERY_URLS;
	}
</script>

<div class="space-y-3">
	<p class="text-xs text-base-content/70">
		Up to {BUSINESS_PROFILE_MAX_GALLERY_URLS} screenshots. Upload runs when you save the profile.
	</p>
	<div class="grid gap-4 sm:grid-cols-3">
		{#each Array(BUSINESS_PROFILE_MAX_GALLERY_URLS) as _, index (index)}
			{@const path = urls[index]}
			{@const displayUrl = slotDisplayUrl(index)}
			<div class="space-y-2 rounded-lg border border-base-300/80 p-3">
				<span class="text-xs font-medium text-base-content/80">Image {index + 1}</span>
				{#if displayUrl}
					<img
						class="aspect-video w-full rounded-md border border-base-300 object-cover"
						src={displayUrl}
						alt="Gallery preview {index + 1}"
					/>
				{:else}
					<div
						class="flex aspect-video w-full items-center justify-center rounded-md border border-dashed border-base-300 bg-base-200/40 text-xs text-base-content/50"
					>
						No image
					</div>
				{/if}

				{#if path && !slots[index]?.localFile}
					<Button
						type="button"
						variant="ghost"
						size="sm"
						class="text-xs text-error"
						disabled={disabled || slotUploading(index)}
						onclick={() => void removeStored(index)}
					>
						Remove
					</Button>
				{/if}

				{#if slots[index]?.localFile}
					<Button
						type="button"
						variant="ghost"
						size="sm"
						class="text-xs"
						disabled={disabled}
						onclick={() => clearSlotLocal(index)}
					>
						Clear selection
					</Button>
				{/if}

				{#if canPickFile(index)}
					<div class="relative">
						{#if slotUploading(index)}
							<div class="absolute inset-0 flex items-center justify-center rounded-md bg-base-200/80">
								<span class="animate-pulse text-xs">Uploading…</span>
							</div>
						{/if}
						<Label class="sr-only" for="business-profile-gallery-{index}">Gallery file {index + 1}</Label>
						<input
							id="business-profile-gallery-{index}"
							type="file"
							accept="image/*"
							disabled={disabled || slotUploading(index)}
							onchange={(e) => handleFileChange(index, e)}
							class={cn(
								'file-input file-input-bordered file-input-xs w-full',
								(disabled || slotUploading(index)) && 'pointer-events-none opacity-50'
							)}
						/>
					</div>
				{:else if path}
					<p class="text-xs text-base-content/50">Remove this image to replace it.</p>
				{/if}
			</div>
		{/each}
	</div>
</div>
