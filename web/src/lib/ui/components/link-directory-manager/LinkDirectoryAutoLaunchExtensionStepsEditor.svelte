<script lang="ts">
	import { untrack } from 'svelte';

	import type { LaunchStep, LaunchStepField } from 'openquok-common';

	import { linkDirectoryAutoLaunchProfilePathOptions } from '$lib/link-directory/constants/autoLaunchProfilePaths';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { Input } from '$lib/ui/input';

	type LocalFieldRow = LaunchStepField & { id: string };
	type LocalStepRow = LaunchStep & { id: string; localFields: LocalFieldRow[] };

	type Props = {
		initialSteps: LaunchStep[];
		onChange: (steps: LaunchStep[]) => void;
	};

	let { initialSteps, onChange }: Props = $props();

	function hydrateSteps(items: LaunchStep[]): LocalStepRow[] {
		return (items ?? []).map((step) => ({
			...step,
			id: step.id || `step_${crypto.randomUUID().slice(0, 8)}`,
			localFields: (step.fields ?? []).map((field) => ({
				...field,
				id: crypto.randomUUID()
			}))
		}));
	}

	function toLaunchSteps(rows: LocalStepRow[]): LaunchStep[] {
		return rows.map((step) => ({
			id: step.id.trim() || `step_${rows.indexOf(step) + 1}`,
			label: step.label,
			fields: step.localFields
				.filter((f) => f.key.trim() && f.label.trim() && f.profilePath.trim())
				.map(({ key, label, profilePath, selectorHint, fillMode }) => ({
					key: key.trim(),
					label: label.trim(),
					profilePath: profilePath.trim(),
					...(selectorHint?.trim() ? { selectorHint: selectorHint.trim() } : {}),
					...(fillMode ? { fillMode } : {})
				}))
		}));
	}

	let localSteps = $state<LocalStepRow[]>(untrack(() => hydrateSteps(initialSteps)));

	function emitChange(rows: LocalStepRow[]) {
		localSteps = rows;
		onChange(toLaunchSteps(rows));
	}

	function addStep() {
		emitChange([
			...localSteps,
			{
				id: `step_${localSteps.length + 1}`,
				label: '',
				localFields: []
			}
		]);
	}

	function removeStep(index: number) {
		emitChange(localSteps.filter((_, i) => i !== index));
	}

	function updateStep(index: number, field: 'id' | 'label', value: string) {
		const next = localSteps.map((step, i) => (i === index ? { ...step, [field]: value } : step));
		emitChange(next);
	}

	function addField(stepIndex: number) {
		const next = localSteps.map((step, i) =>
			i === stepIndex
				? {
						...step,
						localFields: [
							...step.localFields,
							{
								id: crypto.randomUUID(),
								key: '',
								label: '',
								profilePath: 'name',
								selectorHint: ''
							}
						]
					}
				: step
		);
		emitChange(next);
	}

	function removeField(stepIndex: number, fieldIndex: number) {
		const next = localSteps.map((step, i) =>
			i === stepIndex
				? { ...step, localFields: step.localFields.filter((_, fi) => fi !== fieldIndex) }
				: step
		);
		emitChange(next);
	}

	function updateField(
		stepIndex: number,
		fieldIndex: number,
		patch: Partial<LaunchStepField>
	) {
		const next = localSteps.map((step, i) =>
			i === stepIndex
				? {
						...step,
						localFields: step.localFields.map((field, fi) =>
							fi === fieldIndex ? { ...field, ...patch } : field
						)
					}
				: step
		);
		emitChange(next);
	}
</script>

<div class="space-y-4 rounded-xl border border-base-300 p-4">
	<div class="flex items-start justify-between gap-4">
		<div>
			<p class="text-sm font-medium">Extension fill steps</p>
			<p class="text-xs text-base-content/70">
				Steps and fields the browser extension uses for auto-fill and the on-page step rail. Each field
				maps a product profile path to a DOM selector hint.
			</p>
		</div>
		<Button variant="outline" size="sm" type="button" onclick={addStep}>
			<AbstractIcon name={icons.Plus.name} class="mr-2 size-4" width="16" height="16" />
			Add step
		</Button>
	</div>

	{#if localSteps.length === 0}
		<p class="text-sm text-base-content/60">No extension steps yet. Add at least one step with fields.</p>
	{:else}
		{#each localSteps as step, stepIndex (step.id)}
			<div class="space-y-3 rounded-lg border border-base-300/80 p-3">
				<div class="flex flex-wrap items-end justify-between gap-2">
					<label class="form-control min-w-[8rem] flex-1">
						<span class="label-text text-xs">Step id</span>
						<Input
							value={step.id}
							class="font-mono text-sm"
							oninput={(e) => updateStep(stepIndex, 'id', e.currentTarget.value)}
						/>
					</label>
					<label class="form-control min-w-[12rem] flex-[2]">
						<span class="label-text text-xs">Step label</span>
						<Input
							value={step.label}
							oninput={(e) => updateStep(stepIndex, 'label', e.currentTarget.value)}
						/>
					</label>
					<Button variant="ghost" size="sm" type="button" onclick={() => removeStep(stepIndex)}>
						Remove step
					</Button>
				</div>

				<div class="space-y-2">
					{#each step.localFields as field, fieldIndex (field.id)}
						<div class="grid gap-2 rounded-md bg-base-200/40 p-2 sm:grid-cols-2">
							<label class="form-control">
								<span class="label-text text-xs">Field key</span>
								<Input
									value={field.key}
									class="font-mono text-sm"
									oninput={(e) =>
										updateField(stepIndex, fieldIndex, { key: e.currentTarget.value })}
								/>
							</label>
							<label class="form-control">
								<span class="label-text text-xs">Field label</span>
								<Input
									value={field.label}
									oninput={(e) =>
										updateField(stepIndex, fieldIndex, { label: e.currentTarget.value })}
								/>
							</label>
							<label class="form-control">
								<span class="label-text text-xs">Profile path</span>
								<select
									class="select select-bordered select-sm w-full font-mono text-sm"
									value={field.profilePath}
									onchange={(e) =>
										updateField(stepIndex, fieldIndex, {
											profilePath: e.currentTarget.value
										})}
								>
									{#each linkDirectoryAutoLaunchProfilePathOptions as opt (opt.value)}
										<option value={opt.value}>{opt.label}</option>
									{/each}
									{#if !linkDirectoryAutoLaunchProfilePathOptions.some((o) => o.value === field.profilePath)}
										<option value={field.profilePath}>{field.profilePath}</option>
									{/if}
								</select>
							</label>
							<label class="form-control sm:col-span-2">
								<span class="label-text text-xs">Selector hint (optional)</span>
								<Input
									value={field.selectorHint ?? ''}
									class="font-mono text-xs"
									placeholder="input[name*='tagline' i]"
									oninput={(e) =>
										updateField(stepIndex, fieldIndex, {
											selectorHint: e.currentTarget.value
										})}
								/>
							</label>
							<div class="sm:col-span-2 flex justify-end">
								<Button
									variant="ghost"
									size="sm"
									type="button"
									onclick={() => removeField(stepIndex, fieldIndex)}
								>
									Remove field
								</Button>
							</div>
						</div>
					{/each}
					<Button variant="outline" size="sm" type="button" onclick={() => addField(stepIndex)}>
						Add field
					</Button>
				</div>
			</div>
		{/each}
	{/if}
</div>
