<script lang="ts">
    import { FileUploadStatus } from "$lib/core/UploadImage.presenter.svelte";
    import type { UploadAreaViewModel } from "$lib/core/SupabaseImageUploadArea.presenter.svelte";
    import type { DatabaseName } from "$lib/core/Image.repository.svelte";
    import type { LocalImage } from "$lib/core/constants/types";

    import { onMount, onDestroy } from 'svelte';
    import { toast } from '$lib/ui/sonner';
    import { cn } from '$lib/ui/helpers/common';
    import { icons } from "$data/icon";

    import AbstractIcon from "$lib/ui/icons/AbstractIcon.svelte";
    import Button from '$lib/ui/buttons/Button.svelte';
    import Input from '$lib/ui/input/Input.svelte';
    import { Label } from '$lib/ui/label';
    import ImagePreviewModal from '$lib/ui/supabase/ImagePreviewModal.svelte';

    /** Must stay under Vercel serverless body limit (4.5MB). Backend uses 4MB. */
    const MAX_IMAGE_UPLOAD_BYTES = 4 * 1024 * 1024;

    type Props = {
        duid: string;
        url: string | null | undefined;
        width: number;
        height: number;
        aspectRatio: string;
        onFormTouch: (url: string) => void;
        databaseName: DatabaseName;
        /** If set, called before uploading a replacement (e.g. remove old object from storage). */
        deletePreviousStorage?: (databaseName: DatabaseName, imagePath: string) => Promise<void>;

        uploadAreaVm: UploadAreaViewModel;
        onLoadImage: (databaseName: DatabaseName, imageUrl: string) => void;
        onUploadImage: (databaseName: DatabaseName, imageFile: File, uid: string) => void;
        onToastMessageChange: (show: boolean) => void;
        onReset?: () => void;
    };

    let {
        duid,
        url,
        width,
        height,
        aspectRatio,
        onFormTouch,
        databaseName,
        deletePreviousStorage,

        uploadAreaVm,
        onLoadImage,
        onUploadImage,
        onToastMessageChange,
        onReset,
    }: Props = $props();

    let imageUrl = $derived(uploadAreaVm.imageURL);
    let uploadStatus = $derived(uploadAreaVm.uploadStatus);
    // let isUploaded = $derived(uploadStatus === FileUploadStatus.UPLOADED);
    let isUploading = $derived(uploadStatus === FileUploadStatus.UPLOADING);
    let showToastMessage = $derived(uploadAreaVm.showToastMessage);
    let toastMessage = $derived(uploadAreaVm.toastMessage);
    // let filePath = $derived(uploadAreaVm.filePath);

    let previewImage: LocalImage | null = $state(null);
    let selectedImage: string | null = $state(null);

    onMount(() => {
        if (url) {
            onLoadImage(databaseName, url);
        } else {
            // Reset upload area VM when mounting with no url (new sublisting)
            onReset?.();
        }
    });

    onDestroy(() => {
        onReset?.();
        if (previewImage?.preview) {
            URL.revokeObjectURL(previewImage.preview);
        }
        // Clear component internal state
        previewImage = null;
    });

    function handleFileChange(event: Event) {
        const files = (event.target as HTMLInputElement).files;

        if (files && files.length > 0) {
            const file = files[0];
            if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
                toast.error(`Image must be 4 MB or smaller. This file is ${(file.size / (1024 * 1024)).toFixed(1)} MB.`);
                (event.target as HTMLInputElement).value = '';
                return;
            }
            const preview = URL.createObjectURL(file);

            previewImage = {
                file,
                preview,
                isDefault: true,
                isNew: true,
                uploadedFilename: undefined
            };
        }
    }

    function handleRemovePreview() {
        if (previewImage?.preview) {
            URL.revokeObjectURL(previewImage.preview);
        }
        previewImage = null;
    }

    function handleImageClick(preview: string) {
        selectedImage = preview;
    }

    /** Storage object key from DB — not a full URL or blob preview. */
    function isStorageObjectKey(s: string | null | undefined): s is string {
        if (!s || typeof s !== 'string') return false;
        const t = s.trim();
        if (!t) return false;
        if (/^https?:\/\//i.test(t)) return false;
        if (t.startsWith('blob:')) return false;
        if (t === '/placeholder.png' || t.endsWith('placeholder.png')) return false;
        return true;
    }

    // Expose to parent component — returns new storage path on success, false on failure
    export async function uploadSelectedImage(): Promise<string | false> {
        if (!previewImage?.file) {
            toast.error("Please select an image to upload.");
            return false;
        }
        if (previewImage.file.size > MAX_IMAGE_UPLOAD_BYTES) {
            toast.error("Image must be 4 MB or smaller. Please choose a smaller file.");
            return false;
        }

        try {
            const previousKey = isStorageObjectKey(url) ? url.trim() : null;
            if (previousKey && deletePreviousStorage) {
                try {
                    await deletePreviousStorage(databaseName, previousKey);
                } catch (err) {
                    const msg =
                        err instanceof Error && err.message
                            ? err.message
                            : 'Could not remove the previous image from storage.';
                    toast.error(
                        `${msg} Replace was cancelled — your other changes can still be saved without a new hero image.`
                    );
                    return false;
                }
            }

            await onUploadImage(
                databaseName,
                previewImage.file,
                duid
            );
            const uploadedPath = uploadAreaVm.filePath;
            const uploadedSuccessfully =
                uploadAreaVm.uploadStatus === FileUploadStatus.UPLOADED && !!uploadedPath;

            if (uploadedSuccessfully && uploadedPath) {
                onFormTouch(uploadedPath);
                handleRemovePreview();
                if (showToastMessage && toastMessage) {
                    toast.success(toastMessage);
                }
                return uploadedPath;
            }

            if (showToastMessage && toastMessage) {
                toast.error(toastMessage);
            } else {
                toast.error('Failed to upload image. Please try again.');
            }
            return false;
        } catch (error) {
            toast.error("Upload failed. Use an image under 4 MB in .png, .jpg, .jpeg or .webp.");
            return false;
        } finally {
            onToastMessageChange(false);
        }
    }

    // Expose getters for parent component
    export function getSelectedFile() {
        return previewImage?.file || null;
    }

    export function hasSelectedFile() {
        return !!previewImage?.file;
    }
</script>

<div>
    {#if previewImage}
        <div class="group relative">
            <button
                onclick={() => handleImageClick(previewImage!.preview!)}
            >
                <img
                    class={cn(width === height && "aspect-square")}
                    src={previewImage.preview}
                    alt="Preview"
                    width={width}
                    height={height}
                />
            </button>

            <div class="absolute inset-x-0 bottom-0 hidden items-center justify-between bg-black/50 p-2 text-white group-hover:flex">
                <span class="ml-2 text-xs font-semibold">
                    Preview
                </span>

                <Button
                    class="text-xs text-red-500"
                    variant="ghost"
                    size="sm"
                    onclick={handleRemovePreview}
                >
                    <AbstractIcon name={icons.Trash.name} width="16" height="16" />
                </Button>
            </div>
        </div>
    {:else}
        <!-- Default/Current Image -->
        <img
            class={cn(width === height && "aspect-square")}
            src={imageUrl || "/placeholder.png"}
            alt="Placeholder"
            width={width}
            height={height}
        />
    {/if}

    <!-- File Upload Section -->
    <div class="mt-4 grid w-full gap-1.5">
        <Label
            class="text-xs italic"
            for="picture"
        >
            Choose file. Only png, jpg, jpeg, webp. Max 4 MB. Aspect Ratio: {aspectRatio}
        </Label>

        <div class="relative">
            {#if isUploading}
                <div class="absolute inset-0 flex items-center justify-center">
                    <span class="animate-spin">
                        <AbstractIcon name={icons.LoaderCircle.name} width="40" height="40" focusable="false" />
                    </span>
                </div>
            {/if}
            <Input
                type="file"
                name="picture"
                id="single"
                accept="image/png,image/jpeg,image/jpg,image/webp"     
                onchange={handleFileChange}
                disabled={isUploading}
                class={isUploading ? 'opacity-50' : ''}
            />
        </div>

    </div>

    <ImagePreviewModal
        isOpen={!!selectedImage}
        onClose={() => selectedImage = null}
        imageSrc={selectedImage || ""}
        aspectRatio={aspectRatio}
    />
</div>
