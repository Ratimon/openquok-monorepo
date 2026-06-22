<script lang="ts">
	import type { FeaturesOrderedStep } from '$lib/content/constants/publicAgentConfig';
    import type { IphoneMockContentId } from '$lib/ui/templates/device-mocks/iphone-15-pro/iphoneMock.types';
    import type { SafariMockContentId } from '$lib/ui/templates/device-mocks/safari/safariMock.types';
    import type { TerminalMockContentId } from '$lib/ui/templates/device-mocks/terminal/terminalMock.types';

	import { onMount } from 'svelte';
    import { DEFAULT_AGENT_INTEGRATIONS } from '$lib/content/constants/publicAgentConfig';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import VideoOrImage from '$lib/ui/media-files/VideoOrImage.svelte';
	import FeaturesAnimated from '$lib/ui/templates/FeaturesAnimated.svelte';
	import Iphone15ProMock from '$lib/ui/templates/device-mocks/iphone-15-pro/Iphone15ProMock.svelte';
	import Iphone15ProMockContent from '$lib/ui/templates/device-mocks/iphone-15-pro/Iphone15ProMockContent.svelte';
	import SafariMock from '$lib/ui/templates/device-mocks/safari/SafariMock.svelte';
	import SafariMockContent from '$lib/ui/templates/device-mocks/safari/SafariMockContent.svelte';
	import TerminalCommandMockContent from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMockContent.svelte';
	import type { TelegramMockAgentBranding } from '$lib/ui/templates/device-mocks/iphone-15-pro/telegramMockBranding';

	export type { FeaturesOrderedDeviceMock, FeaturesOrderedStep } from '$lib/content/constants/publicAgentConfig';

	type LandingHeroTitleSegment = { text: string; highlight: boolean };

	type LandingHeroTheme = {
		subtitleClass: string;
		titlePartClass: (index: number, total: number) => string;
		titleHighlightPillClass: string;
		parseLandingHeroTitlePartSegments: (text: string) => LandingHeroTitleSegment[];
		landingHeroTitlePartHasHighlight: (segments: LandingHeroTitleSegment[]) => boolean;
	};

	type Props = {
		steps: FeaturesOrderedStep[];
		collapseDelay?: number;
		ltr?: boolean;
		linePosition?: 'left' | 'right' | 'top' | 'bottom';
		sectionClass?: string;
		heroTheme?: LandingHeroTheme;
		sectionSubtitle?: string;
		sectionTitle?: string;
		telegramAgentBranding?: TelegramMockAgentBranding;
	};

	let {
		steps,
		collapseDelay = 5000,
		ltr = false,
		linePosition = 'left',
		sectionClass = 'bg-base-200 py-16 sm:py-20',
		heroTheme,
		sectionSubtitle = '',
		sectionTitle = '',
		telegramAgentBranding
	}: Props = $props();

	let currentIndex = $state(-1);
	let carouselRef = $state<HTMLUListElement | null>(null);

	const indexRef = { current: -1 };
	let autoScrollTimer: ReturnType<typeof setInterval> | undefined;

	const activeStep = $derived(currentIndex >= 0 ? steps[currentIndex] : undefined);

	const headingId = 'features-ordered-heading';

	const titleParts = $derived(
		sectionTitle
			.split(',')
			.map((part) => part.trim())
			.filter((part) => part.length > 0)
	);

	const showSectionHeader = $derived(
		Boolean(sectionSubtitle?.trim() || sectionTitle?.trim()) && heroTheme
	);

	const isIphoneMock = $derived(activeStep?.deviceMock === 'iphone-15-pro');
	const isTerminalMock = $derived(activeStep?.deviceMock === 'terminal');

	const mediaPanelClass = $derived(
		isIphoneMock
			? 'h-[400px] min-h-[320px] w-auto lg:h-[480px]'
			: isTerminalMock
				? 'h-auto w-full'
				: 'h-[350px] min-h-[200px] w-auto'
	);

	function scrollToIndex(index: number) {
		if (!carouselRef) return;

		const cards = carouselRef.querySelectorAll('.features-ordered-card');
		const card = cards[index] as HTMLElement | undefined;
		if (!card) return;

		const cardRect = card.getBoundingClientRect();
		const carouselRect = carouselRef.getBoundingClientRect();
		const offset =
			cardRect.left - carouselRect.left - (carouselRect.width - cardRect.width) / 2;

		carouselRef.scrollTo({
			left: carouselRef.scrollLeft + offset,
			behavior: 'smooth'
		});
	}

	function selectStep(index: number) {
		indexRef.current = index;
		currentIndex = index;
		scrollToIndex(index);
	}

	function handleStepClick(index: number) {
		selectStep(index);
		startAutoScroll();
	}

	function startAutoScroll() {
		if (steps.length === 0) return;

		clearInterval(autoScrollTimer);
		autoScrollTimer = setInterval(() => {
			const next = indexRef.current < 0 ? 0 : (indexRef.current + 1) % steps.length;
			selectStep(next);
		}, collapseDelay);
	}

	onMount(() => {
		if (steps.length === 0) return;

		const initTimer = setTimeout(() => {
			selectStep(0);
			startAutoScroll();
		}, 100);

		return () => {
			clearTimeout(initTimer);
			clearInterval(autoScrollTimer);
		};
	});
