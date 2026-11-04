<script lang="ts">
	import type { CompareHubProductOptionViewModel } from '$lib/area-public/PublicComparePage.presenter.svelte';
	import type { CompareProductSlug } from '$lib/content/constants/competitors';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import * as DropdownMenu from '$lib/ui/dropdown-menu/index.js';
	import LandingHeroHighlightedText from '$lib/ui/texts/LandingHeroHighlightedText.svelte';
	import { cn } from '$lib/ui/helpers/common';

	type ProductIconStyle = {
		containerClass: string;
		iconClass?: string;
	};

	type Props = {
		products: CompareHubProductOptionViewModel[];
		selectedSlug: CompareProductSlug;
		selectedName: string;
		selectedIcon: CompareHubProductOptionViewModel['icon'];
		onSelect: (slug: CompareProductSlug) => void;
		iconStyleForProduct: (slug: CompareProductSlug) => ProductIconStyle;
		variant: 'hero' | 'section';
		ariaLabel: string;
	};

	let {
		products,
		selectedSlug,
		selectedName,
		selectedIcon,
		onSelect,
		iconStyleForProduct,
		variant,
		ariaLabel
	}: Props = $props();

	const triggerClass = $derived(
		variant === 'hero'
			? 'btn btn-primary inline-flex max-w-full items-center gap-3 rounded-full px-4 py-2 text-3xl font-black tracking-tight sm:px-5 sm:text-4xl'
			: 'inline-flex max-w-full items-center gap-2 rounded-md bg-transparent p-0 text-inherit font-inherit'
	);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger type="button" class={triggerClass} aria-label={ariaLabel}>
		{#if variant === 'section'}
			<LandingHeroHighlightedText>
				<span class="inline-flex max-w-full items-center gap-2">
					<span
						class={`inline-flex size-8 shrink-0 items-center justify-center rounded-full ring-1 ${iconStyleForProduct(selectedSlug).containerClass}`}
					>
						<AbstractIcon
							name={selectedIcon}
							width="18"
							height="18"
							class={iconStyleForProduct(selectedSlug).iconClass ?? 'size-4.5'}
							focusable="false"
						/>
					</span>
					<span class="truncate">{selectedName}</span>
					<AbstractIcon
						name={icons.ChevronDown.name}
						width="16"
						height="16"
						class="size-4 shrink-0 text-black/70"
						focusable="false"
					/>
				</span>
			</LandingHeroHighlightedText>
		{:else}
			<div
				class={`flex size-10 shrink-0 items-center justify-center rounded-full ring-1 ${iconStyleForProduct(selectedSlug).containerClass}`}
			>
				<AbstractIcon
					name={selectedIcon}
					width="22"
					height="22"
					class={iconStyleForProduct(selectedSlug).iconClass ?? 'size-5.5'}
					focusable="false"
				/>
			</div>
			<span class="truncate">{selectedName}</span>
			<AbstractIcon
				name={icons.ChevronDown.name}
				width="20"
				height="20"
				class="size-5 shrink-0 opacity-90"
				focusable="false"
			/>
		{/if}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="center" class="min-w-[12rem]">
		{#each products as product (product.slug)}
			<DropdownMenu.Item
				class={cn(product.slug === selectedSlug ? 'font-semibold text-primary' : undefined)}
				onclick={() => onSelect(product.slug)}
			>
				<div class="flex items-center gap-2">
					<div
						class={`flex size-6 shrink-0 items-center justify-center rounded-full ring-1 ${iconStyleForProduct(product.slug).containerClass}`}
					>
						<AbstractIcon
							name={product.icon}
							width="14"
							height="14"
							class={iconStyleForProduct(product.slug).iconClass ?? 'size-3.5'}
							focusable="false"
						/>
					</div>
					<span>{product.name}</span>
				</div>
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
