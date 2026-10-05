<script lang="ts">
	import { page } from '$app/state';

	import type { BuildBacklinksGuideSectionVm } from '$lib/link-directory/utils/buildBuildBacklinksGuideSections';
	import { resolveOpportunityCta } from '$lib/link-directory/utils/resolveOpportunityCtaHref';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';
	import type { SafariMockContentId } from '$lib/ui/templates/device-mocks/safari/safariMock.types';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import FeaturesSectionHeader from '$lib/ui/templates/feature-grid/FeaturesSectionHeader.svelte';
	import BentoPublicChannelFeature from '$lib/ui/templates/bento/minor-templates/BentoPublicChannelFeature.svelte';
	import SafariMock from '$lib/ui/templates/device-mocks/safari/SafariMock.svelte';
	import SafariMockContent from '$lib/ui/templates/device-mocks/safari/SafariMockContent.svelte';

	type Props = {
		section: BuildBacklinksGuideSectionVm;
		sectionClass?: string;
	};

	let { section, sectionClass = 'bg-base-200 py-16 sm:py-20' }: Props = $props();

	const opportunity = $derived(section.badgesOpportunity);
	const displaySteps = $derived(section.displaySteps ?? []);
	const sectionMedia = $derived(section.sectionMedia);
	const sectionHeadingSubtitle = $derived(section.displaySectionTitle?.trim() || '');
	const sectionHeadingTitle = $derived(section.sectionTitle);
	const headingId = $derived(`${section.sectionId}-heading`);

	const showSectionDescription = $derived(Boolean(section.sectionDescription?.trim()));
	const showSectionFooter = $derived(
		Boolean(
			section.footer?.footerPrompt?.trim() &&
				section.footer?.footerLinkLabel?.trim() &&
				section.footer?.footerLinkHref?.trim()
		)
	);

	const footerHref = $derived.by(() => {
		const footer = section.footer;
		if (!footer?.footerLinkHref?.trim()) {
			return '';
		}
		if (!opportunity) {
			return hostedMarketingHref(footer.footerLinkHref, page.url.origin);
		}
		const cta = resolveOpportunityCta({
			kind: opportunity.openquokCtaKind,
			channelSlug: opportunity.openquokChannelSlug,
			ctaHref: opportunity.ctaHref,
			ctaLabel: opportunity.ctaLabel
		});
		if (cta?.external) {
			return footer.footerLinkHref;
		}
		return hostedMarketingHref(footer.footerLinkHref, page.url.origin);
	});

	let activeStepIndex = $state(0);

	const activeDisplayStep = $derived(displaySteps[activeStepIndex]);
	const activeMedia = $derived(activeDisplayStep?.stepMedia ?? sectionMedia);

	const channelBentoId = $derived(activeMedia?.channelBentoId);
	const safariUrl = $derived(activeMedia?.mockUrl?.trim() || 'www.example.com');
	const safariContent = $derived(activeMedia?.deviceMockContent as SafariMockContentId | undefined);
	const mediaAlt = $derived(activeMedia?.mediaAlt ?? sectionHeadingTitle);

	const isLoggedIn = $derived(
		Boolean((page.data as { isLoggedIn?: boolean } | undefined)?.isLoggedIn)
	);

	const ltr = $derived(section.ltr ?? false);

	function handleStepClick(index: number) {
		activeStepIndex = index;
	}
</script>

{#if opportunity && displaySteps.length > 0}
	<section
		id={section.sectionId}
		class="relative isolate scroll-mt-28 overflow-hidden {sectionClass}"
		aria-labelledby={headingId}
	>
		<div class="container mx-auto px-4">
			<div class="space-y-4">
				<div class="flex flex-wrap justify-center gap-1.5 sm:justify-start">
					{#if opportunity.opportunityType?.slug}
						<span class="badge badge-sm badge-ghost">{opportunity.opportunityType.label}</span>
					{/if}
					<span class="badge badge-sm badge-ghost capitalize">{opportunity.effort}</span>
					<span class="badge badge-sm badge-ghost capitalize">
						{opportunity.approvalMode === 'instant' ? 'Instant' : 'Manual review'}
					</span>
					<span class="badge badge-sm badge-ghost capitalize">{opportunity.dofollow}</span>
					<span class="badge badge-sm badge-ghost capitalize">{opportunity.costTier}</span>
				</div>

				<div class="mx-auto max-w-3xl space-y-4 text-center sm:text-left">
					<FeaturesSectionHeader
						heroTheme={landingHeroTheme}
						{headingId}
						subtitle={sectionHeadingSubtitle}
						title={sectionHeadingTitle}
						headingLevel="h2"
					/>
					{#if showSectionDescription}
						<p
							class="text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg"
						>
							{section.sectionDescription}
						</p>
					{/if}
				</div>
			</div>

			<div class="mx-auto mt-10 grid h-full items-start gap-10 lg:grid-cols-2 lg:items-center">
				<div
					class="order-2 lg:order-none {ltr
						? 'lg:order-2 lg:justify-end'
						: 'justify-start'}"
				>
					<ol class="list-none space-y-0 p-0">
						{#each displaySteps as step, index (step.order)}
							<li>
								<button
									type="button"
									class="relative mb-8 flex w-full cursor-pointer items-center rounded-lg text-left transition-opacity last:mb-0 hover:opacity-100 {activeStepIndex ===
									index
										? 'opacity-100'
										: 'opacity-60'}"
									aria-current={activeStepIndex === index ? 'step' : undefined}
									onclick={() => handleStepClick(index)}
								>
									<div
										class="absolute inset-y-0 left-0 h-full w-0.5 overflow-hidden rounded-lg bg-base-content/20"
									>
										<div
											class="absolute top-0 left-0 w-full {activeStepIndex === index
												? 'h-full'
												: 'h-0'} origin-top bg-primary transition-all"
										></div>
									</div>

									<div
										class="mx-2 flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:mx-6"
									>
										<AbstractIcon
											name={step.iconName}
											class="size-6 text-primary"
											width="24"
											height="24"
										/>
									</div>

									<div class="space-y-2">
										<p class="text-xs font-semibold tracking-wide text-primary uppercase">
											{step.displayTitle}
										</p>
										<h3 class="text-lg font-bold lg:text-2xl">{step.stepTitle}</h3>
										<p class="max-w-md text-base text-base-content/70">
											{step.content}
										</p>
									</div>
								</button>
							</li>
						{/each}
					</ol>
				</div>

				<div class="order-1 {ltr ? 'lg:order-1' : ''}">
					{#key activeStepIndex}
					{#if channelBentoId}
						<div
							class="pointer-events-none size-full select-none overflow-hidden rounded-xl"
							role="img"
							aria-label={mediaAlt}
						>
							<BentoPublicChannelFeature bentoId={channelBentoId} {isLoggedIn} />
						</div>
					{:else if activeMedia?.deviceMock === 'safari'}
						<div
							class="aspect-auto size-full overflow-hidden"
							role="img"
							aria-label={mediaAlt}
						>
							<SafariMock class="size-full" url={safariUrl}>
								<SafariMockContent content={safariContent} />
							</SafariMock>
						</div>
					{/if}
					{/key}
				</div>
			</div>

			{#if showSectionFooter}
				<p class="mt-12 text-center text-sm text-base-content/70 sm:text-base">
					{section.footer?.footerPrompt}
					<a href={footerHref} class="link link-primary font-semibold">
						{section.footer?.footerLinkLabel}
					</a>
				</p>
			{/if}
		</div>
	</section>
{/if}
