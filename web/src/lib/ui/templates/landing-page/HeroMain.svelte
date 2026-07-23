<script lang="ts">
	import { icons } from '$data/icons';
	import { HERO_SOCIAL_PLATFORMS } from '$data/landing-social-platforms';

	import { cn } from '$lib/ui/helpers/common';
	import { socialProviderDisplayLabel } from '$data/social-providers';

	import { normalizeConfigStringValue } from '$lib/config/utils/normalizeConfigStringValue';

	import AuroraBackground from '$lib/ui/background/AuroraBackground.svelte';
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';
	import OrbitingCircles from '$lib/ui/animation/OrbitingCircles.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Stargazers from '$lib/ui/icons/Stargazers.svelte';
	import * as Tooltip from '$lib/ui/tooltip';
	import LandingHeroHighlightedText from '$lib/ui/texts/LandingHeroHighlightedText.svelte';
	import TextRotate from '$lib/ui/texts/TextRotate.svelte';
	import {
		LANDING_HERO_HOURS_ROTATE_TEXTS,
		LANDING_HERO_SLOGAN_NOT_ROTATE_TEXTS
	} from '$lib/ui/templates/landing-page/landingHeroTheme';
	import ExternalLink from '$lib/ui/components/ExternalLink.svelte';

	type Props = {
		heroTitle?: string;
		heroSlogan?: string;
		heroPlatformsLabel?: string;
		ctaTextPrimary?: string;
		ctaHrefPrimary?: string;
		githubOwner?: string;
		githubRepo?: string;
	};

	let {
		heroTitle = '',
		heroSlogan = '',
		heroPlatformsLabel = 'Connect your accounts — publish to your social channels',
		ctaTextPrimary = 'Try it for free',
		ctaHrefPrimary = '#',
		githubOwner = '',
		githubRepo = ''
	}: Props = $props();

	const HERO_SOCIAL_ICON_BOX_CLASS = 'rounded-md';

	const HERO_SOCIAL_TOOLTIP_CLASS =
		'border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white shadow-lg';

	type TextSegment = { text: string; highlight: boolean; rotate?: boolean };

	const TITLE_ROTATE_HIGHLIGHT_WORD = /^hours$/i;

	function parseTitleLineSegments(text: string): TextSegment[] {
		if (!text) return [];
		const parts = text.split(/\b(control|hours)\b/gi);
		const out: TextSegment[] = [];
		for (const p of parts) {
			if (p === '') continue;
			out.push({
				text: p,
				highlight: /^(?:control|hours)$/i.test(p),
				rotate: TITLE_ROTATE_HIGHLIGHT_WORD.test(p)
			});
		}
		return out;
	}

	function parseHeroTitleLines(text: string): string[] {
		if (!text) return [];
		return normalizeConfigStringValue(text)
			.split(/\n/)
			.map((line) => line.trim())
			.filter((line) => line.length > 0);
	}

	function parseSloganForNotHoursHighlight(text: string): TextSegment[] {
		if (!text) return [];
		const parts = text.split(/(\bnot\s+(?:hours|hrs|hr)\b)/i);
		const out: TextSegment[] = [];
		for (const p of parts) {
			if (p === '') continue;
			out.push({
				text: p,
				highlight: /^\s*not\s+(?:hours|hrs|hr)\s*$/i.test(p),
				rotate: /^\s*not\s+(?:hours|hrs|hr)\s*$/i.test(p)
			});
		}
		return out;
	}

	const titleLines = $derived(parseHeroTitleLines(heroTitle));
	const sloganSegments = $derived(parseSloganForNotHoursHighlight(heroSlogan));

	const titleLineModels = $derived(
		titleLines.map((line) => ({ segments: parseTitleLineSegments(line) }))
	);

	const TITLE_GRADIENT_PRIMARY =
		'bg-gradient-to-r from-emerald-300 via-lime-300 to-amber-300 bg-clip-text text-transparent';
	const TITLE_GRADIENT_ACCENT =
		'bg-gradient-to-r from-fuchsia-300 via-rose-300 to-orange-300 bg-clip-text text-transparent';

	function getTitleSegmentGradientClass(
		lineIndex: number,
		segmentIndex: number,
		segments: TextSegment[],
		totalLines: number
	): string {
		if (totalLines === 1) {
			let nonHighlightBefore = 0;
			for (let i = 0; i < segmentIndex; i++) {
				if (!segments[i].highlight) nonHighlightBefore++;
			}
			return nonHighlightBefore === 0 ? TITLE_GRADIENT_PRIMARY : TITLE_GRADIENT_ACCENT;
		}

		const isLastLine = lineIndex === totalLines - 1;
		return isLastLine ? TITLE_GRADIENT_ACCENT : TITLE_GRADIENT_PRIMARY;
	}
