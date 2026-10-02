<script lang="ts">
	import type { LinkDirectorySiteDto } from '$lib/link-directory/index';

	import { icons } from '$data/icons';

	import { getRootPathPublicBuildBacklinksSite } from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
	import { route, url } from '$lib/utils/path';

	import { cn } from '$lib/ui/helpers/common';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import InternalLink from '$lib/ui/links/InternalLink.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		orderedSlugs: string[];
		sitesBySlug: Map<string, Pick<LinkDirectorySiteDto, 'title' | 'slug'>>;
		canReorder?: boolean;
		class?: string;
		onMove: (siteSlug: string, direction: 'up' | 'down') => void | Promise<void>;
	};

	let {
		orderedSlugs,
		sitesBySlug,
		canReorder = false,
		class: className = '',
		onMove
	}: Props = $props();
</script>

{#if orderedSlugs.length > 0}
	<div class={cn('space-y-2', className)}>
		<h3 class="text-xs font-semibold uppercase tracking-wide text-primary/90">Saved</h3>
		<ul class="space-y-1">
			{#each orderedSlugs as siteSlug, index (siteSlug)}
				{@const siteMeta = sitesBySlug.get(siteSlug)}
				{@const detailHref = url(route(getRootPathPublicBuildBacklinksSite(siteSlug)))}
				<li class="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1.5">
					<InternalLink href={detailHref} class="min-w-0 flex-1 truncate text-sm font-medium link-hover">
						{siteMeta?.title ?? siteSlug}
					</InternalLink>
					{#if canReorder}
						<div class="flex shrink-0 gap-0.5">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								class="btn-square btn-xs"
								disabled={index === 0}
								aria-label="Move up"
								onclick={() => onMove(siteSlug, 'up')}
							>
								<AbstractIcon name={icons.ChevronUp.name} width="14" height="14" aria-hidden="true" />
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								class="btn-square btn-xs"
								disabled={index === orderedSlugs.length - 1}
								aria-label="Move down"
								onclick={() => onMove(siteSlug, 'down')}
							>
								<AbstractIcon
									name={icons.ChevronDown.name}
									width="14"
									height="14"
									aria-hidden="true"
								/>
							</Button>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
		{#if canReorder}
			<p class="text-xs text-base-content/50">Reorder updates your account saved list.</p>
		{/if}
	</div>
{/if}
