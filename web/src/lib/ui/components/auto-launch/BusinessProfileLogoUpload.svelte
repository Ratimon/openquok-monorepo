<script lang="ts">
	import type { DatabaseName } from '$lib/core/Image.repository.svelte';

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
	import ImagePreviewModal from '$lib/ui/supabase/ImagePreviewModal.svelte';

	type Props = {
		value: string | null;
		onChange: (storagePath: string | null) => void;
		disabled?: boolean;
	};

	let { value, onChange, disabled = false }: Props = $props();

	const databaseName: DatabaseName = AUTO_LAUNCH_PROFILE_MEDIA_BUCKET;

	const uploadAreaPresenter = new SupabaseImageUploadAreaPresenter(
		new DownloadImagePresenter(imageRepository),
		new UploadImagePresenter(imageRepository),
		new DeleteImagePresenter(imageRepository)
	);

	let localFile = $state<File | null>(null);
	let localPreviewUrl = $state<string | null>(null);
	let selectedPreview = $state<string | null>(null);
	let loadedStorageKey = $state('');

	function resolvedStoredPreview(
		blobOrUrl: string | null | undefined,
		storagePath: string | null
	): string | null {
		if (blobOrUrl?.startsWith('blob:') || /^https?:\/\//i.test(blobOrUrl ?? '')) {
			return blobOrUrl ?? null;
		}
		return storagePath ? resolveAutoLaunchProfileImageUrl(storagePath) : null;
	}

	let displayUrl = $derived(
		localPreviewUrl ??
			resolvedStoredPreview(uploadAreaPresenter.uploadAreaVm.imageURL, value) ??
			(value ? resolveAutoLaunchProfileImageUrl(value) : null)
	);

	let isUploading = $derived(
		uploadAreaPresenter.uploadAreaVm.uploadStatus === FileUploadStatus.UPLOADING
	);

	$effect(() => {
		if (localFile) return;

		const storageKey = (value ?? '').trim();
		if (storageKey === loadedStorageKey) return;

		loadedStorageKey = storageKey;
		if (!storageKey) {
			uploadAreaPresenter.reset();
			return;
		}
		void uploadAreaPresenter.loadImage(databaseName, storageKey);
	});

	function handleFileChange(event: Event) {
		const files = (event.target as HTMLInputElement).files;
		if (!files?.length) return;
		const file = files[0];
		localFile = file;
		if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
		localPreviewUrl = URL.createObjectURL(file);
	}

	function clearLocalSelection() {
		if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
		localFile = null;
		localPreviewUrl = null;
		const input = document.getElementById('business-profile-logo-file') as HTMLInputElement | null;
		if (input) input.value = '';
	}

	export function hasPendingUpload(): boolean {
		return Boolean(localFile);
	}

	export async function uploadPending(uploadUid: string): Promise<string | null> {
		if (!localFile) {
			return value;
		}
		try {
			await uploadAreaPresenter.uploadImage(databaseName, localFile, uploadUid);
			const filePath = uploadAreaPresenter.uploadAreaVm.filePath;
			if (!filePath) {
				toast.error('Logo upload failed. Try again.');
				return value;
			}
			onChange(filePath);
			clearLocalSelection();
			return filePath;
		} catch {
			toast.error('Logo upload failed. Check file size and format.');
			return value;
		}
	}

	async function handleRemoveStored(event: Event) {
		event.preventDefault();
		if (!value || disabled) return;
		try {
			await uploadAreaPresenter.deleteImage(databaseName, value);
			onChange(null);
			uploadAreaPresenter.reset();
			clearLocalSelection();
		} catch {
			toast.error('Could not remove logo.');
		}
	}
</script>

<div class="space-y-2">
	<div class="relative inline-block">
		<button
			type="button"
			class="cursor-pointer rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
			disabled={disabled || !displayUrl}
			onclick={() => {
				if (displayUrl) selectedPreview = displayUrl;
			}}
		>
			<img
				class={cn('aspect-square rounded-xl border border-base-300 object-cover')}
				src={displayUrl ?? '/placeholder.png'}
				alt="Product logo"
				width={96}
				height={96}
				style="width: 96px; height: 96px;"
			/>
		</button>
		{#if localFile}
			<Button
				type="button"
				class="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-error p-0 text-error-content hover:bg-error/90"
				variant="ghost"
				size="sm"
				disabled={disabled}
				onclick={clearLocalSelection}
				aria-label="Remove selected file"
			>
				×
			</Button>
		{/if}
	</div>

	{#if value && !localFile}
		<Button
			type="button"
			class="text-xs text-error hover:text-error/80"
			variant="ghost"
			size="sm"
			disabled={disabled || isUploading}
			onclick={handleRemoveStored}
		>
			Remove logo
		</Button>
	{/if}

	<div class="grid w-full max-w-md items-center gap-1.5">
		<Label class="text-xs text-base-content/70" for="business-profile-logo-file">
			PNG, JPG, JPEG, or WebP. Max 4 MB. Upload runs when you save the profile.
		</Label>
		<div class="relative">
			{#if isUploading}
				<div class="absolute inset-0 flex items-center justify-center rounded-md bg-base-200/80">
					<span class="animate-pulse text-sm">Uploading…</span>
				</div>
			{/if}
			<input
				id="business-profile-logo-file"
				type="file"
				accept="image/*"
				disabled={disabled || isUploading}
				onchange={handleFileChange}
				class={cn(
					'file-input file-input-bordered file-input-sm w-full',
					(isUploading || disabled) && 'pointer-events-none opacity-50'
				)}
			/>
		</div>
	</div>

	<ImagePreviewModal
		isOpen={!!selectedPreview}
		onClose={() => {
			selectedPreview = null;
		}}
		imageSrc={selectedPreview ?? ''}
		aspectRatio="1/1"
	/>
</div>
