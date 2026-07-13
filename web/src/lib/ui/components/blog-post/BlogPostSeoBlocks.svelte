<script lang="ts">
	import type { BlogPostBySlugPublicViewModel } from '$lib/blogs/GetBlog.presenter.svelte';

	import {
		isBlogTopicEligibleForHowTo,
		isBlogTopicEligibleForProduct
	} from '$lib/blogs/constants/blogSeoSchemaTopics';

	import FaqAccordion from '$lib/ui/templates/faq/FaqAccordion.svelte';
	import ExternalLink from '$lib/ui/components/ExternalLink.svelte';

	type Props = {
		postVm: BlogPostBySlugPublicViewModel;
		class?: string;
	};

	let { postVm, class: className = '' }: Props = $props();

	const topicSlug = $derived(postVm.topic?.slug ?? null);
	const topicId = $derived(postVm.topic?.id ?? null);

	const showFaq = $derived((postVm.faqItems?.length ?? 0) > 0);
	const showHowTo = $derived(
		isBlogTopicEligibleForHowTo(topicSlug, topicId) && (postVm.howtoSteps?.length ?? 0) > 0
	);
	const showProduct = $derived(
		isBlogTopicEligibleForProduct(topicSlug, topicId) &&
			!!postVm.product?.name?.trim() &&
			!!postVm.product?.description?.trim()
	);
</script>

{#if showFaq || showHowTo || showProduct}
	<div class={className}>
		{#if showFaq && postVm.faqItems}
			<section id="blog-post-faq" class="mt-10 space-y-4" aria-labelledby="blog-post-faq-heading">
				<h2 id="blog-post-faq-heading" class="text-2xl font-bold text-base-content">
					Frequently asked questions
				</h2>
				<div class="flex flex-col gap-3">
					{#each postVm.faqItems as item, index (index)}
						<FaqAccordion title={item.question} description={item.answer} />
					{/each}
				</div>
			</section>
		{/if}

		{#if showHowTo && postVm.howtoSteps}
			<section id="blog-post-howto" class="mt-10 space-y-4" aria-labelledby="blog-post-howto-heading">
				<h2 id="blog-post-howto-heading" class="text-2xl font-bold text-base-content">
					How to
				</h2>
				<ol class="list-none space-y-6">
					{#each postVm.howtoSteps as step, index (index)}
						<li class="rounded-lg border border-base-300 bg-base-200/50 p-4">
							<h3 class="text-lg font-semibold text-base-content">
								<span class="mr-2 text-base-content/60">{index + 1}.</span>
								{step.name}
							</h3>
							<p class="mt-2 whitespace-pre-wrap text-base-content/80">
								{step.text}
							</p>
						</li>
					{/each}
				</ol>
			</section>
		{/if}

		{#if showProduct && postVm.product}
			<section id="blog-post-product" class="mt-10" aria-labelledby="blog-post-product-heading">
				<div class="rounded-lg border border-base-300 bg-base-200/50 p-5">
					<h2 id="blog-post-product-heading" class="text-xl font-bold text-base-content">
						{postVm.product.name}
					</h2>
					<p class="mt-2 text-base-content/80">
						{postVm.product.description}
					</p>
					{#if postVm.product.brand?.trim()}
						<p class="mt-3 text-sm text-base-content/60">
							Brand: {postVm.product.brand.trim()}
						</p>
					{/if}
					{#if postVm.product.url?.trim()}
						<p class="mt-3">
							<ExternalLink href={postVm.product.url.trim()} class="link link-primary font-medium">
								Learn more
							</ExternalLink>
						</p>
					{/if}
				</div>
			</section>
		{/if}
	</div>
{/if}
