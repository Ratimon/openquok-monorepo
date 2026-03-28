<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/ui/alert/index.js';
	import type { AlertVariant } from '$lib/ui/alert/alert.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import type { IconName } from '$data/icon';

	let {
		type = 'note',
		title,
		children
	}: {
		type?: 'note' | 'warning' | 'tip' | 'danger';
		title?: string;
		children: Snippet;
	} = $props();

	const config = {
		note: {
			icon: 'Info' as IconName,
			label: 'Note',
			variant: 'info' as AlertVariant,
			class: 'border-info/40 bg-info/5 [&>svg]:text-info'
		},
		warning: {
			icon: 'CircleAlert' as IconName,
			label: 'Warning',
			variant: 'warning' as AlertVariant,
			class: 'border-warning/40 bg-warning/5 [&>svg]:text-warning'
		},
		tip: {
			icon: 'Light' as IconName,
			label: 'Tip',
			variant: 'success' as AlertVariant,
			class: 'border-success/40 bg-success/5 [&>svg]:text-success'
		},
		danger: {
			icon: 'CircleX' as IconName,
			label: 'Danger',
			variant: 'error' as AlertVariant,
			class: 'border-error/40 bg-error/5 [&>svg]:text-error'
		}
	} as const;

	let current = $derived(config[type]);
</script>

<div class="not-prose my-6">
	<Alert variant={current.variant} class="flex flex-row items-start gap-3 {current.class}">
		<AbstractIcon name={current.icon} class="size-4 shrink-0" width="16" height="16" />
		<AlertTitle>{title ?? current.label}</AlertTitle>
		<AlertDescription>
			{@render children()}
		</AlertDescription>
	</Alert>
</div>
