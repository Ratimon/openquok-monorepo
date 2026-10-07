<script lang="ts">
	import { untrack } from 'svelte';

	import type { LinkDirectoryOpportunityStepDto } from '$lib/link-directory/link-directory.types';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Field from '$lib/ui/field';
	import LinkDirectoryRichHtmlField from '$lib/ui/components/link-directory-manager/LinkDirectoryRichHtmlField.svelte';
	import { Input } from '$lib/ui/input';
	import { sortLinkDirectoryOpportunitySteps } from '$lib/link-directory/utils/normalizeLinkDirectoryOpportunityStepsForSave';

	type LocalStepRow = LinkDirectoryOpportunityStepDto & { id: string };

	type Props = {
		initialSteps: LinkDirectoryOpportunityStepDto[];
		userId: string;
		onChange: (steps: LinkDirectoryOpportunityStepDto[]) => void;
	};

	let { initialSteps, userId, onChange }: Props = $props();

	function hydrateSteps(items: LinkDirectoryOpportunityStepDto[]): LocalStepRow[] {
		return sortLinkDirectoryOpportunitySteps(items).map((step) => ({
			...step,
			id: crypto.randomUUID()
		}));
	}

	function toStepDto(rows: LocalStepRow[]): LinkDirectoryOpportunityStepDto[] {
		return rows.map(({ order, title, body }, index) => ({
			order: index + 1,
			title,
			body
		}));
	}

	let localSteps = $state<LocalStepRow[]>(untrack(() => hydrateSteps(initialSteps)));

	function emitChange(rows: LocalStepRow[]) {
		localSteps = rows;
		onChange(toStepDto(rows));
	}

	function addStep() {
		emitChange([...localSteps, { id: crypto.randomUUID(), order: localSteps.length + 1, title: '', body: '' }]);
	}

	function removeStep(index: number) {
		emitChange(localSteps.filter((_, i) => i !== index));
	}

	function moveStep(from: number, to: number) {
		if (to < 0 || to >= localSteps.length) return;
		const next = [...localSteps];
		const [row] = next.splice(from, 1);
		next.splice(to, 0, row);
		emitChange(next);
	}

	function updateStep(index: number, field: 'title' | 'body', value: string) {
		const next = localSteps.map((step, i) => (i === index ? { ...step, [field]: value } : step));
		emitChange(next);
	}
</script>

<div class="space-y-4 rounded-xl border border-base-300 p-4">
	<div class="flex items-start justify-between gap-4">
		<div>
			<p class="text-sm font-medium">Playbook steps</p>
			<p class="text-xs text-base-content/70">
				Numbered steps on the public site guide and in HowTo JSON-LD. Leave empty to fall back to the
				opportunity title and description only. Use the arrows on each card to reorder.
			</p>
		</div>
		<Button variant="outline" size="sm" type="button" onclick={addStep}>
			<AbstractIcon name={icons.Plus.name} class="mr-2 size-4" width="16" height="16" />
			Add step
		</Button>
	</div>

	{#if localSteps.length === 0}
		<div class="rounded-lg border border-dashed border-base-300 p-6 text-center">
			<p class="text-sm text-base-content/60">No steps yet.</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each localSteps as step, index (step.id)}
				<div class="relative space-y-3 rounded-lg border border-base-300/80 p-4">
					<div class="absolute top-2 right-2 flex items-center gap-1">
						<div class="flex flex-col gap-0.5">
							<Button
								variant="ghost"
								size="icon"
								type="button"
								class="h-7 w-7"
								disabled={index === 0}
								onclick={() => moveStep(index, index - 1)}
								aria-label="Move step {index + 1} up"
							>
								<AbstractIcon name={icons.ChevronUp.name} class="size-4" width="16" height="16" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								type="button"
								class="h-7 w-7"
								disabled={index === localSteps.length - 1}
								onclick={() => moveStep(index, index + 1)}
								aria-label="Move step {index + 1} down"
							>
								<AbstractIcon name={icons.ChevronDown.name} class="size-4" width="16" height="16" />
							</Button>
						</div>
						<Button
							variant="ghost"
							size="icon"
							type="button"
							class="text-error"
							aria-label="Remove step {index + 1}"
							onclick={() => removeStep(index)}
						>
							<AbstractIcon name={icons.Trash.name} class="size-4" width="16" height="16" />
						</Button>
					</div>

					<p class="text-sm font-medium text-base-content/80 pr-24">Step {index + 1}</p>

					<Field.Group>
						<Field.Label for="link-directory-step-title-{step.id}">Step title</Field.Label>
						<Input
							id="link-directory-step-title-{step.id}"
							value={step.title}
							placeholder="e.g. Add your website in About"
							oninput={(e) => updateStep(index, 'title', e.currentTarget.value)}
						/>
					</Field.Group>

					<LinkDirectoryRichHtmlField
						id="link-directory-step-body-{step.id}"
						label="Step instructions"
						value={step.body}
						onValueChange={(next) => updateStep(index, 'body', next)}
						rows={4}
						visualEditor={true}
						{userId}
						placeholder="<p>Instructions with optional <a href=&quot;https://…&quot;>links</a>.</p>"
					/>
				</div>
			{/each}
		</div>
	{/if}

	{#if localSteps.length > 0}
		<Button variant="outline" size="sm" type="button" onclick={addStep}>
			<AbstractIcon name={icons.Plus.name} class="mr-2 size-4" width="16" height="16" />
			Add step
		</Button>
	{/if}
</div>
