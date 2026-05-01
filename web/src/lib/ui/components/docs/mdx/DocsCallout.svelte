<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/ui/alert/index.js';
	import type { AlertVariant } from '$lib/ui/alert/alert.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import type { IconName } from '$data/icons';

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
			class: 'border-info/40 bg-info/5 [&>svg]:text-info',
			titleClass: 'text-info',
			/** Markdown inside Callout is not parsed; use <a> — style nested links to match the callout. */
			descriptionLinkClass: '[&_a]:text-info [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:opacity-90'
		},
		warning: {
			icon: 'CircleAlert' as IconName,
			label: 'Warning',
			variant: 'warning' as AlertVariant,
			class: 'border-warning/40 bg-warning/5 [&>svg]:text-warning',
			titleClass: 'text-warning',
			descriptionLinkClass: '[&_a]:text-warning [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:opacity-90'
		},
		tip: {
			icon: 'Light' as IconName,
			label: 'Tip',
			variant: 'success' as AlertVariant,
			class: 'border-success/40 bg-success/5 [&>svg]:text-success',
			titleClass: 'text-success',
			descriptionLinkClass: '[&_a]:text-success [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:opacity-90'
		},
		danger: {
			icon: 'CircleX' as IconName,
			label: 'Danger',
			variant: 'error' as AlertVariant,
			class: 'border-error/40 bg-error/5 [&>svg]:text-error',
			titleClass: 'text-error',
			descriptionLinkClass: '[&_a]:text-error [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:opacity-90'
		}
	} as const;

	let current = $derived(config[type]);
</script>

<div class="not-prose my-6">
	<Alert variant={current.variant} class="flex flex-row items-start gap-3 {current.class}">
		<AbstractIcon name={current.icon} class="size-4 shrink-0" width="16" height="16" />
		<AlertTitle class={current.titleClass}>{title ?? current.label}</AlertTitle>
		<AlertDescription class={current.descriptionLinkClass}>
			{@render children()}
		</AlertDescription>
	</Alert>
</div>
