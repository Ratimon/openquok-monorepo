<script lang="ts">
    import type { DatabaseName } from '$lib/core/Image.repository.svelte';
    import { DownloadStatus, DownloadImagePresenter } from '$lib/core/DownloadImage.presenter.svelte';

    import { onMount } from 'svelte';
    import { cn } from '$lib/ui/helpers/common';

    import { imageRepository } from '$lib/core/index';

    type Props = {
        class?: string;
        downloadedURL?: string;
        dbImageUrl: string | null;
        width: number;
        height: number;
        database: DatabaseName;
        imageAlt?: string;
        defaultImages?: { nameInDB: string; localHref: string }[];
    }

    let {
        class: className,
        downloadedURL,
        dbImageUrl,
        width,
        height,
        database,
        imageAlt,
        defaultImages
	}: Props = $props();

    // Create a unique presenter instance for this component
    const imageItemPresenter = new DownloadImagePresenter(imageRepository);

    let status = $derived(imageItemPresenter.imageVm.status);
    let imageUrl = $derived(imageItemPresenter.imageVm.imageUrl);
    let isLoading = $derived(status === DownloadStatus.LOADING);
    // let isError = $derived(status === ImageStatus.UNKNOWN);

    async function downloadImage(path: string) {
        try {
            await imageItemPresenter.loadImage(database as DatabaseName, path);
        } catch (error) {
            console.error(error);
        }
    }

    // Handle image download on mount
    // With key-based component recreation (listing.id), onMount will run when listings change
    onMount(() => {
        if (!downloadedURL && dbImageUrl) {
            const isLocalImage = defaultImages
                ? defaultImages.find((localImage) => localImage.nameInDB === dbImageUrl)
                : false;

            if (!isLocalImage) {
                downloadImage(dbImageUrl);
            }
        }
    });

</script>

<img
    class={cn(
        isLoading && "animate-pulse",
        "object-cover bg-no-repeat h-auto w-full",
        className,
    )}
    src={imageUrl || "/placeholder.png"}
    alt={imageAlt || "Cover Image"}
    placeholder={width > 100 && height > 100 ? "blur" : undefined}
    width={width}
    height={height}
/>