<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Field from '$lib/ui/field';
	import { Textarea } from '$lib/ui/textarea';

	export type FaqEditorItem = {
		question: string;
		answer: string;
	};

	type Props = {
		faqs: FaqEditorItem[] | null;
		onChange: (faqs: FaqEditorItem[]) => void;
		label?: string;
		description?: string;
	};

	let {
		faqs = [],
		onChange,
		label = 'FAQs',
		description = 'Add frequently asked questions for public pages.'
	}: Props = $props();

	let localFaqs = $state<FaqEditorItem[]>(faqs ?? []);

	$effect(() => {
		const next = faqs ?? [];
		if (JSON.stringify(next) !== JSON.stringify(localFaqs)) {
			localFaqs = [...next];
		}
	});

	function addFaq() {
		localFaqs = [...localFaqs, { question: '', answer: '' }];
		onChange(localFaqs);
	}

	function removeFaq(index: number) {
		localFaqs = localFaqs.filter((_, i) => i !== index);
		onChange(localFaqs);
	}

	function updateFaq(index: number, field: keyof FaqEditorItem, value: string) {
		localFaqs[index] = { ...localFaqs[index], [field]: value };
		onChange(localFaqs);
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between gap-4">
		<div>
			<p class="font-medium">{label}</p>
			<p class="text-sm text-base-content/70">{description}</p>
		</div>
		<Button variant="outline" size="sm" type="button" onclick={addFaq}>
			<AbstractIcon name={icons.Plus.name} class="mr-2 size-4" width="16" height="16" />
			Add FAQ
		</Button>
	</div>

	{#if localFaqs.length > 0}
		<div class="space-y-6">
			{#each localFaqs as faq, index (index)}
				<div class="relative space-y-4 rounded-lg border border-base-300 p-4">
					<Button
						variant="ghost"
						size="icon"
						type="button"
						class="absolute top-2 right-2 text-error"
						aria-label="Remove FAQ {index + 1}"
						onclick={() => removeFaq(index)}
					>
						<AbstractIcon name={icons.Trash.name} class="size-4" width="16" height="16" />
					</Button>

					<Field.Group>
						<Field.Label for="faq-question-{index}">Question {index + 1}</Field.Label>
						<input
							id="faq-question-{index}"
							class="input input-bordered w-full"
							type="text"
							placeholder="Enter the question"
							value={faq.question}
							oninput={(e) =>
								updateFaq(index, 'question', (e.currentTarget as HTMLInputElement).value)}
						/>
					</Field.Group>

					<Field.Group>
						<Field.Label for="faq-answer-{index}">Answer {index + 1}</Field.Label>
						<Textarea
							id="faq-answer-{index}"
							class="w-full"
							rows={3}
							placeholder="Enter the answer"
							value={faq.answer}
							oninput={(e) =>
								updateFaq(index, 'answer', (e.currentTarget as HTMLTextAreaElement).value)}
						/>
					</Field.Group>
				</div>
			{/each}
		</div>
	{:else}
		<div class="rounded-lg border border-dashed border-base-300 p-8 text-center">
			<p class="text-sm text-base-content/60">No FAQs added yet.</p>
		</div>
	{/if}
</div>
