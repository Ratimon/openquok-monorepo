<script lang="ts">
	import { resolveCompareLongFormBodyIcon } from '$lib/content/constants/competitors/compareLongFormBodyIcons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		sectionId: string;
		paragraphs: readonly string[];
		class?: string;
	};

	let { sectionId, paragraphs, class: className = '' }: Props = $props();

	const iconContainerClass = $derived.by(() => {
		switch (sectionId) {
			case 'why-people-look':
				return 'bg-primary/10 text-primary ring-primary/20';
			case 'your-options':
				return 'bg-violet-500/10 text-violet-200 ring-violet-400/25';
			case 'when-they-win':
				return 'bg-amber-500/10 text-amber-200 ring-amber-400/25';
			case 'other-alternatives':
				return 'bg-fuchsia-500/10 text-fuchsia-200 ring-fuchsia-400/25';
			default:
				return 'bg-base-content/10 text-base-content/70 ring-base-content/15';
		}
	});
</script>

<ul class={`mx-auto max-w-3xl space-y-4 ${className}`}>
	{#each paragraphs as paragraph, index (index)}
		<li class="flex items-start gap-3 text-base leading-relaxed text-base-content/80">
			<div
				class={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl ring-1 ${iconContainerClass}`}
				aria-hidden="true"
			>
				<AbstractIcon
					name={resolveCompareLongFormBodyIcon(sectionId, index)}
					width="20"
					height="20"
					class="size-5"
					focusable="false"
				/>
			</div>
			<p class="min-w-0 flex-1 pt-1.5">{paragraph}</p>
		</li>
	{/each}
</ul>
