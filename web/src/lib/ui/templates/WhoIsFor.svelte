<script lang="ts">
	import type { IconName } from '$data/icons';
	import { icons } from '$data/icons';

	import WobbleCard from '$lib/ui/card-wobble/WobbleCard.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type AudienceCard = {
		iconName: IconName;
		iconClass: string;
		title: string;
		description: string;
		containerClass: string;
	};

	const cards: AudienceCard[] = [
		{
			iconName: icons.CalendarClock.name,
			iconClass: 'text-fuchsia-400',
			title: 'Agentic',
			description:
				'Model-agnostic: use the assistant agents and models that work best for you. Our CLI lets them draft and schedule posts from the AI tools you already use.',
			containerClass: 'h-full min-h-[18rem] bg-neutral-900'
		},
		{
			iconName: icons.Code.name,
			iconClass: 'text-violet-400',
			title: 'Developers',
			description:
				'Fully open source: use OAuth, our SDK, and API to build your own content OS for the creator economy. Connect once, publish everywhere.',
			containerClass: 'h-full min-h-[18rem] bg-neutral-900'
		},
		{
			iconName: icons.CustomizedDrawnHouse.name,
			iconClass: 'text-sky-400',
			title: 'Scale',
			description:
				'Reuse the viral formats that already work for you. Add workspaces, connect more accounts, and scale — automate, approve, and publish everywhere via API.',
			containerClass: 'h-full min-h-[18rem] bg-neutral-900'
		}
	];
</script>

<section class="container mx-auto px-4 pb-16 sm:pb-20" aria-label="Who OpenQuok is for">
	<div class="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-3">
		{#each cards as card (card.title)}
			<WobbleCard
				containerClass={card.containerClass}
				class="flex h-full flex-col gap-4 px-6 py-10 sm:px-8 sm:py-12"
			>
				<AbstractIcon
					name={card.iconName}
					class="h-14 w-14 shrink-0 {card.iconClass}"
					width="56"
					height="56"
				/>
				<h3 class="text-left text-2xl font-semibold tracking-tight text-white md:text-3xl">
					{card.title}
				</h3>
				<p class="max-w-[26rem] text-left text-base/6 text-neutral-200">
					{card.description}
				</p>
			</WobbleCard>
		{/each}
	</div>
</section>
