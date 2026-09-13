<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import BlogRichTextField from '$lib/ui/components/blog-post/BlogRichTextField.svelte';
	import * as Field from '$lib/ui/field';
	import { Textarea } from '$lib/ui/textarea';

	export type FaqEditorItem = {
		question: string;
		answer: string;
	};

	type LocalFaqRow = FaqEditorItem & { id: string };

	type Props = {
		faqs: FaqEditorItem[] | null;
		onChange: (faqs: FaqEditorItem[]) => void;
		label?: string;
		description?: string;
		/** Visual + HTML source for answers (internal links). Questions stay plain text. */
		richTextAnswers?: boolean;
		answerPlaceholder?: string;
	};

	let {
		faqs = [],
		onChange,
		label = 'FAQs',
		description = 'Add frequently asked questions for public pages. Use the arrows on each card to reorder items.',
		richTextAnswers = false,
		answerPlaceholder = 'Paste HTML or use Visual → link. Example: /docs/getting-started-for-cli'
	}: Props = $props();

	function hydrateFaqs(items: FaqEditorItem[]): LocalFaqRow[] {
		return items.map((item) => ({ ...item, id: crypto.randomUUID() }));
	}

	function toFaqDto(rows: LocalFaqRow[]): FaqEditorItem[] {
		return rows.map(({ question, answer }) => ({ question, answer }));
	}

	let localFaqs = $state<LocalFaqRow[]>([]);

	$effect.pre(() => {
		const next = faqs ?? [];
		const nextDto = JSON.stringify(next);
		const localDto = JSON.stringify(toFaqDto(localFaqs));
		if (nextDto !== localDto) {
			localFaqs = hydrateFaqs(next);
		}
	});

	function emitChange(rows: LocalFaqRow[]) {
		localFaqs = rows;
		onChange(toFaqDto(rows));
	}

	function addFaq() {
		emitChange([...localFaqs, { id: crypto.randomUUID(), question: '', answer: '' }]);
	}

	function removeFaq(index: number) {
		emitChange(localFaqs.filter((_, i) => i !== index));
	}

	function moveFaq(from: number, to: number) {
		if (to < 0 || to >= localFaqs.length) return;
		const next = [...localFaqs];
		const [row] = next.splice(from, 1);
		next.splice(to, 0, row);
		emitChange(next);
	}

	function updateFaq(index: number, field: keyof FaqEditorItem, value: string) {
		const next = localFaqs.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq));
		emitChange(next);
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
			{#each localFaqs as faq, index (faq.id)}
				<div class="relative space-y-4 rounded-lg border border-base-300 p-4">
					<div class="absolute top-2 right-2 flex items-center gap-1">
						<div class="flex flex-col gap-0.5">
							<Button
								variant="ghost"
								size="icon"
								type="button"
								class="h-7 w-7"
								disabled={index === 0}
								onclick={() => moveFaq(index, index - 1)}
								aria-label="Move FAQ {index + 1} up"
							>
								<AbstractIcon name={icons.ChevronUp.name} class="size-4" width="16" height="16" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								type="button"
								class="h-7 w-7"
								disabled={index === localFaqs.length - 1}
								onclick={() => moveFaq(index, index + 1)}
								aria-label="Move FAQ {index + 1} down"
							>
								<AbstractIcon
									name={icons.ChevronDown.name}
									class="size-4"
									width="16"
									height="16"
								/>
							</Button>
						</div>
						<Button
							variant="ghost"
							size="icon"
							type="button"
							class="text-error"
							aria-label="Remove FAQ {index + 1}"
							onclick={() => removeFaq(index)}
						>
							<AbstractIcon name={icons.Trash.name} class="size-4" width="16" height="16" />
						</Button>
					</div>

					<Field.Group>
						<Field.Label for="faq-question-{faq.id}">Question {index + 1}</Field.Label>
						<input
							id="faq-question-{faq.id}"
							class="input input-bordered w-full"
							type="text"
							placeholder="Enter the question"
							value={faq.question}
							oninput={(e) =>
								updateFaq(index, 'question', (e.currentTarget as HTMLInputElement).value)}
						/>
					</Field.Group>

					<Field.Group>
						<Field.Label for="faq-answer-{faq.id}">Answer {index + 1}</Field.Label>
						{#if richTextAnswers}
							<BlogRichTextField
								textareaId="faq-answer-{faq.id}"
								value={faq.answer}
								placeholder={answerPlaceholder}
								onChange={(next) => updateFaq(index, 'answer', next)}
							/>
						{:else}
							<Textarea
								id="faq-answer-{faq.id}"
								class="w-full"
								rows={3}
								placeholder="Enter the answer"
								value={faq.answer}
								oninput={(e) =>
									updateFaq(index, 'answer', (e.currentTarget as HTMLTextAreaElement).value)}
							/>
						{/if}
					</Field.Group>
				</div>
			{/each}
		</div>
	{:else}
		<div class="rounded-lg border border-dashed border-base-300 p-8 text-center">
			<p class="text-sm text-base-content/60">No FAQs added yet.</p>
		</div>
	{/if}

	{#if localFaqs.length > 0}
		<div class="flex justify-start">
			<Button variant="outline" size="sm" type="button" onclick={addFaq}>
				<AbstractIcon name={icons.Plus.name} class="mr-2 size-4" width="16" height="16" />
				Add FAQ
			</Button>
		</div>
	{/if}
</div>
