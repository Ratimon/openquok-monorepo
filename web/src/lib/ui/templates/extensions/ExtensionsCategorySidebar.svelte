<script lang="ts">
	import type { ExtensionCategoryViewModel } from '$lib/listings/index';

	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		categoriesVm: ExtensionCategoryViewModel[];
		activeCategorySlug: string | null;
		onSelect?: (slug: string | null) => void;
		class?: string;
	};

	let { categoriesVm, activeCategorySlug, onSelect, class: className = '' }: Props = $props();
</script>

<nav class={cn('space-y-1', className)} aria-label="Extension categories">
	<button
		type="button"
		class={cn(
			'btn btn-sm w-full justify-start',
			!activeCategorySlug ? 'btn-primary' : 'btn-ghost'
		)}
		aria-current={!activeCategorySlug ? 'page' : undefined}
		onclick={() => onSelect?.(null)}
	>
		All categories
	</button>

	{#each categoriesVm as category (category.id)}
		<button
			type="button"
			class={cn(
				'btn btn-sm w-full justify-start text-left',
				activeCategorySlug === category.slug ? 'btn-primary' : 'btn-ghost'
			)}
			aria-current={activeCategorySlug === category.slug ? 'page' : undefined}
			onclick={() => onSelect?.(category.slug)}
		>
			{category.name}
		</button>
	{/each}
</nav>
