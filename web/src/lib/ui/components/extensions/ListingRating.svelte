<script lang="ts">
	import { icons } from '$data/icons';

	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type MutationResult = { ok: true } | { ok: false; error: string };

	type Props = {
		listingId: string;
		averageRating: number;
		ratingsCount: number;
		isLoggedIn?: boolean;
		communityEnabled?: boolean;
		submitRating: (listingId: string, rating: number) => Promise<MutationResult>;
		submitting?: boolean;
		onSignInRequired?: () => void;
		onUpgradeRequired?: () => void;
	};

	let {
		listingId,
		averageRating,
		ratingsCount,
		isLoggedIn = false,
		communityEnabled = true,
		submitRating,
		submitting = false,
		onSignInRequired,
		onUpgradeRequired
	}: Props = $props();

	let hoverRating = $state<number | null>(null);

	async function handleRate(value: number) {
		if (!isLoggedIn) {
			onSignInRequired?.();
			return;
		}
		if (!communityEnabled) {
			onUpgradeRequired?.();
			return;
		}
		await submitRating(listingId, value);
	}
</script>

<div class="space-y-2">
	<div class="flex items-center gap-2 text-sm text-base-content/70">
		<span class="font-medium text-base-content">{averageRating.toFixed(1)}</span>
		<span>({ratingsCount} {ratingsCount === 1 ? 'rating' : 'ratings'})</span>
	</div>
	<div class="flex items-center gap-1" role="group" aria-label="Rate this listing">
		{#each [1, 2, 3, 4, 5] as star (star)}
			<button
				type="button"
				class="btn btn-ghost btn-xs px-1"
				disabled={submitting}
				onmouseenter={() => (hoverRating = star)}
				onmouseleave={() => (hoverRating = null)}
				onclick={() => void handleRate(star)}
				aria-label={`Rate ${star} stars`}
			>
				<AbstractIcon
					name={icons.Star.name}
					width="18"
					height="18"
					class={(hoverRating ?? Math.round(averageRating)) >= star
						? 'text-warning'
						: 'text-base-content/30'}
				/>
			</button>
		{/each}
	</div>
	<p class="text-xs text-base-content/60">Sign in with community access to leave a star rating.</p>
</div>
