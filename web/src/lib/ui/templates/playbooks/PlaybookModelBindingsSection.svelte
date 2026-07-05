<script lang="ts">
	import type { StackModelBindingViewModel } from '$lib/listings/listing.types';

	import {
		getProviderBySlug,
		resolveBindingLabels
	} from '$lib/listings/utils/llmModelCatalogHelpers';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		bindings: StackModelBindingViewModel[];
	};

	let { bindings }: Props = $props();
</script>

{#if bindings.length > 0}
	<div class="mb-8">
		<h2 class="mb-2 text-xl font-bold text-base-content">AI models</h2>
		<p class="mb-4 text-sm text-base-content/70">
			Models this playbook recommends for each workflow step.
		</p>
		<ul class="space-y-3">
			{#each bindings as binding (`${binding.use_case}-${binding.provider}-${binding.model}`)}
				{@const labels = resolveBindingLabels(binding)}
				{@const provider = getProviderBySlug(binding.provider)}
				<li class="flex items-start gap-3 rounded-xl border border-base-content/10 p-4">
					{#if provider}
						<div
							class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-base-200/80"
							title={provider.label}
						>
							<AbstractIcon
								name={provider.iconName}
								class="size-5"
								width="20"
								height="20"
								aria-hidden="true"
							/>
						</div>
					{/if}
					<div class="min-w-0 flex-1">
						<p class="text-xs font-semibold tracking-wide text-primary uppercase">
							{labels.useCaseLabel}
						</p>
						<p class="mt-1 text-base-content">
							<span class="font-medium">{labels.providerLabel}</span>
							<span class="text-base-content/50"> · </span>
							<span>{labels.modelLabel}</span>
						</p>
					</div>
				</li>
			{/each}
		</ul>
	</div>
{/if}
