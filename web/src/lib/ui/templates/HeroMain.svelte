<script lang="ts">
	import type { IconName } from '$data/icons';
	import { icons } from '$data/icons';

	import { cn } from '$lib/ui/helpers/common';
	import { socialProviderDisplayLabel } from '$data/social-providers';

	import AuroraBackground from '$lib/ui/background/AuroraBackground.svelte';
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';
	import OrbitingCircles from '$lib/ui/animation/OrbitingCircles.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Stargazers from '$lib/ui/icons/Stargazers.svelte';
	import * as Tooltip from '$lib/ui/tooltip';

	type Props = {
		heroTitle?: string;
		heroSlogan?: string;
		ctaTextPrimary?: string;
		ctaHrefPrimary?: string;
		githubOwner?: string;
		githubRepo?: string;
	};

	let {
		heroTitle = '',
		heroSlogan = '',
		ctaTextPrimary = 'Try it for free',
		ctaHrefPrimary = '#',
		githubOwner = '',
		githubRepo = ''
	}: Props = $props();

	const HIGHLIGHT_PILL_CLASS =
		'bg-white text-black px-3 py-1 rounded-md -rotate-1 inline-block';

	type HeroSocialPlatform = {
		id: string;
		icon: IconName;
		label?: string;
		containerClass?: string;
		iconClass?: string;
		iconWidth?: string;
		iconHeight?: string;
	};

	const HERO_SOCIAL_ICON_BOX_CLASS = 'rounded-md';

	const HERO_SOCIAL_PLATFORMS: HeroSocialPlatform[] = [
		{
			id: 'x',
			icon: icons.X.name,
			containerClass: 'bg-neutral-800 text-white',
			iconClass: 'size-6'
		},
		{
			id: 'instagram',
			icon: icons.InstagramGlyph.name,
			containerClass: 'bg-transparent p-0',
			iconClass: 'size-8',
			iconWidth: '32',
			iconHeight: '32'
		},
		{
			id: 'linkedin',
			icon: icons.LinkedIn.name,
			containerClass: 'bg-transparent p-0',
			iconClass: 'size-8',
			iconWidth: '32',
			iconHeight: '32'
		},
		{
			id: 'facebook',
			icon: icons.Facebook.name,
			containerClass: 'bg-transparent p-0',
			iconClass: 'size-8',
			iconWidth: '32',
			iconHeight: '32'
		},
		{
			id: 'tiktok',
			icon: icons.TikTok.name,
			containerClass: 'bg-transparent p-0',
			iconClass: 'size-8',
			iconWidth: '32',
			iconHeight: '32'
		},
		{
			id: 'youtube',
			icon: icons.YouTube.name,
			containerClass: 'bg-[#FF0000] text-white',
			iconClass: 'size-4'
		},
		{
			id: 'threads',
			icon: icons.Threads.name,
			containerClass: 'bg-neutral-900 text-white',
			iconClass: 'size-5',
			iconWidth: '20',
			iconHeight: '20'
		},
		{
			id: 'google',
			icon: icons.Google.name,
			label: 'Google Business',
			containerClass: 'bg-white',
			iconClass: 'size-5',
			iconWidth: '20',
			iconHeight: '20'
		}
	];

	const HERO_SOCIAL_TOOLTIP_CLASS =
		'border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white shadow-lg';

	type TextSegment = { text: string; highlight: boolean };

	function parseTitleForControlHighlight(text: string): TextSegment[] {
		if (!text) return [];
		const parts = text.split(/(\bcontrol\b)/gi);
		const out: TextSegment[] = [];
		for (const p of parts) {
			if (p === '') continue;
			out.push({ text: p, highlight: /^control$/i.test(p) });
		}
		return out;
	}

	function parseSloganForNotHoursHighlight(text: string): TextSegment[] {
		if (!text) return [];
		const parts = text.split(/(\bnot\s+(?:hours|hrs|hr)\b)/i);
		const out: TextSegment[] = [];
		for (const p of parts) {
			if (p === '') continue;
			out.push({
				text: p,
				highlight: /^\s*not\s+(?:hours|hrs|hr)\s*$/i.test(p)
			});
		}
		return out;
	}

	const titleSegments = $derived(parseTitleForControlHighlight(heroTitle));
	const sloganSegments = $derived(parseSloganForNotHoursHighlight(heroSlogan));

	function gradientIndexBeforeTitleSegment(index: number): number {
		let n = 0;
		for (let j = 0; j < index; j++) {
			if (!titleSegments[j].highlight) n++;
		}
		return n;
	}

	// High-contrast gradients for forest/dark-green background (non-highlight title spans only)
	const getTitleGradientClass = (index: number): string => {
		const classes = [
			'bg-gradient-to-r from-emerald-300 via-lime-300 to-amber-300 bg-clip-text text-transparent',
			'bg-gradient-to-r from-fuchsia-300 via-rose-300 to-orange-300 bg-clip-text text-transparent',
			'bg-gradient-to-r from-sky-300 via-cyan-200 to-emerald-200 bg-clip-text text-transparent'
		];
		return classes[index % classes.length];
	};
</script>
<AuroraBackground>
	<section class="relative isolate w-full overflow-hidden">
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

		<div class="relative z-10 container mx-auto px-4 py-16 sm:py-20">
			<div class="mx-auto max-w-3xl text-center">
				{#if githubOwner && githubRepo}
					<div class="mb-6 flex justify-center">
						<Stargazers owner={githubOwner} name={githubRepo} />
					</div>
				{/if}

				<div class="mb-8 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
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

				<h1 class="text-balance text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
					{#if titleSegments.length > 0}
						{#each titleSegments as seg, index (index)}
							{#if seg.highlight}
								<span class="{HIGHLIGHT_PILL_CLASS} mr-3">{seg.text}</span>
							{:else}
								<span
									class="{getTitleGradientClass(gradientIndexBeforeTitleSegment(index))} mr-3"
								>
									{seg.text}
								</span>
							{/if}
						{/each}
					{:else}
						<span class="bg-gradient-to-r from-base-content via-base-content/80 to-base-content/70 bg-clip-text text-transparent">
							{heroTitle}
						</span>
					{/if}
				</h1>

				<p class="mt-6 text-pretty text-base font-medium leading-relaxed text-base-content/70 sm:text-lg">
					{#if sloganSegments.length > 0}
						{#each sloganSegments as seg (seg.text + String(seg.highlight))}
							{#if seg.highlight}
								<span class={HIGHLIGHT_PILL_CLASS}>{seg.text}</span>
							{:else}
								{seg.text}
							{/if}
						{/each}
					{:else}
						{heroSlogan}
					{/if}
				</p>

				<div class="mt-10 flex items-center justify-center">
					<ButtonGlitchBrightness
						class="my-2 w-2/3 text-sm sm:text-base lg:text-lg justify-center rounded-full px-10"
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