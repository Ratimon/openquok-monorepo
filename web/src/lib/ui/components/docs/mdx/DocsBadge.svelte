<script lang="ts">
	import { Badge } from '$lib/ui/badge/index.js';

	let {
		text,
		variant = 'default'
	}: {
		text: string;
		variant?: 'default' | 'new' | 'deprecated' | 'experimental';
	} = $props();

	const variantMap = {
		default: { uiVariant: 'secondary' as const, class: '' },
		new: { uiVariant: 'green' as const, class: '' },
		deprecated: { uiVariant: 'red' as const, class: '' },
		experimental: { uiVariant: 'yellow' as const, class: '' }
	} as const;

	let current = $derived(variantMap[variant]);
</script>

<Badge variant={current.uiVariant} class="not-prose {current.class}">{text}</Badge>
