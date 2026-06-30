<script lang="ts">
	import type { StackBuilderWorkflowStepViewModel } from '$lib/stack-builder/stackBuilder.types';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type CommandStepViewModel = Extract<StackBuilderWorkflowStepViewModel, { type: 'command' }>;

	type Props = {
		stepVm: CommandStepViewModel;
		stepNumber: number;
		onUpdate: (patch: Partial<CommandStepViewModel>) => void;
		onRemove: () => void;
	};

	let { stepVm, stepNumber, onUpdate, onRemove }: Props = $props();

	let payloadDraft = $state('');

	$effect(() => {
		payloadDraft =
			stepVm.examplePayload && Object.keys(stepVm.examplePayload).length > 0
				? JSON.stringify(stepVm.examplePayload, null, 2)
				: '';
	});

	function commitPayload() {
		const trimmed = payloadDraft.trim();
		if (!trimmed) {
			onUpdate({ examplePayload: undefined });
			return;
		}
		try {
			const parsed = JSON.parse(trimmed) as Record<string, unknown>;
			onUpdate({ examplePayload: parsed });
		} catch {
			// Keep draft; invalid JSON is ignored until valid.
		}
	}
</script>

<div class="p-4">
	<div class="flex items-start justify-between gap-3">
		<div class="min-w-0">
			<p class="text-xs font-semibold tracking-wide text-primary uppercase">Step {stepNumber}</p>
			<p class="mt-1 font-mono text-sm font-semibold text-base-content">
				{stepVm.listingSlug} · {stepVm.commandName}
			</p>
			<p class="text-xs text-base-content/60">{stepVm.listingTitle}</p>
		</div>
		<button
			type="button"
			class="btn btn-ghost btn-xs btn-square shrink-0"
			aria-label="Remove step"
			onclick={onRemove}
		>
			<AbstractIcon name={icons.X2.name} width="14" height="14" aria-hidden="true" />
		</button>
	</div>

	<label class="mt-4 block space-y-1">
		<span class="text-xs font-medium text-base-content/70">Agent prompt</span>
		<textarea
			class="textarea textarea-bordered w-full text-sm"
			rows="3"
			value={stepVm.prompt}
			oninput={(event) => onUpdate({ prompt: event.currentTarget.value })}
			placeholder="Describe what the agent should do with this command or tool."
		></textarea>
	</label>

	{#if stepVm.commandTemplate}
		<label class="mt-3 block space-y-1">
			<span class="text-xs font-medium text-base-content/70">Command template</span>
			<input
				class="input input-bordered w-full font-mono text-xs"
				value={stepVm.commandTemplate}
				oninput={(event) => onUpdate({ commandTemplate: event.currentTarget.value })}
			/>
		</label>
	{/if}

	<label class="mt-3 block space-y-1">
		<span class="text-xs font-medium text-base-content/70">Example JSON payload</span>
		<textarea
			class="textarea textarea-bordered w-full font-mono text-xs"
			rows="6"
			bind:value={payloadDraft}
			onblur={commitPayload}
			placeholder={'{\n  "example": true\n}'}
		></textarea>
	</label>
</div>
