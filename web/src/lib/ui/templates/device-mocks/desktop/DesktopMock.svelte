<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import { desktopMock } from '$lib/ui/templates/device-mocks/desktop/desktopMockTheme';

	type Props = {
		class?: string;
		children?: Snippet;
	} & HTMLAttributes<HTMLDivElement>;

	let { class: className = '', children, ...rest }: Props = $props();

	const { root, screenFrame, screenInner, keyboard, keyboardBar, keyboardNotch } = desktopMock();
</script>

<div class={root({ class: className })} {...rest}>
	<div class={screenFrame()}>
		<div class={screenInner()}>
			{#if children}
				{@render children()}
			{/if}
		</div>
	</div>
	<div class={keyboard()} aria-hidden="true">
		<div class={keyboardBar()}></div>
		<div class={keyboardNotch()}></div>
	</div>
</div>
