<script lang="ts">
	import { onMount } from 'svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { icons } from '$data/icons';

	type Props = {
		owner: string;
		name: string;
	};

	let { owner, name }: Props = $props();
	let stars = $state(0);

	function formatStars(count: number): string {
		if (count >= 1000) {
			const k = count / 1000;
			return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`;
		}
		return String(count);
	}

	onMount(() => {
		fetch(`https://api.github.com/repos/${owner}/${name}`, {
			headers: { 'Content-Type': 'application/json' }
		})
			.then((res) => res.json())
			.then((res) => {
				stars = res.stargazers_count;
			});
	});
</script>

{#if owner && name}
	<a
		href={`https://github.com/${owner}/${name}`}
		target="_blank"
		rel="noreferrer"
		class="inline-flex items-center gap-2 rounded-full border border-base-content/20 bg-base-content/5 px-4 py-1.5 text-base-content/80 transition-colors hover:bg-base-content/10"
	>
		<AbstractIcon
			name={icons.Github.name}
			width="24"
			height="24"
			class="shrink-0"
			focusable="false"
		/>
		{#if !isNaN(stars) && stars > 0}
			<AbstractIcon
				name={icons.Star.name}
				width="24"
				height="24"
				class="shrink-0 text-amber-400"
				focusable="false"
			/>
			<span class="text-sm font-semibold">{formatStars(stars)}</span>
		{/if}
	</a>
{/if}
