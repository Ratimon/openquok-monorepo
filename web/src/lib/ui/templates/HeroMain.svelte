<script lang="ts">
	import Background from '$lib/ui/layouts/Background.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';

	type Props = {
		heroTitle?: string;
		heroSlogan?: string;
		ctaTextPrimary?: string;
		ctaHrefPrimary?: string;
		ctaTextSecondary?: string;
		ctaHrefSecondary?: string;
	};

	let {
		heroTitle = '',
		heroSlogan = '',
		ctaTextPrimary = 'Try it for free',
		ctaHrefPrimary = '#',
		ctaTextSecondary = undefined,
		ctaHrefSecondary = '#'
	}: Props = $props();

	// Split title by commas/newlines and trim each part.
	// Also, if the copy contains "not hours"/"not hrs" without a comma, auto-split it
	// so the highlight pill can apply.
	const titleParts = $derived.by(() => {
		const hasExplicitSplit = heroTitle.includes(',') || heroTitle.includes('\n');
		const normalized = heroTitle.replace(
			/\s+(not\s+(?:hours|hrs|hr)\b)/i,
			(match, phrase) => (hasExplicitSplit ? ` ${phrase}` : `, ${phrase}`)
		);
		return normalized
			.split(/,|\n/g)
			.map((part) => part.trim())
			.filter((part) => part.length > 0);
	});

	const normalizePart = (part: string) => part.toLowerCase().replace(/\s+/g, ' ').trim();
	const isHighlightPart = (part: string) => {
		const p = normalizePart(part);
		return p === 'not hours' || p === 'not hrs' || p === 'not hr';
	};

	// High-contrast gradients for forest/dark-green background
	const getTitlePartClass = (part: string, index: number): string => {
		if (isHighlightPart(part)) {
			return 'bg-white text-black px-3 py-1 rounded-md -rotate-1 inline-block';
		}
		const classes = [
			'bg-gradient-to-r from-emerald-300 via-lime-300 to-amber-300 bg-clip-text text-transparent',
			'bg-gradient-to-r from-fuchsia-300 via-rose-300 to-orange-300 bg-clip-text text-transparent',
			'bg-gradient-to-r from-sky-300 via-cyan-200 to-emerald-200 bg-clip-text text-transparent'
		];
		return classes[index % classes.length];
	};
</script>

<Background color="bg-base-100">
	<section class="relative isolate w-full overflow-hidden">
		<div
			class="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-72 w-[min(72rem,95vw)] rounded-full bg-gradient-to-b from-primary/20 via-secondary/10 to-transparent blur-3xl"
		></div>

		<div class="container mx-auto px-4 py-16 sm:py-20">
			<div class="mx-auto max-w-3xl text-center">
				<h1 class="text-balance text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
					{#if titleParts.length > 0}
						{#each titleParts as part, index (part)}
							<span class="{getTitlePartClass(part, index)} mr-3">
								{part}
							</span>
						{/each}
					{:else}
						<span class="bg-gradient-to-r from-base-content via-base-content/80 to-base-content/70 bg-clip-text text-transparent">
							{heroTitle}
						</span>
					{/if}
				</h1>

				<p class="mt-6 text-pretty text-base font-medium leading-relaxed text-base-content/70 sm:text-lg">
					{heroSlogan}
				</p>

				<div class="mt-10 flex items-center justify-center gap-4">
					<ButtonGlitchBrightness
						class="my-2 w-2/3 text-sm sm:text-base lg:text-lg justify-center rounded-full px-10"
						variant="primary"
						size="lg"
						href={ctaHrefPrimary}
						preload="off"
					>
						{ctaTextPrimary}
					</ButtonGlitchBrightness>
					{#if ctaTextSecondary}
						<Button
							variant="ghost"
							size="xl"
							class="rounded-full px-10"
							href={ctaHrefSecondary}
							preload="off"
						>
							{ctaTextSecondary} →
						</Button>
					{/if}
				</div>
			</div>
		</div>
	</section>
</Background>

