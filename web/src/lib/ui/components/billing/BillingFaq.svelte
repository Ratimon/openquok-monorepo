<script lang="ts">
	import BillingFaqAccordion from '$lib/ui/components/billing/BillingFaqAccordion.svelte';

	type Props = {
		allowTrial?: boolean;
	};

	let { allowTrial = false }: Props = $props();

	type FaqItem = { title: string; description: string };

	const items = $derived.by((): FaqItem[] => {
		const list: FaqItem[] = [];

		if (allowTrial) {
			list.push({
				title: 'Am I going to be charged?',
				description:
					'To confirm your card, we may place a small authorization hold and release it immediately. You can cancel anytime from billing settings without contacting support.'
			});
		}

		list.push(
			{
				title: 'Can I trust OpenQuok?',
				description:
					'OpenQuok is open source. You can inspect the code, self-host, or contribute. We believe in transparent billing and product behavior.'
			},
			{
				title: 'What is the agent workspace?',
				description:
					'An agent workspace is where you connect channels, schedule posts, and collaborate. Workspaces keep agent and automation context focused. Too many channels or tasks in one place can cause context rot, so use separate workspaces for different brands, clients, or focus areas. You manage billing and invites for workspaces you own, and can join shared workspaces.'
			},
			{
				title: 'What counts as a channel?',
				description:
					'A channel is a connected social account (for example Facebook, Instagram, LinkedIn, TikTok, YouTube, Reddit, Threads, or Pinterest). You schedule posts to the channels you connect.'
			},
			{
				title: 'How does team members work?',
				description:
					'Team members are people you invite to a workspace. They can collaborate on content and connect their own channels where your plan allows. Seat limits are shown as invites plus you as owner. For example, “2 + 1 (you) per workspace” means four invited members and one seat for you on each workspace you own.'
			},
			{ title: 'Can I connect 2 channels to the same platform?',
				description:
					'Yes. Example: SOLO plan can connect 15 total accounts, all of them can be tiktok accounts.'
			},
		);

		return list;
	});
</script>

<div class="mb-10 mt-12 flex flex-col gap-6">
	{#each items as item, index (index)}
		<BillingFaqAccordion title={item.title} description={item.description} />
	{/each}
</div>
