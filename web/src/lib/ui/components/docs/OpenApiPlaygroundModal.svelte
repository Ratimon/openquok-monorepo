<script lang="ts">
	import * as Dialog from '$lib/ui/dialog';
	import { cn } from '$lib/ui/helpers/common';

	import OpenApiPlayground from '$lib/ui/components/docs/mdx/OpenApiPlayground.svelte';

	let {
		open = $bindable(false),
		operation,
		specUrl = '/api/v1/openapi.json',
		onClose
	}: {
		open?: boolean;
		operation: string;
		specUrl?: string;
		onClose?: () => void;
	} = $props();
</script>

<Dialog.Root
	bind:open
	onOpenChange={(v) => {
		if (!v) onClose?.();
	}}
>
	<Dialog.Content
		class={cn(
			'flex max-h-[min(92vh,960px)] h-[min(92vh,960px)] w-[min(96vw,1320px)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none'
		)}
		showCloseButton={true}
	>
		<div class="border-base-300 flex shrink-0 items-center gap-2 border-b px-4 py-3 pe-14">
			<Dialog.Title class="text-base-content text-base font-semibold tracking-tight">
				Interactive playground
			</Dialog.Title>
		</div>
		<div class="bg-base-200/20 min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3">
			<OpenApiPlayground {operation} {specUrl} layout="modal" />
		</div>
	</Dialog.Content>
</Dialog.Root>
