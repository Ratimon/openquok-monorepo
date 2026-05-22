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
				title: 'What are channels?',
				description:
					'A channel is a connected publishing account (for example X, Facebook, Instagram, LinkedIn, TikTok, YouTube, Reddit, Threads, or Pinterest). You schedule posts to the channels you connect.'
			},
			{
				title: 'What are team members?',
				description:
					'Team members are people you invite to a workspace. They can collaborate on content and connect their own channels where your plan allows.'
			}
		);

		return list;
	});
</script>

<div class="mb-10 mt-12 flex flex-col gap-6">
	{#each items as item, index (index)}
		<BillingFaqAccordion title={item.title} description={item.description} />
	{/each}
</div>
