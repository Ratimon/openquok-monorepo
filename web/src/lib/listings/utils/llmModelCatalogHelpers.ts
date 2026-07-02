import {
	LLM_MODELS,
	LLM_PROVIDERS,
	LLM_USE_CASES,
	type LlmModelCatalogEntry,
	type LlmProviderCatalogEntry,
	type LlmProviderSlug,
	type LlmUseCaseCatalogEntry,
	type LlmUseCaseSlug
} from '$lib/listings/constants/llmModelCatalog';

export function getUseCaseBySlug(slug: string): LlmUseCaseCatalogEntry | undefined {
	return LLM_USE_CASES.find((entry) => entry.slug === slug);
}

export function getProviderBySlug(slug: string): LlmProviderCatalogEntry | undefined {
	return LLM_PROVIDERS.find((entry) => entry.slug === slug);
}

export function getModelBySlug(slug: string): LlmModelCatalogEntry | undefined {
	return LLM_MODELS.find((entry) => entry.slug === slug);
}

export function getProvidersForUseCase(useCase: LlmUseCaseSlug): LlmProviderCatalogEntry[] {
	const providerSlugs = new Set(
		LLM_MODELS.filter((model) => model.useCases.includes(useCase)).map((model) => model.provider)
	);
	return LLM_PROVIDERS.filter((provider) => providerSlugs.has(provider.slug));
}

export function getModelsForUseCaseAndProvider(
	useCase: LlmUseCaseSlug,
	provider: LlmProviderSlug
): LlmModelCatalogEntry[] {
	return LLM_MODELS.filter((model) => model.provider === provider && model.useCases.includes(useCase));
}

export function getDefaultBindingForUseCase(useCase: LlmUseCaseSlug): {
	use_case: LlmUseCaseSlug;
	provider: LlmProviderSlug;
	model: string;
} | null {
	const providers = getProvidersForUseCase(useCase);
	const provider = providers[0];
	if (!provider) return null;
	const models = getModelsForUseCaseAndProvider(useCase, provider.slug);
	const model = models[0];
	if (!model) return null;
	return {
		use_case: useCase,
		provider: provider.slug,
		model: model.slug
	};
}

export function resolveBindingLabels(binding: {
	use_case: string;
	provider: string;
	model: string;
}): { useCaseLabel: string; providerLabel: string; modelLabel: string } {
	return {
		useCaseLabel: getUseCaseBySlug(binding.use_case)?.label ?? binding.use_case,
		providerLabel:
			getProviderBySlug(binding.provider)?.displayLabel ??
			getProviderBySlug(binding.provider)?.label ??
			binding.provider,
		modelLabel: getModelBySlug(binding.model)?.label ?? binding.model
	};
}
