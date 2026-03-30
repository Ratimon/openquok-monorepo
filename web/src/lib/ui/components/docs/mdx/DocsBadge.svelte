<script lang="ts">
	import { Badge } from '$lib/ui/badge/index.js';

	let {
		text,
		variant = 'default'
	}: {
		text: string;
		variant?:
			| 'default'
			| 'new'
			| 'deprecated'
			| 'experimental'
			| 'envFile'
			| 'envBackend'
			| 'envWeb'
			| 'envCors'
			| 'envRuntime'
			| 'path';
	} = $props();

	const variantMap = {
		default: { uiVariant: 'secondary' as const, class: '' },
		new: { uiVariant: 'green' as const, class: '' },
		deprecated: { uiVariant: 'red' as const, class: '' },
		experimental: { uiVariant: 'yellow' as const, class: '' },
		envFile: { uiVariant: 'pink' as const, class: '' },
		envBackend: { uiVariant: 'blue' as const, class: '' },
		envWeb: { uiVariant: 'purple' as const, class: '' },
		envCors: { uiVariant: 'warning' as const, class: '' },
		envRuntime: { uiVariant: 'gray' as const, class: '' },
		path: { uiVariant: 'outline' as const, class: '' }
	} as const;

	let current = $derived(variantMap[variant]);
</script>

<Badge variant={current.uiVariant} class="not-prose mx-0.5 inline-flex align-middle {current.class}"
	>{text}</Badge>
