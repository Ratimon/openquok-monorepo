<script lang="ts">
	import type { AlternativesListingViewModel } from '$lib/area-public/PublicAlternativesPage.presenter.svelte';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ExternalLink from '$lib/ui/components/ExternalLink.svelte';

	type Props = {
		listingVm: AlternativesListingViewModel;
		targetName: string;
		iconContainerClass: string;
		iconClass?: string;
	};

	let { listingVm, targetName, iconContainerClass, iconClass }: Props = $props();
</script>

<article
	class={`rounded-2xl border p-6 sm:p-8 ${
		listingVm.isOpenQuok
			? 'border-primary/25 bg-primary/5 shadow-sm'
			: 'border-base-content/10 bg-base-100'
	}`}
>
	<div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
		<div class="min-w-0 flex-1 space-y-4">
			<div class="flex items-start gap-4">
				<span
					class="flex size-10 shrink-0 items-center justify-center rounded-full bg-base-200 text-sm font-bold text-base-content/70"
				>
					{listingVm.rank}
				</span>
				<div class="min-w-0 space-y-2">
					<div class="flex flex-wrap items-center gap-3">
						<div
							class={`flex size-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ${iconContainerClass}`}
						>
							<AbstractIcon
								name={listingVm.icon}
								width="22"
								height="22"
								class={iconClass ?? 'size-5.5'}
								focusable="false"
							/>
						</div>
						<h3 class="text-2xl font-semibold text-base-content">
							{listingVm.name}
						</h3>
					</div>
					<p class="text-sm font-medium text-primary">
						{listingVm.tagline}
					</p>
				</div>
			</div>

			<p class="text-base leading-relaxed text-base-content/80">
				{listingVm.overview}
			</p>
			<p class="text-base leading-relaxed text-base-content/70">
				{listingVm.detailDescription}
			</p>
		</div>

		<div class="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
			<ExternalLink
				href={listingVm.websiteUrl}
				class="btn btn-outline btn-sm justify-center"
			>
				Go to website
			</ExternalLink>

			<a href={listingVm.compareHref} class="btn btn-primary btn-sm justify-center">
				Compare with {targetName}
			</a>
		</div>
	</div>
</article>