</script>

<section class={sectionClass} aria-labelledby={showSectionHeader ? headingId : undefined}>
	<div class="container mx-auto px-4">
		<div class="mx-auto max-w-6xl">
			{#if showSectionHeader && heroTheme}
				<div class="mx-auto mb-12 max-w-3xl space-y-4 text-center">
					{#if sectionSubtitle}
						<p class={heroTheme.subtitleClass}>
							{sectionSubtitle}
						</p>
					{/if}

					{#if sectionTitle}
						<h2
							id={headingId}
							class="text-2xl font-black tracking-tight text-balance sm:text-3xl lg:text-4xl"
						>
							{#each titleParts as part, index (index)}
								{@const partClass = heroTheme.titlePartClass(index, titleParts.length)}
								{@const segments = heroTheme.parseLandingHeroTitlePartSegments(part)}
								{@const layoutClass =
									titleParts.length >= 3 ? 'block' : index > 0 ? 'block sm:inline' : ''}
								{#if heroTheme.landingHeroTitlePartHasHighlight(segments)}
									<span class={layoutClass}>
										{#each segments as seg, segmentIndex (segmentIndex)}
											{#if seg.highlight}
												<span class={heroTheme.titleHighlightPillClass}>{seg.text}</span>
											{:else}
												<span class={partClass}>{seg.text}</span>
											{/if}
										{/each}{#if titleParts.length < 3 && index < titleParts.length - 1},{/if}
									</span>
								{:else}
									<span class="{partClass} {layoutClass}">
										{part}{#if titleParts.length < 3 && index < titleParts.length - 1},{/if}
									</span>
								{/if}
							{/each}
						</h2>
					{/if}
				</div>
			{/if}

			<div class="mx-auto grid h-full items-center gap-10 lg:grid-cols-2">
				<div
					class="order-1 hidden lg:order-none lg:flex {ltr
						? 'lg:order-2 lg:justify-end'
						: 'justify-start'}"
				>
					<div>
						{#each steps as step, index (step.id)}
							<button
								type="button"
								class="relative mb-8 flex w-full cursor-pointer items-center rounded-lg text-left transition-opacity last:mb-0 hover:opacity-100 {currentIndex ===
								index
									? 'opacity-100'
									: 'opacity-60'}"
								aria-current={currentIndex === index ? 'step' : undefined}
								onclick={() => handleStepClick(index)}
							>
								{#if linePosition === 'left' || linePosition === 'right'}
									<div
										class="absolute inset-y-0 h-full w-0.5 overflow-hidden rounded-lg bg-base-content/20 {linePosition ===
										'right'
											? 'left-auto right-0'
											: 'left-0 right-auto'}"
									>
										<div
											class="absolute top-0 left-0 w-full {currentIndex === index
												? 'h-full'
												: 'h-0'} origin-top bg-primary transition-all ease-linear"
											style="transition-duration: {currentIndex === index
												? `${collapseDelay}ms`
												: '0s'};"
										></div>
									</div>
								{/if}

								{#if linePosition === 'top' || linePosition === 'bottom'}
									<div
										class="absolute inset-x-0 h-0.5 w-full overflow-hidden rounded-lg bg-base-content/20 {linePosition ===
										'bottom'
											? 'bottom-0'
											: 'top-0'}"
									>
										<div
											class="absolute left-0 {linePosition === 'bottom'
												? 'bottom-0'
												: 'top-0'} h-full {currentIndex === index
												? 'w-full'
												: 'w-0'} origin-left bg-primary transition-all ease-linear"
											style="transition-duration: {currentIndex === index
												? `${collapseDelay}ms`
												: '0s'};"
										></div>
									</div>
								{/if}

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
									<h3 class="text-lg font-bold lg:text-2xl">{step.title}</h3>
									<p class="max-w-md text-base text-base-content/70">
										{step.content}
									</p>
								</div>
							</button>
						{/each}
					</div>
				</div>

				<div class="{mediaPanelClass} {ltr ? 'lg:order-1' : ''}">
					{#key currentIndex}
						{#if activeStep?.deviceMock === 'safari'}
							<div
								class="aspect-auto size-full overflow-hidden"
								role="img"
								aria-label={activeStep.mediaAlt ?? activeStep.title}
							>
								<SafariMock class="size-full" url={activeStep.mockUrl ?? 'docs.openclaw.ai'}>
									<SafariMockContent
										content={activeStep.deviceMockContent as SafariMockContentId | undefined}
									/>
								</SafariMock>
							</div>
						{:else if activeStep?.deviceMock === 'iphone-15-pro'}
							<div
								class="flex size-full items-center justify-center overflow-hidden"
								role="img"
								aria-label={activeStep.mediaAlt ?? activeStep.title}
							>
								<Iphone15ProMock class="h-full w-auto max-w-full">
									<Iphone15ProMockContent
										content={activeStep.deviceMockContent as IphoneMockContentId | undefined}
										{telegramAgentBranding}
									/>
								</Iphone15ProMock>
							</div>
						{:else if activeStep?.deviceMock === 'terminal'}
							<TerminalCommandMockContent
								content={activeStep.deviceMockContent as TerminalMockContentId | undefined}
							/>
						{:else if activeStep?.animatedContent === 'llm-models'}
							<FeaturesAnimated
								models={activeStep.animatedModels}
								ariaLabel={activeStep.mediaAlt ?? activeStep.title}
							/>
						{:else if activeStep?.animatedContent === 'agent-integrations'}
							<FeaturesAnimated
								models={activeStep.animatedModels ?? DEFAULT_AGENT_INTEGRATIONS}
								ariaLabel={activeStep.mediaAlt ?? activeStep.title}
							/>
						{:else if activeStep?.mediaSrc}
							<div
								class="aspect-auto size-full overflow-hidden rounded-xl border border-base-content/10 p-1 shadow-lg"
							>
								<VideoOrImage
									src={activeStep.mediaSrc}
									alt={activeStep.mediaAlt ?? activeStep.title}
									autoplay={true}
									imageClass="rounded-lg object-left-top"
									videoClass="rounded-lg object-left-top"
								/>
							</div>
						{:else}
							<div
								class="aspect-auto size-full rounded-xl border border-base-content/10 bg-base-300/40"
								aria-hidden="true"
							></div>
						{/if}
					{/key}
				</div>

				<div
					class="relative -mb-8 pb-0.5 md:hidden [-webkit-mask-image:linear-gradient(90deg,transparent,black_20%,white_80%,transparent)] [mask-image:linear-gradient(90deg,transparent,black_20%,white_80%,transparent)]"
				>
					{#each steps as _, index (index)}
						<div
							class="absolute inset-x-0 top-0 h-0.5 w-full overflow-hidden rounded-lg bg-base-content/20"
						>
							<div
								class="absolute top-0 left-0 h-full {currentIndex === index
									? 'w-full'
									: 'w-0'} origin-left bg-primary transition-all ease-linear"
								style="transition-duration: {currentIndex === index
									? `${collapseDelay}ms`
									: '0s'};"
							></div>
						</div>
					{/each}
				</div>

				<ul
					bind:this={carouselRef}
					class="relative flex h-full snap-x snap-mandatory flex-nowrap overflow-x-auto [-ms-overflow-style:none] [-webkit-mask-image:linear-gradient(90deg,transparent,black_20%,white_80%,transparent)] [mask-image:linear-gradient(90deg,transparent,black_20%,white_80%,transparent)] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
				>
					{#each steps as step, index (step.id)}
						<li class="features-ordered-card shrink-0 snap-center last:mr-0">
							<button
								type="button"
								class="relative mr-8 grid max-w-full cursor-pointer items-start justify-center pl-2 text-left transition-opacity {currentIndex ===
								index
									? 'opacity-100'
									: 'opacity-70'}"
								aria-current={currentIndex === index ? 'step' : undefined}
								onclick={() => handleStepClick(index)}
							>
								<h3 class="text-xl font-bold">{step.title}</h3>
								<p class="mx-0 max-w-sm text-sm text-balance text-base-content/70">
									{step.content}
								</p>
							</button>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</section>
