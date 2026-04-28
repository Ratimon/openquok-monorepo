<script lang="ts">
	let { date }: { date: string } = $props();

	function formatLocal(raw: string): string {
		const ms = Date.parse(raw);
		if (!Number.isFinite(ms)) return raw;
		const d = new Date(ms);
		return d.toLocaleString([], {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}
</script>

<span>{formatLocal(date)}</span>

