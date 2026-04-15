<script lang="ts">
	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import DeleteDialog from '$lib/ui/components/launches/DeleteDialog.svelte';

	type Props = {
		body?: string;
		busy?: boolean;
		charCount: number;
		softCharLimit: number;
		locked?: boolean;
		lockMessage?: string;
		onUnlock?: () => void;
		bannerLeftLabel?: string | null;
		bannerRightActionLabel?: string | null;
		onBannerRightAction?: () => void;
		confirmBannerRightAction?: boolean;
	};

	let {
		body = $bindable(''),
		busy = false,
		charCount,
		softCharLimit,
		locked = false,
		lockMessage = 'Click this button to exit global editing and customize the post for this channel',
		onUnlock,
		bannerLeftLabel = null,
		bannerRightActionLabel = null,
		onBannerRightAction,
		confirmBannerRightAction = false,
	}: Props = $props();

	let confirmOpen = $state(false);

	function requestBannerRightAction() {
		if (!onBannerRightAction) return;
		if (confirmBannerRightAction) {
			confirmOpen = true;
			return;
		}
		onBannerRightAction();
	}

	function confirm() {
		confirmOpen = false;
		onBannerRightAction?.();
	}
</script>

<div class="min-h-0 flex-1">
	{#if bannerLeftLabel || bannerRightActionLabel}
		<div class="text-base-content/70 mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
			<div class="flex items-center gap-2">
				{#if bannerLeftLabel}
					<span class="inline-flex items-center gap-2">
						<span class="bg-primary/70 inline-block h-2 w-2 rounded-full"></span>
						<span class="font-medium">{bannerLeftLabel}</span>
					</span>
				{/if}
			</div>
			{#if bannerRightActionLabel && onBannerRightAction}
				<button
					type="button"
					class="hover:text-base-content text-base-content/70 inline-flex items-center gap-2 rounded-md px-2 py-1 font-medium"
					onclick={() => requestBannerRightAction()}
				>
					<AbstractIcon name={icons.ArrowBack.name} class="size-4" width="16" height="16" />
					{bannerRightActionLabel}
				</button>
			{/if}
		</div>
	{/if}

	<label class="sr-only" for="composer-body">Post body</label>
	<div class="relative">
		<textarea
			id="composer-body"
			bind:value={body}
			rows="8"
			placeholder="Write something…"
			disabled={busy || locked}
			class="border-base-300 bg-base-200 focus:border-primary focus:ring-primary/30 focus:ring-inset min-h-[140px] sm:min-h-[180px] max-h-[320px] w-full resize-none sm:resize-y rounded-lg border px-3 py-2 text-sm text-base-content placeholder:text-base-content/40 focus:ring-2 focus:outline-none"
		></textarea>

		{#if locked}
			<div class="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-black/45 p-6 text-center">
				<div class="bg-base-100/90 mb-3 flex h-12 w-12 items-center justify-center rounded-full">
					<AbstractIcon name={icons.Lock.name} class="size-6" width="24" height="24" />
				</div>
				<p class="mb-4 max-w-[420px] text-sm font-medium text-white/90">{lockMessage}</p>
				<Button type="button" variant="primary" disabled={busy} onclick={() => onUnlock?.()}>
					Edit content
				</Button>
			</div>
		{/if}
	</div>
	<div class="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-base-300/80 pt-2">
		<div class="text-base-content/40 flex items-center gap-2 text-xs">
			<AbstractIcon name={icons.Image.name} class="size-4" width="16" height="16" />
			<AbstractIcon name={icons.ClapperBoard.name} class="size-4" width="16" height="16" />
			<AbstractIcon name={icons.Smile.name} class="size-4" width="16" height="16" />
		</div>
		<div
			class="rounded border px-2 py-0.5 text-xs font-medium {charCount > softCharLimit
				? 'border-error/60 bg-error/10 text-error'
				: 'border-base-300 text-base-content/70'}"
		>
			{charCount}/{softCharLimit}
		</div>
	</div>
	<!-- Add-post button is rendered by the parent so Settings can sit outside the wrapper. -->
</div>

<DeleteDialog
	bind:open={confirmOpen}
	title="Are you sure?"
	description="This action is irreversible. Are you sure you want to go back to global mode?"
	confirmLabel="Yes, go back to global mode"
	cancelLabel="No, cancel!"
	onConfirm={confirm}
	onCancel={() => (confirmOpen = false)}
/>
