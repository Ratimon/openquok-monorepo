<script lang="ts">
	import type { IntegrationCatalogItemProgrammerModel } from '$lib/integrations/Integrations.repository.svelte';

	import { cn } from '$lib/ui/helpers/common';
	import { icons } from '$data/icons';
	import { socialProviderIcon } from '$data/social-providers';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import * as Tooltip from '$lib/ui/tooltip';

	type Props = {
		providers: IntegrationCatalogItemProgrammerModel[];
		loading: boolean;
		onPickProvider: (identifier: string) => void;
	};

	let { providers, loading, onPickProvider }: Props = $props();
</script>

<div class="px-6 py-6">
	<p class="mb-4 text-sm text-base-content/70">Click a channel to add it.</p>
	{#if loading}
		<div class="flex items-center gap-2 py-10 text-base-content/70">
			<AbstractIcon
				name={icons.LoaderCircle.name}
				class="h-4 w-4 animate-spin"
				width="16"
				height="16"
			/>
			Loading providers…
		</div>
	{:else if providers.length === 0}
		<div class="py-10 text-sm text-base-content/70">No providers available right now.</div>
	{:else}
		<div
			class={cn(
				'grid gap-[10px] justify-items-center justify-center',
				'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9'
			)}
		>
			{#each providers as p (p.identifier)}
				<button
					type="button"
					class="group relative flex h-[94px] w-full max-w-[150px] flex-col items-center justify-center gap-2 rounded-xl border border-base-300 bg-base-100 px-3 py-3 text-center hover:bg-base-200"
					onclick={() => onPickProvider(p.identifier)}
				>
					<div class="grid h-10 w-10 place-items-center rounded-lg bg-base-200">
						<AbstractIcon
							name={socialProviderIcon(p.identifier)}
							class="h-6 w-6"
							width="24"
							height="24"
						/>
					</div>
					<div class="line-clamp-1 text-sm font-medium text-base-content">
						{p.name ?? p.identifier}
					</div>
					{#if p.toolTip}
						<Tooltip.Root>
							<Tooltip.Trigger>
								{#snippet child({ props: tipProps })}
									{@const { class: tipClass, ...tipRest } = tipProps}
									<span
										{...tipRest}
										class={`absolute right-2 top-2 ${String(tipClass ?? '')} text-base-content/70 group-hover:text-base-content`}
										aria-label="More info"
									>
										<AbstractIcon
											name={icons.FileQuestionMark.name}
											class="h-4 w-4"
											width="16"
											height="16"
										/>
									</span>
								{/snippet}
							</Tooltip.Trigger>
							<Tooltip.Content side="top">{p.toolTip}</Tooltip.Content>
						</Tooltip.Root>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>
