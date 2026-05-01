<script lang="ts">
	import { icons } from '$data/icons';

	import AuroraBackground from '$lib/ui/background/AuroraBackground.svelte';
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';
	import OrbitingCircles from '$lib/ui/animation/OrbitingCircles.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Stargazers from '$lib/ui/icons/Stargazers.svelte';

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
						name={icons.ChatGPT.name}
						width="30"
						height="30"
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
						width="30"
						height="30"
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
						name={icons.InstagramGlyph.name}
						width="45"
						height="45"
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
						name={icons.TikTok.name}
						width="45"
						height="45"
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