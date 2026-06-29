<script lang="ts">
	import type { ExtensionCardViewModel, ExtensionDetailViewModel } from '$lib/listings/index';

	import { publicExtensionBySlugPagePresenter } from '$lib/area-public/index';

	import { toast } from '$lib/ui/sonner';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';

	import ExtensionCard from '$lib/ui/templates/extensions/ExtensionCard.svelte';
	import SkillExtensionDetail from '$lib/ui/templates/extensions/SkillExtensionDetail.svelte';
	import McpExtensionDetail from '$lib/ui/templates/extensions/McpExtensionDetail.svelte';
	import BothExtensionDetail from '$lib/ui/templates/extensions/BothExtensionDetail.svelte';

	type Props = {
		extension: ExtensionDetailViewModel;
		relatedExtensions: ExtensionCardViewModel[];
	};

	let { extension, relatedExtensions }: Props = $props();

	const pagePresenter = publicExtensionBySlugPagePresenter;

	let extraLikes = $state(0);
	let displayLikes = $derived(extension.likes + extraLikes);
	let expandedRelatedId = $state<string | null>(null);

	async function handleLike() {
		const result = await pagePresenter.trackExtensionLike(extension.id);
		if (result.ok) {
			extraLikes += 1;
			toast.success('Thanks for the like!');
			return;
		}
		toast.error(result.error);
	}

	function handleExternalClick() {
		void pagePresenter.trackExtensionClick(extension.id);
	}

	function toggleRelatedExpanded(id: string) {
		expandedRelatedId = expandedRelatedId === id ? null : id;
	}
</script>

<SectionOuterContainer class="py-10 md:py-14">
	<article class="container mx-auto max-w-4xl px-4">
		{#if extension.extensionType === 'mcp'}
			<McpExtensionDetail
				{extension}
				{displayLikes}
				onLike={handleLike}
				onExternalClick={handleExternalClick}
				likeDisabled={pagePresenter.submittingLike}
			/>
		{:else if extension.extensionType === 'both'}
			<BothExtensionDetail
				{extension}
				{displayLikes}
				onLike={handleLike}
				onExternalClick={handleExternalClick}
				likeDisabled={pagePresenter.submittingLike}
			/>
		{:else}
			<SkillExtensionDetail
				{extension}
				{displayLikes}
				onLike={handleLike}
				onExternalClick={handleExternalClick}
				likeDisabled={pagePresenter.submittingLike}
			/>
		{/if}

		{#if relatedExtensions.length > 0}
			<section class="border-t border-base-content/10 py-10">
				<h2 class="mb-4 text-xl font-bold">Related extensions</h2>
				<ul class="space-y-4">
					{#each relatedExtensions as relatedVm (relatedVm.id)}
						<li>
							<ExtensionCard
								extensionVm={relatedVm}
								expanded={expandedRelatedId === relatedVm.id}
								onToggle={toggleRelatedExpanded}
							/>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<section class="border-t border-base-content/10 py-10">
			<h2 class="mb-2 text-xl font-bold">Comments</h2>
			<p class="text-base-content/70">Comments are coming soon.</p>
		</section>
	</article>
</SectionOuterContainer>
