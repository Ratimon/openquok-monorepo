<script lang="ts">
	import type { LinkDirectorySiteDto } from '$lib/link-directory/index';

	import { icons } from '$data/icons';

	import { getRootPathPublicBuildBacklinksSite } from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
	import { route, url } from '$lib/utils/path';

	import { cn } from '$lib/ui/helpers/common';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import InternalLink from '$lib/ui/links/InternalLink.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { Checkbox } from '$lib/ui/checkbox';

	type Props = {
		orderedSlugs: string[];
		sitesBySlug: Map<string, Pick<LinkDirectorySiteDto, 'title' | 'slug'>>;
		canReorder?: boolean;
		canMarkComplete?: boolean;
		isCompleted?: (siteSlug: string) => boolean;
		class?: string;
		onMove: (siteSlug: string, direction: 'up' | 'down') => void | Promise<void>;
		onToggleComplete?: (siteSlug: string) => void | Promise<void>;
	};

	let {
		orderedSlugs,
		sitesBySlug,
		canReorder = false,
		canMarkComplete = false,
		isCompleted = () => false,
		class: className = '',
		onMove,
		onToggleComplete
	}: Props = $props();

	const showSignedOutHint = $derived(!canReorder && !canMarkComplete && orderedSlugs.length > 0);

	const reorderButtonClass =
		'h-7 w-7 shrink-0 border-base-content/25 bg-base-100 p-0 text-base-content shadow-sm hover:bg-base-200';
</script>

{#if orderedSlugs.length > 0}
	<div class={cn('space-y-2', className)}>
		<h3 class="text-xs font-semibold uppercase tracking-wide text-primary/90">Saved</h3>
		<ul class="space-y-1">
			{#each orderedSlugs as siteSlug, index (siteSlug)}
				{@const siteMeta = sitesBySlug.get(siteSlug)}
				{@const detailHref = url(route(getRootPathPublicBuildBacklinksSite(siteSlug)))}
				{@const done = isCompleted(siteSlug)}
				<li class="flex items-center gap-2 rounded-md bg-primary/10 px-2 py-1.5">
					{#if canReorder}
						<div class="flex shrink-0 flex-col gap-0.5" role="group" aria-label="Reorder">
							<Button
								type="button"
								variant="outline"
								size="sm"
								class={reorderButtonClass}
								disabled={index === 0}
								aria-label="Move up"
								onclick={() => onMove(siteSlug, 'up')}
							>
								<AbstractIcon name={icons.ArrowUp.name} width="16" height="16" aria-hidden="true" />
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								class={reorderButtonClass}
								disabled={index === orderedSlugs.length - 1}
								aria-label="Move down"
								onclick={() => onMove(siteSlug, 'down')}
							>
								<AbstractIcon
									name={icons.ArrowDown.name}
									width="16"
									height="16"
									aria-hidden="true"
								/>
							</Button>
						</div>
					{/if}
					{#if onToggleComplete}
						<label class="flex shrink-0 items-center gap-1.5 text-xs text-base-content/70">
							<Checkbox
								checked={done}
								disabled={!canMarkComplete}
								aria-label={done ? 'Mark outreach not done' : 'Mark outreach done'}
								onCheckedChange={() => onToggleComplete(siteSlug)}
							/>
							Done
						</label>
					{/if}
					<InternalLink
						href={detailHref}
						class={cn(
							'min-w-0 flex-1 truncate text-sm font-medium link-hover',
							done && 'text-base-content/55 line-through'
						)}
					>
						{siteMeta?.title ?? siteSlug}
					</InternalLink>
				</li>
			{/each}
		</ul>
		{#if showSignedOutHint}
			<p class="text-xs text-base-content/50">Sign in to reorder and mark done.</p>
		{/if}
	</div>
{/if}
