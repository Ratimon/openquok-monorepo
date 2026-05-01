<script lang="ts">
	type Point = { date: string; total: number };
	type Props = {
		data: Point[];
		class?: string;
		colorClass?: string;
	};
	let { data, class: className = '', colorClass = 'stroke-primary' }: Props = $props();

	const normalized = $derived.by(() =>
		(data ?? [])
			.map((p) => ({ x: String(p.date ?? ''), y: Number(p.total ?? 0) }))
			.filter((p) => p.x)
	);

	const viewBox = '0 0 100 40';

	const pathD = $derived.by(() => {
		if (normalized.length <= 1) return '';
		const ys = normalized.map((p) => p.y);
		const minY = Math.min(...ys);
		const maxY = Math.max(...ys);
		const spanY = maxY - minY || 1;

		return normalized
			.map((p, i) => {
				const x = normalized.length === 1 ? 0 : (i / (normalized.length - 1)) * 100;
				// invert y so higher totals are higher on chart
				const y = 36 - ((p.y - minY) / spanY) * 32;
				return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
			})
			.join(' ');
	});
</script>

<svg
	aria-hidden="true"
	class="{className} w-full h-full"
	viewBox={viewBox}
	preserveAspectRatio="none"
>
	{#if pathD}
		<path d={pathD} class="{colorClass} fill-none" stroke-width="2" stroke-linecap="round" />
	{:else}
		<path d="M 0 36 L 100 36" class="{colorClass} fill-none opacity-30" stroke-width="2" />
	{/if}
</svg>