</script>
<AuroraBackground>
	<section class="relative isolate w-full overflow-x-hidden">
		<div
			class="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-visible py-6 sm:py-10"
			aria-hidden="true"
		>
			<div
				class="relative flex aspect-square w-[min(28rem,92vw)] max-w-full shrink-0 items-center justify-center overflow-visible"
			>
				<!-- Inner orbits -->
				<OrbitingCircles
					class="h-[30px] w-[30px] border-none bg-transparent"
					duration={20}
					radius={80}
				>
					<AbstractIcon
						name={icons.Gemini.name}
						width="40"
						height="40"
						class="shrink-0"
						focusable="false"
					/>
				</OrbitingCircles>
				<OrbitingCircles
					class="h-[30px] w-[30px] border-none bg-transparent"
					duration={20}
					radius={80}
					delay={-10}
				>
					<AbstractIcon
						name={icons.OpenClaw.name}
						width="40"
						height="40"
						class="shrink-0"
						focusable="false"
					/>
				</OrbitingCircles>

				<!-- Outer orbits (reverse) -->
				<OrbitingCircles
					class="h-[45px] w-[45px] border-none bg-transparent"
					radius={160}
					duration={20}
					reverse
				>
					<AbstractIcon
						name={icons.ChatGPT.name}
						width="40"
						height="40"
						class="shrink-0"
						focusable="false"
					/>
				</OrbitingCircles>
				<OrbitingCircles
					class="h-[45px] w-[45px] border-none bg-transparent"
					radius={160}
					duration={20}
					delay={-10}
					reverse
				>
					<AbstractIcon
						name={icons.Claude.name}
						width="40"
						height="40"
						class="shrink-0"
						focusable="false"
					/>
				</OrbitingCircles>
			</div>
		</div>

		<div class="relative z-10 container mx-auto px-4 pt-16 pb-24 sm:pt-20 sm:pb-28">
			<div class="mx-auto max-w-3xl text-center">
				{#if githubOwner && githubRepo}
					<div class="mb-6 flex justify-center">
						<Stargazers owner={githubOwner} name={githubRepo} />
					</div>
				{/if}

				<h1 class="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
					{#if titleLineModels.length > 0}
						{#each titleLineModels as lineModel, lineIndex (lineIndex)}
							<span class="block">
								{#each lineModel.segments as seg, segmentIndex (segmentIndex)}
									{#if seg.highlight}
										{#if seg.rotate}
											<LandingHeroHighlightedText class="mr-3" triggerOnView={false}>
												<TextRotate
													texts={[...LANDING_HERO_HOURS_ROTATE_TEXTS]}
													splitBy="words"
													rotationInterval={2800}
													staggerDuration={0.02}
													elementLevelClassName="inline-block"
												/>
											</LandingHeroHighlightedText>
										{:else}
											<LandingHeroHighlightedText class="mr-3">{seg.text}</LandingHeroHighlightedText>
										{/if}
									{:else}
										<span
											class="{getTitleSegmentGradientClass(
												lineIndex,
												segmentIndex,
												lineModel.segments,
												titleLineModels.length
											)} mr-3"
										>
											{seg.text}
										</span>
									{/if}
								{/each}
							</span>
						{/each}
					{:else}
						<span class="bg-gradient-to-r from-base-content via-base-content/80 to-base-content/70 bg-clip-text text-transparent">
							{heroTitle}
						</span>
					{/if}
				</h1>

				<p class="mt-6 text-pretty text-base font-medium leading-relaxed text-base-content/70 sm:text-lg">
					{#if sloganSegments.length > 0}
						{#each sloganSegments as seg, segmentIndex (segmentIndex)}
							{#if seg.highlight}
								{#if seg.rotate}
									<LandingHeroHighlightedText triggerOnView={false}>
										<TextRotate
											texts={[...LANDING_HERO_SLOGAN_NOT_ROTATE_TEXTS]}
											splitBy="words"
											rotationInterval={3200}
											staggerDuration={0.015}
											elementLevelClassName="inline-block"
										/>
									</LandingHeroHighlightedText>
								{:else}
									<LandingHeroHighlightedText>{seg.text}</LandingHeroHighlightedText>
								{/if}
							{:else}
								{seg.text}
							{/if}
						{/each}
					{:else}
						{heroSlogan}
					{/if}
					<span class="ms-1 inline-flex items-center gap-1.5 align-middle">
						<span>with human support by</span>
						<img
							src="https://unavatar.io/x/RATi_MOn"
							alt="Rati"
							width="20"
							height="20"
							class="size-5 shrink-0 rounded-full"
							loading="lazy"
							decoding="async"
						/>
						<ExternalLink
							href="https://x.com/RATi_MOn"
							class="font-semibold text-base-content/80 hover:underline"
							ariaLabel="RATi_MOn on X"
						>
							@RATi_MOn
						</ExternalLink>
					</span>
				</p>

				<div class="mt-8">
					<p
						id="hero-supported-platforms-label"
						class="mb-3 text-sm font-medium text-base-content/55 sm:text-base"
					>
						{heroPlatformsLabel}
					</p>
					<div
						class="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5"
						role="group"
						aria-labelledby="hero-supported-platforms-label"
					>
						<Tooltip.Provider delayDuration={200}>
							{#each HERO_SOCIAL_PLATFORMS as platform (platform.id)}
								{@const label = platform.label ?? socialProviderDisplayLabel(platform.id)}
								<Tooltip.Root>
									<Tooltip.Trigger>
										{#snippet child({ props: triggerProps })}
											<span {...triggerProps} class="inline-flex" aria-label={label}>
												<span
													class={cn(
														'grid size-8 shrink-0 place-items-center',
														HERO_SOCIAL_ICON_BOX_CLASS,
														platform.containerClass
													)}
												>
													<AbstractIcon
														name={platform.icon}
														width={platform.iconWidth ?? '16'}
														height={platform.iconHeight ?? '16'}
														class={platform.iconClass ?? 'size-4'}
														focusable="false"
													/>
												</span>
											</span>
										{/snippet}
									</Tooltip.Trigger>
									<Tooltip.Content
										side="bottom"
										sideOffset={8}
										class={HERO_SOCIAL_TOOLTIP_CLASS}
									>
										{label}
									</Tooltip.Content>
								</Tooltip.Root>
							{/each}
						</Tooltip.Provider>
					</div>
				</div>

				<div class="mt-10 flex items-center justify-center pb-2">
					<ButtonGlitchBrightness
						class="w-2/3 text-sm sm:text-base lg:text-lg justify-center rounded-full px-10"
						variant="primary"
						size="lg"
						href={ctaHrefPrimary}
						preload="off"
					>
						{ctaTextPrimary}
					</ButtonGlitchBrightness>
				</div>
			</div>
		</div>
	</section>
</AuroraBackground>