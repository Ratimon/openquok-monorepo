<script lang="ts">
    import {
        Dialog,
        DialogTitle,
        DialogDescription,
        DialogContent,
    } from '$lib/ui/dialog';

    type Props = {
        isOpen: boolean
        onClose: () => void
        imageSrc: string
        aspectRatio: string
    } 

    let {
        isOpen = $bindable(false),
        onClose,
        imageSrc,
        aspectRatio = '16/9',
    }: Props = $props();

</script>

<Dialog
	bind:open={isOpen}
	onOpenChange={(open) => {
		if (!open) onClose();
	}}
>
    <DialogContent class="flex h-fit max-h-[calc(100vh-4rem)] w-full flex-col items-center p-4">
        <DialogTitle>
            Image Preview
        </DialogTitle>
        <DialogDescription>
            Aspect Ratio: {aspectRatio}
        </DialogDescription>

        <div class="relative flex h-fit w-full flex-col items-center justify-center overflow-hidden">
            {#if imageSrc}
                <img
                    src={imageSrc}
                    alt="Preview"
                    width={800}
                    height={450}
                    class="aspect-video size-full rounded object-cover"
                />
            {/if}
            <div class="pointer-events-none absolute inset-0">
                <div class="flex size-full items-center justify-center">
                  <div class="aspect-video w-full border-2 border-primary">
                  </div>
                </div>
            </div>
        </div>
    </DialogContent>
</Dialog>