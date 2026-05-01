<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type UploadPhase = 'idle' | 'encoding' | 'uploading';

	type Props = {
		uploadBusy: boolean;
		uploadPhase: UploadPhase;
		barPercent: number;
		uploadDetailLine: string;
	};

	let { uploadBusy, uploadPhase, barPercent, uploadDetailLine }: Props = $props();
</script>

{#if uploadBusy}
	<div class="pointer-events-none fixed inset-x-0 top-0 z-50">
		<div class="h-1 w-full overflow-hidden bg-base-300">
			{#if uploadPhase === 'encoding'}
				<div class="h-full w-full bg-warning/90 animate-pulse"></div>
			{:else}
				<div
					class="h-full bg-primary transition-[width] duration-150 ease-out"
					style={`width: ${barPercent}%`}
				></div>
			{/if}
		</div>
		<div
			class="pointer-events-auto flex items-start gap-2 border-b border-base-300/80 bg-base-100/95 px-4 py-2 text-sm shadow-sm backdrop-blur-sm"
		>
			<AbstractIcon
				name={icons.LoaderCircle.name}
				class={`mt-0.5 size-4 shrink-0 ${uploadPhase === 'encoding' ? 'text-warning' : 'text-primary'} animate-spin`}
				width="16"
				height="16"
			/>
			<div class="min-w-0 flex-1">
				<div class="font-medium text-base-content">
					{#if uploadPhase === 'encoding'}
						Encoding…
					{:else}
						Uploading: {barPercent}%
					{/if}
				</div>
				{#if uploadPhase === 'uploading' && uploadDetailLine}
					<div class="truncate text-xs text-base-content/60">{uploadDetailLine}</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
