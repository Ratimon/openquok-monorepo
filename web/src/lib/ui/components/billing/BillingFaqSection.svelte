<script lang="ts">
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		title: string;
		description: string;
	};

	let { title, description }: Props = $props();

	let expanded = $state(false);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="flex cursor-pointer flex-col rounded-lg border border-base-300 bg-base-100 p-6"
	role="button"
	tabindex="0"
	onclick={() => {
		expanded = !expanded;
	}}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			expanded = !expanded;
		}
	}}
>
	<div class="flex cursor-pointer justify-center text-xl">
		<div class="flex-1 text-left">{title}</div>
		<div class="flex h-8 w-8 items-center justify-center">
			{#if !expanded}
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path
						d="M18 12.75H6C5.59 12.75 5.25 12.41 5.25 12C5.25 11.59 5.59 11.25 6 11.25H18C18.41 11.25 18.75 11.59 18.75 12C18.75 12.41 18.41 12.75 18 12.75Z"
						fill="currentColor"
					/>
					<path
						d="M12 18.75C11.59 18.75 11.25 18.41 11.25 18V6C11.25 5.59 11.59 5.25 12 5.25C12.41 5.25 12.75 5.59 12.75 6V18C12.75 18.41 12.41 18.75 12 18.75Z"
						fill="currentColor"
					/>
				</svg>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
					<path
						d="M24 17H8C7.45333 17 7 16.5467 7 16C7 15.4533 7.45333 15 8 15H24C24.5467 15 25 15.4533 25 16C25 16.5467 24.5467 17 24 17Z"
						fill="currentColor"
					/>
				</svg>
			{/if}
		</div>
	</div>
	<div
		class={cn(
			'overflow-hidden transition-all duration-500',
			expanded ? 'max-h-[500px]' : 'max-h-0'
		)}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="mt-4 max-w-lg text-base font-normal text-base-content/70 select-text"
			onclick={(e) => e.stopPropagation()}
		>
			{@html description}
		</div>
	</div>
</div>
