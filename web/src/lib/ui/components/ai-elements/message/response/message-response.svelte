<script lang="ts">
	import type { StreamdownProps } from 'streamdown-svelte';

	import { Streamdown } from 'streamdown-svelte';
	import githubDarkDefault from '@shikijs/themes/github-dark-default';
	import githubLightDefault from '@shikijs/themes/github-light-default';

	import { cn } from '$lib/ui/helpers/common';
	import { createStreamdownShikiTheme } from '$lib/ui/components/ai-elements/helpers/streamdownTheme.svelte.js';

	// import { code } from "@streamdown-svelte/code";
	// import { mermaid } from '@streamdown-svelte/mermaid';
	// import { math } from '@streamdown-svelte/math';
	// import { cjk } from '@streamdown-svelte/cjk';
	// import 'katex/dist/katex.min.css';

	type Props = StreamdownProps;

	let { content, class: className, ...rest }: Props = $props();
	const streamdownTheme = createStreamdownShikiTheme();
	let currentTheme = $derived(streamdownTheme.current);
</script>

<div class={cn('size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0', className)}>
	<Streamdown
		{content}
		baseTheme="shadcn"
		shikiTheme={currentTheme}
		shikiThemes={{
			'github-light-default': githubLightDefault,
			'github-dark-default': githubDarkDefault
		}}
		{...rest}
	/>
</div>
