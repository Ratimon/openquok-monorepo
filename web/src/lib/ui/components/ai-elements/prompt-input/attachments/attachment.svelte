<script lang="ts">
	import { icons } from '$data/icons';
	import { cn } from '$lib/ui/helpers/common';

	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Tooltip from '$lib/ui/tooltip';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	import { getAttachmentsContext } from '../context/attachments.svelte.js';
	import type { PromptInputAttachment } from '../context/types.js';
	import AttachmentImagePreview from './attachment-image-preview.svelte';

	interface Props {
		data: PromptInputAttachment;
		class?: string;
	}

	let { data, class: className, ...props }: Props = $props();

	let attachmentsContext = getAttachmentsContext();
	let displayUrl = $derived(data.previewUrl ?? data.remoteUrl);

	let mediaType = $derived(data.mediaType?.startsWith('image/') && displayUrl ? 'image' : 'file');
</script>

<div
	class={cn(
		'group relative rounded-md border',
		mediaType === 'image' ? 'size-16' : 'h-8 w-auto max-w-full',
		className
	)}
	{...props}
>
	{#if mediaType === 'image'}
		<AttachmentImagePreview {data} />
	{:else}
		<div
			class="text-muted-foreground flex size-full max-w-full cursor-pointer items-center justify-start gap-2 overflow-hidden px-2"
		>
			<AbstractIcon
				name={icons.Paperclip.name}
				class="size-4 shrink-0"
				width="16"
				height="16"
				aria-hidden="true"
			/>
			<Tooltip.Root delayDuration={400}>
				<Tooltip.Trigger class="min-w-0 flex-1">
					<h4 class="w-full truncate text-left text-sm font-medium">
						{data.filename || 'Unknown file'}
					</h4>
				</Tooltip.Trigger>
				<Tooltip.Content>
					<div class="text-xs">
						<h4
							class="max-w-60 overflow-hidden text-left text-sm font-semibold wrap-break-word whitespace-normal"
						>
							{data.filename || 'Unknown file'}
						</h4>
						{#if data.mediaType}
							<div>{data.mediaType}</div>
						{/if}
					</div>
				</Tooltip.Content>
			</Tooltip.Root>
		</div>
	{/if}
	<Tooltip.Root delayDuration={200}>
		<Tooltip.Trigger>
			{#snippet child({ props: tooltipTriggerProps })}
				<Button
					aria-label={mediaType === 'image' ? 'Remove image' : 'Remove file'}
					class="absolute top-0.5 right-0.5 size-5 rounded-full opacity-0 group-hover:opacity-100"
					{...tooltipTriggerProps}
					onclick={(event) => {
						event.stopPropagation();
						attachmentsContext.remove(data.id);
					}}
					size="icon"
					type="button"
					variant="secondary"
				>
					<AbstractIcon
						name={icons.X2.name}
						class="size-3"
						width="12"
						height="12"
						aria-hidden="true"
					/>
				</Button>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content>
			{mediaType === 'image' ? 'Remove image' : 'Remove file'}
		</Tooltip.Content>
	</Tooltip.Root>
</div>
