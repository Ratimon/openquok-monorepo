<script lang="ts">
	import { LANDING_HERO_SOCIAL_AGENT_ROTATE_OPTIONS } from '$lib/ui/templates/landing-page/landingHeroTheme';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import LandingHeroHighlightedText from '$lib/ui/texts/LandingHeroHighlightedText.svelte';
	import TextRotate from '$lib/ui/texts/TextRotate.svelte';

	type Props = {
		class?: string;
		rotationInterval?: number;
	};

	let { class: className = '', rotationInterval = 2800 }: Props = $props();

	const rotateLabels = LANDING_HERO_SOCIAL_AGENT_ROTATE_OPTIONS.map((option) => option.label);

	let activeIndex = $state(0);

	const activeIconName = $derived(
		LANDING_HERO_SOCIAL_AGENT_ROTATE_OPTIONS[activeIndex]?.iconName ??
			LANDING_HERO_SOCIAL_AGENT_ROTATE_OPTIONS[0]?.iconName
	);
</script>

<span class="inline-flex shrink-0 items-center gap-2 align-middle {className}">
	<span
		class="grid size-9 shrink-0 place-items-center rounded-xl bg-base-100 shadow-md ring-1 ring-base-content/10 sm:size-10"
		aria-hidden="true"
	>
		{#if activeIconName}
			<AbstractIcon
				name={activeIconName}
				width="20"
				height="20"
				class="size-5 sm:size-6"
				focusable="false"
			/>
		{/if}
	</span>
	<LandingHeroHighlightedText class="shrink-0" triggerOnView={false}>
		<TextRotate
			texts={rotateLabels}
			splitBy="lines"
			{rotationInterval}
			staggerDuration={0.02}
			class="!min-w-0"
			style="min-width: auto"
			elementLevelClassName="inline-block whitespace-nowrap"
			onNext={(index) => {
				activeIndex = index;
			}}
		/>
	</LandingHeroHighlightedText>
</span>
