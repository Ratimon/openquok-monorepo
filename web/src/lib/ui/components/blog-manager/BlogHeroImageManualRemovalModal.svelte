<script lang="ts">
	import toast from 'svelte-hot-french-toast';

	import { BLOG_IMAGES_BUCKET } from '$lib/blog/constants/config';
	import Button from '$lib/ui/buttons/Button.svelte';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/ui/dialog';

	type Props = {
		open?: boolean;
		/** Object path(s) in the `blog_images` bucket that could not be deleted automatically. */
		failedPaths?: string[];
	};

	let { open = $bindable(false), failedPaths = $bindable<string[]>([]) }: Props = $props();

	const pathsText = $derived(failedPaths.join('\n'));
	const pathRows = $derived(Math.min(12, Math.max(4, failedPaths.length + 2)));

	function copyPaths() {
		navigator.clipboard.writeText(pathsText).then(
			() => toast.success('Storage path(s) copied to clipboard'),
			() => toast.error('Failed to copy')
		);
	}

	function closeModal() {
		open = false;
	}
</script>

<Dialog
	bind:open
	onOpenChange={(next) => {
		if (!next) failedPaths = [];
	}}
>
	<DialogContent showCloseButton={true}>
		<DialogHeader>
			<DialogTitle>Could not delete some image file(s) from storage</DialogTitle>
			<DialogDescription>
				The blog post was removed, but one or more files could not be deleted from storage automatically
				(hero and/or inline images). In the Supabase dashboard, open Storage → bucket
				<span class="font-mono font-semibold">{BLOG_IMAGES_BUCKET}</span>
				and delete the object(s) with the path(s) below (copy to clipboard).
			</DialogDescription>
		</DialogHeader>
		<div class="space-y-2 py-2">
			<label class="text-sm font-medium text-base-content" for="manual-storage-paths">
				Object path(s)</label>
			<textarea
				id="manual-storage-paths"
				readonly
				rows={pathRows}
				class="border-input bg-muted/30 font-mono text-sm min-h-[4.5rem] w-full resize-y rounded-md border px-3 py-2"
				value={pathsText}
			></textarea>
		</div>
		<DialogFooter>
			<Button variant="outline" type="button" onclick={copyPaths}>
				Copy path(s)
			</Button>
			<Button variant="primary" type="button" onclick={closeModal}>
				Close
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
