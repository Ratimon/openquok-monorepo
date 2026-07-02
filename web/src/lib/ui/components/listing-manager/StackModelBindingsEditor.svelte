<script lang="ts">
	import type { StackModelBindingViewModel } from '$lib/listings/listing.types';
	import type { LlmUseCaseSlug } from '$lib/listings/constants/llmModelCatalog';

	import {
		LLM_USE_CASES,
		type LlmProviderSlug
	} from '$lib/listings/constants/llmModelCatalog';
	import {
		getDefaultBindingForUseCase,
		getModelsForUseCaseAndProvider,
		getProvidersForUseCase
	} from '$lib/listings/utils/llmModelCatalogHelpers';

	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		bindingsVm: StackModelBindingViewModel[];
		onChange: (bindingsVm: StackModelBindingViewModel[]) => void;
	};

	let { bindingsVm, onChange }: Props = $props();

	function addBinding() {
		const firstUseCase = LLM_USE_CASES[0]?.slug as LlmUseCaseSlug | undefined;
		if (!firstUseCase) return;
		const defaults = getDefaultBindingForUseCase(firstUseCase);
		if (!defaults) return;
		onChange([...bindingsVm, defaults]);
	}

	function removeBinding(index: number) {
		onChange(bindingsVm.filter((_, i) => i !== index));
	}

	function updateBinding(index: number, patch: Partial<StackModelBindingViewModel>) {
		onChange(bindingsVm.map((binding, i) => (i === index ? { ...binding, ...patch } : binding)));
	}

	function onUseCaseChange(index: number, useCase: LlmUseCaseSlug) {
		const defaults = getDefaultBindingForUseCase(useCase);
		if (!defaults) {
			updateBinding(index, { use_case: useCase, provider: '', model: '' });
			return;
		}
		updateBinding(index, defaults);
	}

	function onProviderChange(index: number, useCase: LlmUseCaseSlug, provider: LlmProviderSlug) {
		const models = getModelsForUseCaseAndProvider(useCase, provider);
		const model = models[0]?.slug ?? '';
		updateBinding(index, { provider, model });
	}

	function providersForRow(binding: StackModelBindingViewModel) {
		return getProvidersForUseCase(binding.use_case as LlmUseCaseSlug);
	}

	function modelsForRow(binding: StackModelBindingViewModel) {
		if (!binding.provider) return [];
		return getModelsForUseCaseAndProvider(
			binding.use_case as LlmUseCaseSlug,
			binding.provider as LlmProviderSlug
		);
	}
</script>

<div class="space-y-4 rounded-xl border border-base-content/10 p-4">
	<div class="flex items-center justify-between gap-3">
		<div>
			<h3 class="text-sm font-semibold text-base-content">AI models for this playbook</h3>
			<p class="text-xs text-base-content/60">
				Pick a use case first, then the provider and model your agent should use for that task.
			</p>
		</div>
		<Button type="button" variant="outline" size="sm" onclick={addBinding}>
			Add model
		</Button>
	</div>

	{#if bindingsVm.length === 0}
		<p class="text-sm text-base-content/60">
			No models selected yet. Add bindings for chat, image editing, video generation, and other
			workflows your playbook needs.
		</p>
	{:else}
		<ul class="space-y-3">
			{#each bindingsVm as binding, index (`${binding.use_case}-${binding.provider}-${binding.model}-${index}`)}
				{@const providers = providersForRow(binding)}
				{@const models = modelsForRow(binding)}
				<li class="flex flex-wrap items-end gap-3 rounded-lg bg-base-200/40 p-3">
					<label class="form-control min-w-[180px] flex-1">
						<span class="label-text text-xs">Use case</span>
						<select
							class="select select-bordered select-sm w-full"
							value={binding.use_case}
							onchange={(e) =>
								onUseCaseChange(index, (e.currentTarget as HTMLSelectElement).value as LlmUseCaseSlug)}
						>
							{#each LLM_USE_CASES as useCase (useCase.slug)}
								<option value={useCase.slug}>{useCase.label}</option>
							{/each}
						</select>
					</label>

					<label class="form-control min-w-[160px] flex-1">
						<span class="label-text text-xs">Provider</span>
						<select
							class="select select-bordered select-sm w-full"
							value={binding.provider}
							disabled={!providers.length}
							onchange={(e) =>
								onProviderChange(
									index,
									binding.use_case as LlmUseCaseSlug,
									(e.currentTarget as HTMLSelectElement).value as LlmProviderSlug
								)}
						>
							{#each providers as provider (provider.slug)}
								<option value={provider.slug}>{provider.displayLabel}</option>
							{/each}
						</select>
					</label>

					<label class="form-control min-w-[180px] flex-1">
						<span class="label-text text-xs">Model</span>
						<select
							class="select select-bordered select-sm w-full"
							value={binding.model}
							disabled={!models.length}
							onchange={(e) =>
								updateBinding(index, { model: (e.currentTarget as HTMLSelectElement).value })}
						>
							{#each models as model (model.slug)}
								<option value={model.slug}>{model.label}</option>
							{/each}
						</select>
					</label>

					{#if binding.provider}
						{@const providerEntry = providers.find((entry) => entry.slug === binding.provider)}
						{#if providerEntry}
							<div
								class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-base-100"
								title={providerEntry.label}
							>
								<AbstractIcon
									name={providerEntry.iconName}
									class="size-5"
									width="20"
									height="20"
									aria-hidden="true"
								/>
							</div>
						{/if}
					{/if}

					<Button type="button" variant="ghost" size="sm" onclick={() => removeBinding(index)}>
						Remove
					</Button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
