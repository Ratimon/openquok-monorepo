<script lang="ts">
	import type { PublicApiFormatExample } from '$lib/content/constants/apis/types';

	import CopyBlock from '$lib/ui/components/CopyBlock.svelte';

	type Props = {
		formatExamples: readonly PublicApiFormatExample[];
	};

	let { formatExamples }: Props = $props();

	let selectedId = $state(formatExamples[0]?.id ?? '');

	const selectedExample = $derived(
		formatExamples.find((example) => example.id === selectedId) ?? formatExamples[0]
	);
</script>

<section class="py-10 md:py-14">
	<div class="container mx-auto px-4">
		<div class="mx-auto max-w-3xl space-y-4 text-center">
			<h2 class="text-2xl font-black tracking-tight text-base-content sm:text-3xl">
				Explore requests and responses by format
			</h2>
			<p class="text-base font-medium leading-relaxed text-base-content/70">
				Static examples mirror shipped OpenQuok public API payloads and success responses.
			</p>
		</div>

		{#if formatExamples.length > 0}
			<div class="mx-auto mt-8 flex max-w-6xl flex-wrap justify-center gap-2">
				{#each formatExamples as example (example.id)}
					<button
						type="button"
						class="rounded-full border px-4 py-2 text-sm font-semibold transition {selectedId === example.id
							? 'border-primary bg-primary text-primary-content'
							: 'border-base-content/15 bg-base-100 text-base-content/80 hover:border-primary/40'}"
						aria-pressed={selectedId === example.id}
						onclick={() => {
							selectedId = example.id;
						}}
					>
						{example.label}
					</button>
				{/each}
			</div>

			{#if selectedExample}
				<div class="mx-auto mt-8 max-w-3xl text-center">
					<p class="text-sm leading-relaxed text-base-content/70">{selectedExample.description}</p>
				</div>

				<div class="mx-auto mt-8 grid max-w-6xl gap-6 lg:grid-cols-2">
					<div class="space-y-4 rounded-2xl border border-base-content/10 bg-base-200/30 p-5">
						<h3 class="text-sm font-bold tracking-wide text-base-content uppercase">Request</h3>
						<CopyBlock
							text={selectedExample.requestJson}
							background="bg-base-100"
							copiedBackground="bg-success/20"
							boxClass="rounded-xl border border-base-content/10 p-4 text-left text-xs leading-relaxed whitespace-pre-wrap font-mono"
							copiedColor="text-success"
						/>
					</div>

					<div class="space-y-4 rounded-2xl border border-base-content/10 bg-base-200/30 p-5">
						<h3 class="text-sm font-bold tracking-wide text-base-content uppercase">Response</h3>
						<CopyBlock
							text={selectedExample.responseJson}
							background="bg-base-100"
							copiedBackground="bg-success/20"
							boxClass="rounded-xl border border-base-content/10 p-4 text-left text-xs leading-relaxed whitespace-pre-wrap font-mono"
							copiedColor="text-success"
						/>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</section>
