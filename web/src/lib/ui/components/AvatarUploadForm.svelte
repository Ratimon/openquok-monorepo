<script lang="ts">
	import type { DatabaseName } from '$lib/core/Image.repository.svelte';
	import type { AvatarUploadViewModel } from '$lib/core/AvatarUpload.presenter.svelte';
	import { FileUploadStatus } from '$lib/core/UploadImage.presenter.svelte';

	import { toast } from '$lib/ui/sonner';
	import { cn } from '$lib/ui/helpers/common';

	import Button from '$lib/ui/buttons/Button.svelte';
	import Label from '$lib/ui/label/Label.svelte';
	import ImagePreviewModal from '$lib/ui/supabase/ImagePreviewModal.svelte';

	type Props = {
		uid: string;
		url: string | null | undefined;
		size: number;
		onFormTouch: (url: string) => void;
		databaseName: DatabaseName;

		avatarVm: AvatarUploadViewModel;
		onLoadAvatar: (databaseName: DatabaseName, imageUrl: string) => void;
		onUploadAvatar: (databaseName: DatabaseName, imageFile: File, uid: string) => void;
		onToastMessageChange: (show: boolean) => void;

		onFileSelect?: (file: File) => void;
		onFileRemove?: () => void;
		onDeleteAvatar?: (databaseName: DatabaseName, imagePath: string) => Promise<void>;
		onFormSubmit?: () => void | Promise<void>;
		/** When `url` becomes empty — revoke blob preview (e.g. singleton presenter still held old blob). */
		onClearPreview?: () => void;
	};

	let {
		uid,
		url,
		size,
		onFormTouch,
		databaseName,

		avatarVm,
		onLoadAvatar,
		onUploadAvatar,
		onToastMessageChange,

		onFileSelect,
		onFileRemove,
		onDeleteAvatar,
		onFormSubmit,
		onClearPreview
	}: Props = $props();

	let avatarUrl = $derived(avatarVm.avatarUrl);
	let uploadStatus = $derived(avatarVm.uploadStatus);
	let isUploaded = $derived(uploadStatus === FileUploadStatus.UPLOADED);
	let isUploading = $derived(uploadStatus === FileUploadStatus.UPLOADING);
	let showToastMessage = $derived(avatarVm.showToastMessage);
	let toastMessage = $derived(avatarVm.toastMessage);
	let filePath = $derived(avatarVm.filePath);

	let selectedImage: string | null = $state(null);

	let localSelectedFile: File | null = $state(null);
	let localPreviewUrl: string | null = $state(null);

	let previousUrl = $state<string | null | undefined>(undefined);

	$effect(() => {
		const u = url;
		if (!u) {
			previousUrl = undefined;
			selectedImage = null;
			onClearPreview?.();
			return;
		}
		if (u === previousUrl) return;
		if (localSelectedFile) return;
		void onLoadAvatar(databaseName, u);
		previousUrl = u;
	});

	function handleFileChange(event: Event) {
		const files = (event.target as HTMLInputElement).files;

		if (files && files.length > 0) {
			const file = files[0];
			localSelectedFile = file;

			if (localPreviewUrl) {
				URL.revokeObjectURL(localPreviewUrl);
			}
			localPreviewUrl = URL.createObjectURL(file);

			onFileSelect?.(file);
		}
	}

	function handleImageClick(preview: string, event: Event) {
		event.preventDefault();
		event.stopPropagation();
		selectedImage = preview;
	}

	function handleRemovePreview(event: Event) {
		event.preventDefault();
		event.stopPropagation();

		if (localPreviewUrl) {
			URL.revokeObjectURL(localPreviewUrl);
		}

		localSelectedFile = null;
		localPreviewUrl = null;

		const fileInput = document.getElementById('account-avatar-file') as HTMLInputElement;
		if (fileInput) {
			fileInput.value = '';
		}

		onFileRemove?.();
	}

	async function handleDeleteUploadedAvatar(event: Event) {
		event.preventDefault();
		event.stopPropagation();

		const imagePathToDelete = url || avatarUrl;

		if (!imagePathToDelete || !onDeleteAvatar) {
			return;
		}

		try {
			await onDeleteAvatar(databaseName, imagePathToDelete);
			onFormTouch('');

			if (onFormSubmit) {
				await onFormSubmit();
			}

			toast.success('Avatar deleted successfully');
		} catch {
			toast.error('Failed to delete avatar. Please try again.');
		}
	}

	export async function uploadSelectedFile(): Promise<string | null> {
		if (!localSelectedFile) {
			return null;
		}

		try {
			const oldImagePath = url;
			if (oldImagePath && onDeleteAvatar) {
				try {
					await onDeleteAvatar(databaseName, oldImagePath);
				} catch {
					/* non-fatal */
				}
			}

			await onUploadAvatar(databaseName, localSelectedFile, uid);

			if (!filePath) {
				toast.error('Failed to upload avatar. Please try again.');
				return null;
			}
			if (filePath && isUploaded && showToastMessage) {
				toast.success(toastMessage);
				onFormTouch(filePath);
				return filePath;
			}
			if (!isUploaded && showToastMessage) {
				toast.error(toastMessage);
				return null;
			}

			return filePath;
		} catch {
			toast.error('Error uploading avatar. File too big or wrong format.');
			return null;
		} finally {
			onToastMessageChange(false);
		}
	}
</script>

<div>
	<div class="relative inline-block">
		<button
			type="button"
			onclick={(event) => handleImageClick(localPreviewUrl || avatarUrl || '/placeholder.png', event)}
			class="cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
		>
			<img
				class={cn('aspect-square rounded-full object-cover')}
				src={localPreviewUrl || avatarUrl || '/placeholder.png'}
				alt="Avatar"
				width={size}
				height={size}
				style="width: {size}px; height: {size}px;"
			/>
		</button>

		{#if localSelectedFile}
			<Button
				type="button"
				class="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-error p-0 text-error-content hover:bg-error/90"
				variant="ghost"
				size="sm"
				onclick={handleRemovePreview}
				aria-label="Remove selected file"
			>
				×
			</Button>
		{/if}
	</div>

	{#if (url || avatarUrl) && !localSelectedFile}
		<div class="mt-2">
			<Button
				type="button"
				class="text-xs text-error hover:text-error/80"
				variant="ghost"
				size="sm"
				onclick={handleDeleteUploadedAvatar}
			>
				Delete uploaded avatar
			</Button>
		</div>
	{/if}

	<div class="mt-4 grid w-full max-w-sm items-center gap-1.5">
		<Label class="text-xs italic" for="account-avatar-file">
			Choose avatar file. PNG, JPG, JPEG, or WebP. Max 4 MB.
		</Label>
		<div class="relative">
			{#if isUploading}
				<div class="absolute inset-0 flex items-center justify-center rounded-md bg-base-200/80">
					<span class="animate-pulse text-sm">Uploading…</span>
				</div>
			{/if}
			<input
				id="account-avatar-file"
				type="file"
				name="account-avatar-file"
				accept="image/*"
				onchange={handleFileChange}
				disabled={isUploading}
				class={cn(
					'file-input file-input-bordered file-input-sm w-full',
					isUploading && 'pointer-events-none opacity-50'
				)}
			/>
		</div>
	</div>

	<ImagePreviewModal
		isOpen={!!selectedImage}
		onClose={() => {
			selectedImage = null;
		}}
		imageSrc={selectedImage || ''}
		aspectRatio="1/1"
	/>
</div>
