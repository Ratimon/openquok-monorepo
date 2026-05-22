<script lang="ts">
	import type { SubscriptionPeriod } from 'openquok-common';

	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		period: SubscriptionPeriod;
		onPeriodChange: (period: SubscriptionPeriod) => void;
	};

	let { period, onPeriodChange }: Props = $props();

	const isYearly = $derived(period === 'YEARLY');
</script>

<div class="flex items-center gap-4 text-sm font-medium tracking-wide">
	<span class={cn(isYearly ? 'text-base-content/50' : 'text-base-content')}>MONTHLY</span>
	<input
		type="checkbox"
		class="toggle toggle-primary"
		checked={isYearly}
		aria-label="Toggle yearly billing"
		onchange={(e) => onPeriodChange(e.currentTarget.checked ? 'YEARLY' : 'MONTHLY')}
	/>
	<span class={cn(isYearly ? 'text-base-content' : 'text-base-content/50')}>YEARLY</span>
</div>
