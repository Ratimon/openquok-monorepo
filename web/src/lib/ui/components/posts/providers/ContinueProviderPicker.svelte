<script lang="ts">
	import type {
		AccountConflictViewModel,
		ContinueConnectPageRow,
		ContinueProviderStepConfig
	} from '$lib/integrations/continue-provider';

	import { icons } from '$data/icons';

	import { socialProviderDisplayLabel } from '$data/social-providers';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import IntegrationChannelPicture from '$lib/ui/components/posts/IntegrationChannelPicture.svelte';
	import GoogleApiPrivacyNotice from '$lib/ui/components/legal/GoogleApiPrivacyNotice.svelte';

	type Props = {
		config: ContinueProviderStepConfig;
		pages: ContinueConnectPageRow[];
		emptyStateMessage?: string;
		accountConflict?: AccountConflictViewModel;
		submittingId: string | null;
		removingConflict?: boolean;
		onSelect: (rowId: string) => void;
		onRemoveConflict?: () => void;
		onCancel: () => void;
	};

	let {
		config,
		pages,
		emptyStateMessage,
		accountConflict,
		submittingId,
		removingConflict = false,
		onSelect,
		onRemoveConflict,
		onCancel
	}: Props = $props();

	const showGoogleApiPrivacyNotice = $derived(config.addedQueryProvider === 'youtube');
	const existingProviderLabel = $derived.by(() => {
		const id = accountConflict?.existingProviderIdentifier;
		return id ? socialProviderDisplayLabel(id) : 'another channel';
	});
	const removeConflictDescription = $derived.by(() => {
		if (!accountConflict) return '';
		const account = accountConflict.accountLabel?.trim();
		if (account) {
			return `${account} is connected as ${existingProviderLabel}. Remove that channel (and its posts), then continue setup here.`;
		}
		return `${accountConflict.message} Remove the existing channel (and its posts), then continue setup here.`;
	});
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
						<IntegrationChannelPicture
							profilePictureUrl={page.pictureUrl?.trim() || null}
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
		{:else}
			{#if emptyStateMessage}
				<li
					class="rounded-lg border border-warning/40 bg-warning/10 px-4 py-4 text-sm text-base-content"
					role="status"
				>
					<p>{emptyStateMessage}</p>
					{#if accountConflict && onRemoveConflict}
						<p class="mt-2 text-base-content/80">{removeConflictDescription}</p>
						<Button
							type="button"
							variant="ghost"
							class="mt-4 border border-error/30 text-error hover:bg-error/10"
							disabled={removingConflict || submittingId !== null}
							onclick={onRemoveConflict}
						>
							{#if removingConflict}
								<AbstractIcon
									name={icons.LoaderCircle.name}
									class="h-4 w-4 animate-spin"
									width="16"
									height="16"
								/>
								Removing…
							{:else}
								Remove existing channel
							{/if}
						</Button>
					{/if}
				</li>
			{/if}
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
