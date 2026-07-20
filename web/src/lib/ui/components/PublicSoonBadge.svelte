<script lang="ts">
	type Props = {
		label?: string;
		class?: string;
	};

	let { label = 'Soon', class: className = '' }: Props = $props();
</script>

<span
	class="shrink-0 rounded-full bg-base-content/10 px-2.5 py-0.5 text-xs font-semibold text-base-content/60 uppercase {className}"
>
	{label}
</span>
