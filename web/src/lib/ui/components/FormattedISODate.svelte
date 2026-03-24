<script lang="ts">
	type Props = {
		date: string | Date;
		class?: string;
	};

	let { date, class: className = '' }: Props = $props();

	const isoString = $derived(new Date(date).toISOString());
	const dateOnly = $derived(isoString.split('T')[0]);
</script>

<span class={className}>
	<time datetime={isoString}>
		{dateOnly}
	</time>
</span>
