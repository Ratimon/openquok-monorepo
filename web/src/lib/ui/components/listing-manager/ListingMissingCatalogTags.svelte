<script lang="ts">
	import type { CatalogListingTagDraftViewModel } from '$lib/listings/utils/catalogListingTags';
	import type { ListingTagViewModel } from '$lib/listings/GetListing.presenter.svelte';
	import type { ListingTagGroupProgrammerModel } from '$lib/listings/Listing.repository.svelte';

	import { page } from '$app/state';

	import { icons } from '$data/icons';
	import { toast } from '$lib/ui/sonner';
	import { getRootPathPublicAgent } from '$lib/area-public/constants/getRootPathPublicAgents';
	import { getRootPathPublicChannel } from '$lib/area-public/constants/getRootPathPublicChannels';
	import { hostedMarketingAnchorAttrs } from '$lib/utils/hostedMarketingHref';
	import { route } from '$lib/utils/path';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { Badge } from '$lib/ui/badge';
	import Button from '$lib/ui/buttons/Button.svelte';
	import ListingTagUpsertModal from '$lib/ui/components/listing-manager/ListingTagUpsertModal.svelte';

	type Props = {
		missingTags: CatalogListingTagDraftViewModel[];
		allTagGroups: ListingTagGroupProgrammerModel[];
		onTagCreated: (vm: ListingTagViewModel) => void | Promise<void>;
	};

	let { missingTags, allTagGroups, onTagCreated }: Props = $props();

	function sourceLabel(source: CatalogListingTagDraftViewModel['source']): string {
		return source === 'agents' ? 'Agents' : 'Channels';
	}

	function sourceAnchorAttrs(tag: CatalogListingTagDraftViewModel) {
		const path =
			tag.source === 'agents'
				? route(getRootPathPublicAgent(tag.slug))
				: route(getRootPathPublicChannel(tag.slug));
		return hostedMarketingAnchorAttrs(path, page.url.origin);
	}

	async function copyText(label: string, value: string) {
		try {
			await navigator.clipboard.writeText(value);
			toast.success(`Copied ${label}.`);
		} catch {
			toast.error('Could not copy to clipboard.');
		}
	}
</script>

{#if missingTags.length > 0}
	<section class="mb-6 rounded-xl border border-dashed border-warning/50 bg-warning/5 p-4">
		<div class="mb-4">
			<h2 class="text-base font-semibold text-base-content">Missing catalog tags</h2>
			<p class="mt-1 text-sm text-base-content/70">
				These names are on public
				<code class="text-xs">/agents</code>
				and
				<code class="text-xs">/channels</code>
				but not in the listing-tag catalog yet. Copy the fields, or prefill Add tag — nothing is created
				until you submit.
			</p>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			{#each missingTags as tag (tag.slug)}
				{@const sourceAttrs = sourceAnchorAttrs(tag)}
				<article class="rounded-lg border border-base-300 bg-base-100 p-4">
					<div class="flex flex-wrap items-center justify-between gap-2">
						<h3 class="text-sm font-semibold text-base-content">{tag.name}</h3>
						<a href={sourceAttrs.href} target={sourceAttrs.target} rel={sourceAttrs.rel}>
							<Badge variant="outline">{sourceLabel(tag.source)}</Badge>
						</a>
					</div>

					<dl class="mt-3 space-y-2 text-sm">
						<div class="flex items-start justify-between gap-2">
							<div class="min-w-0">
								<dt class="text-xs text-base-content/60">Name</dt>
								<dd class="font-medium">{tag.name}</dd>
							</div>
							<Button
								variant="ghost"
								size="sm"
								type="button"
								onclick={() => copyText('name', tag.name)}
							>
								<AbstractIcon name={icons.Copy.name} width="14" height="14" focusable="false" />
								<span class="sr-only">Copy name</span>
							</Button>
						</div>
						<div class="flex items-start justify-between gap-2">
							<div class="min-w-0">
								<dt class="text-xs text-base-content/60">Slug</dt>
								<dd class="font-mono text-xs">{tag.slug}</dd>
							</div>
							<Button
								variant="ghost"
								size="sm"
								type="button"
								onclick={() => copyText('slug', tag.slug)}
							>
								<AbstractIcon name={icons.Copy.name} width="14" height="14" focusable="false" />
								<span class="sr-only">Copy slug</span>
							</Button>
						</div>
						<div class="flex items-start justify-between gap-2">
							<div class="min-w-0">
								<dt class="text-xs text-base-content/60">Description</dt>
								<dd class="text-base-content/80">{tag.description}</dd>
							</div>
							<Button
								variant="ghost"
								size="sm"
								type="button"
								onclick={() => copyText('description', tag.description)}
							>
								<AbstractIcon name={icons.Copy.name} width="14" height="14" focusable="false" />
								<span class="sr-only">Copy description</span>
							</Button>
						</div>
						<div>
							<dt class="text-xs text-base-content/60">Tag groups</dt>
							<dd class="mt-1 flex flex-wrap gap-1">
								{#each tag.groupNames as groupName (groupName)}
									<Badge variant="muted">{groupName}</Badge>
								{/each}
							</dd>
						</div>
					</dl>

					<div class="mt-4">
						<ListingTagUpsertModal
							tag={undefined}
							draft={tag}
							{allTagGroups}
							buttonVariant="outline"
							buttonLabel="Prefill add form"
							{onTagCreated}
						/>
					</div>
				</article>
			{/each}
		</div>
	</section>
{/if}
