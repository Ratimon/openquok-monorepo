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
	<div
		class="pointer-events-auto fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
		role="status"
		aria-live="polite"
		aria-busy="true"
	>
		<div
			class="border-base-300/80 bg-base-100/95 w-full max-w-md rounded-2xl border px-6 py-7 shadow-2xl backdrop-blur-md"
		>
			<div class="flex flex-col items-center gap-5 text-center">
				<AbstractIcon
					name={icons.LoaderCircle.name}
					class={`size-10 shrink-0 ${uploadPhase === 'encoding' ? 'text-warning' : 'text-primary'} animate-spin`}
					width="40"
					height="40"
				/>

				<div class="min-w-0 space-y-1">
					<div class="text-lg font-semibold text-base-content">
						{#if uploadPhase === 'encoding'}
							Encoding…
						{:else}
							Uploading: {barPercent}%
						{/if}
					</div>
					{#if uploadPhase === 'uploading' && uploadDetailLine}
						<div class="text-base-content/65 text-sm">
							{uploadDetailLine}
						</div>
					{/if}
				</div>

				<div class="bg-base-300/80 h-2.5 w-full overflow-hidden rounded-full">
					{#if uploadPhase === 'encoding'}
						<div class="bg-warning/90 h-full w-full animate-pulse"></div>
					{:else}
						<div
							class="bg-primary h-full rounded-full transition-[width] duration-150 ease-out"
							style={`width: ${barPercent}%`}
						></div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
