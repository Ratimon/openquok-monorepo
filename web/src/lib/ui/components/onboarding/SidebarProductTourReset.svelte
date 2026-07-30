<script lang="ts">
	import { fly } from 'svelte/transition';

	import { icons } from '$data/icons';
	import {
		GETTING_STARTED_NOTICE_KIND,
		productTourResetPresenter,
		readHomeNoticeDismissed
	} from '$lib/onboarding';
	import { toast } from '$lib/ui/sonner';
	import { vopen } from '$lib/ui/sidebar-expandable/svelteContent';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		workspaceId?: string | null;
	};

	let { workspaceId = null }: Props = $props();

	const showResetUi = $derived.by(() => {
		void productTourResetPresenter.revision;
		if (!workspaceId) return false;
		return readHomeNoticeDismissed(GETTING_STARTED_NOTICE_KIND, workspaceId);
	});

	function handleReset(): void {
		productTourResetPresenter.reset(workspaceId);
		toast.success('Product tours reset. Opening the onboarding wizard…');
	}
</script>

{#if showResetUi}
<div class="shrink-0 border-t border-base-300 pt-3 mt-2">
	{#if $vopen}
		<div
			class="px-0.5"
			in:fly={{ x: -8, duration: 150 }}
			out:fly={{ x: -8, duration: 100 }}
		>
			<p class="text-xs font-medium text-base-content">Product tours</p>
			<p class="mt-0.5 text-[11px] leading-snug text-base-content/55">
				Missed something? Reset and run onboarding again.
			</p>
			<Button
				type="button"
				variant="outline"
				size="sm"
				class="mt-2 w-full gap-1.5 text-xs"
				onclick={handleReset}
			>
				<AbstractIcon name={icons.RefreshCw.name} class="size-3.5" width="14" height="14" />
				Reset product tours
			</Button>
		</div>
	{:else}
		<button
			type="button"
			class="flex w-full items-center justify-center rounded-lg py-2 text-base-content/70 transition-colors hover:bg-base-content/10 hover:text-base-content"
			title="Reset product tours"
			aria-label="Reset product tours"
			onclick={handleReset}
		>
			<AbstractIcon name={icons.RefreshCw.name} class="size-5" width="20" height="20" />
		</button>
	{/if}
</div>
{/if}
