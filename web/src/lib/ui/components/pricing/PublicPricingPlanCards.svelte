<script lang="ts">
	import type { PublicPricingPlanCardViewModel } from '$lib/billing/GetPublicPricing.presenter.svelte';

	import { icons } from '$data/icons';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { cn } from '$lib/ui/helpers/common';
	import { url } from '$lib/utils/path';

	type Props = {
		plans: PublicPricingPlanCardViewModel[];
		ctaHref: string;
		ctaLabel: string;
	};

	let { plans, ctaHref, ctaLabel }: Props = $props();
</script>

<div class="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
	{#each plans as plan (plan.tier)}
		<article
			class={cn(
				'relative flex flex-col rounded-3xl border p-6',
				plan.isFeatured
					? 'border-primary bg-primary text-primary-content shadow-lg shadow-primary/20'
					: 'border-base-300 bg-base-200'
			)}
		>
			{#if plan.isFeatured}
				<span
					class="absolute end-4 top-4 rounded-full bg-primary-content/20 px-3 py-1 text-xs font-semibold text-primary-content"
				>
					Popular
				</span>
			{/if}

			<div class="text-lg font-semibold">{plan.name}</div>

			<div class="mt-3 flex items-end gap-1">
				<span class="text-4xl font-bold tabular-nums">${plan.displayPrice}</span>
				<span class={cn('pb-1 text-sm', plan.isFeatured ? 'text-primary-content/80' : 'text-base-content/60')}>
					{plan.periodLabel}
				</span>
			</div>

			<p class={cn('mt-2 text-sm', plan.isFeatured ? 'text-primary-content/85' : 'text-base-content/70')}>
				{plan.tagline}
			</p>

			<hr
				class={cn('my-5 border-0 border-t', plan.isFeatured ? 'border-primary-content/25' : 'border-base-300')}
			/>

			<ul class="flex flex-1 flex-col gap-2.5 text-sm">
				{#each plan.features as feature (feature)}
					<li class="flex gap-3">
						<AbstractIcon
							name={icons.CircleCheck.name}
							class={cn('size-5 shrink-0', plan.isFeatured ? 'text-primary-content' : 'text-success')}
							width="20"
							height="20"
						/>
						<span>{feature}</span>
					</li>
				{/each}
			</ul>

			<div class="mt-6">
				<Button
					href={url(ctaHref)}
					variant={plan.isFeatured ? 'ghost' : 'outline'}
					class={cn(
						'w-full !rounded-full',
						plan.isFeatured &&
							'!border-transparent !bg-primary-content !text-primary hover:!bg-primary-content/90'
					)}
				>
					{ctaLabel}
				</Button>
			</div>
		</article>
	{/each}
</div>
