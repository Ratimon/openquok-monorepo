<script lang="ts">
	import type {
		ContinueConnectPageRow,
		ContinueProviderStepConfig
	} from '$lib/integrations/continue-provider';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import ImageWithFallback from '$lib/ui/media-files/ImageWithFallback.svelte';
	import GoogleApiPrivacyNotice from '$lib/ui/components/legal/GoogleApiPrivacyNotice.svelte';

	type Props = {
		config: ContinueProviderStepConfig;
		pages: ContinueConnectPageRow[];
		submittingId: string | null;
		onSelect: (rowId: string) => void;
		onCancel: () => void;
	};

	let { config, pages, submittingId, onSelect, onCancel }: Props = $props();

	const showGoogleApiPrivacyNotice = $derived(config.addedQueryProvider === 'youtube');
</script>

<div class="mx-auto max-w-lg px-4 py-10">
	<h1 class="text-xl font-semibold text-base-content">
		{config.title}
	</h1>
	<p class="mt-2 text-sm text-base-content/70">
		{config.description}
	</p>

	<ul class="mt-6 flex flex-col gap-2">
		{#each pages as page (page.id)}
			<li>
				<button
					type="button"
					class="flex w-full items-center gap-3 rounded-lg border border-base-300 bg-base-100 px-3 py-3 text-start transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
					disabled={submittingId !== null}
					onclick={() => onSelect(page.id)}
				>
					<div class="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-base-200">
						<ImageWithFallback
							src={page.pictureUrl?.trim() || null}
							alt=""
							class="h-full w-full object-cover"
							fallbackIcon={config.fallbackIcon}
						/>
					</div>
					<span class="min-w-0 flex-1 truncate font-medium text-base-content">{page.name}</span>
					{#if submittingId === page.id}
						<AbstractIcon
							name={icons.LoaderCircle.name}
							class="h-4 w-4 shrink-0 animate-spin"
							width="16"
							height="16"
						/>
					{/if}
				</button>
			</li>
		{/each}
	</ul>
	{#if showGoogleApiPrivacyNotice}
		<div class="mt-6">
			<GoogleApiPrivacyNotice />
		</div>
	{/if}
	<Button class="mt-6" variant="ghost" onclick={onCancel}>
		Cancel
	</Button>
</div>
