<script lang="ts" module>
	export {
		buildCompareDirectoryLongFormNavSections,
		buildCompareSocialMatrixNavSections,
		buildUnifiedCompareNavSections,
		buildComparePageSectionNavItems,
		type ComparePageSectionNavItem
	} from '$lib/content/constants/competitors/comparePageSectionNav';
</script>

<script lang="ts">
	import type { ComparePageSectionNavItem } from '$lib/content/constants/competitors/comparePageSectionNav';

	import ScrollLink from '$lib/ui/nav-bars/ScrollLink.svelte';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		sections: readonly ComparePageSectionNavItem[];
		/** Sidebar: sticky right column (lg+). Inline: above content on smaller viewports. */
		placement?: 'sidebar' | 'inline';
		class?: string;
	};

	let { sections, placement = 'sidebar', class: className = '' }: Props = $props();

	const panelClass =
		'space-y-3 rounded-xl border border-primary/25 bg-primary/5 p-4 shadow-sm shadow-primary/5 sm:p-5';
</script>

{#if placement === 'sidebar'}
	<aside
		class={cn('hidden min-h-0 self-stretch lg:block', className)}
		aria-label="On this page"
	>
		<div
			class="sticky top-24 z-20 max-h-[calc(100dvh-6.5rem)] overflow-y-auto overscroll-contain"
		>
			<div class={panelClass}>
				<h2 class="text-xs font-semibold tracking-wide text-primary/90 uppercase">On this page</h2>
				<ol class="mt-3 space-y-2">
					{#each sections as section (section.id)}
						<li class="flex gap-2 text-left text-sm leading-snug">
							<span class="w-5 shrink-0 tabular-nums text-base-content/45" aria-hidden="true">
								{section.index}.
							</span>
							<ScrollLink
								href={`#${section.id}`}
								class="font-medium text-primary underline decoration-primary/50 underline-offset-[0.2em] hover:text-primary/85"
							>
								{section.navLabel}
							</ScrollLink>
						</li>
					{/each}
				</ol>
			</div>
		</div>
	</aside>
{:else}
	<nav class={cn('lg:hidden', className)} aria-label="On this page">
		<div class={panelClass}>
			<h2 class="text-xs font-semibold tracking-wide text-primary/90 uppercase">On this page</h2>
			<ol class="mt-3 space-y-2">
				{#each sections as section (section.id)}
					<li class="flex gap-2 text-left text-sm leading-snug">
						<span class="w-5 shrink-0 tabular-nums text-base-content/45" aria-hidden="true">
							{section.index}.
						</span>
						<ScrollLink
							href={`#${section.id}`}
							class="font-medium text-primary underline decoration-primary/50 underline-offset-[0.2em] hover:text-primary/85"
						>
							{section.navLabel}
						</ScrollLink>
					</li>
				{/each}
			</ol>
		</div>
	</nav>
{/if}
