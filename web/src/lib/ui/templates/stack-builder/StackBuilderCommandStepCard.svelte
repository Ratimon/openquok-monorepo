<script lang="ts">
	import type { StackBuilderWorkflowStepViewModel } from '$lib/stack-builder/stackBuilder.types';

	type CommandStepViewModel = Extract<StackBuilderWorkflowStepViewModel, { type: 'command' }>;

	type Props = {
		stepVm: CommandStepViewModel;
		onUpdate: (patch: Partial<CommandStepViewModel>) => void;
	};

	let { stepVm, onUpdate }: Props = $props();

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

<div class="space-y-3">
	<label class="block space-y-1">
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
		<label class="block space-y-1">
			<span class="text-xs font-medium text-base-content/70">Command template</span>
			<input
				class="input input-bordered w-full font-mono text-xs"
				value={stepVm.commandTemplate}
				oninput={(event) => onUpdate({ commandTemplate: event.currentTarget.value })}
			/>
		</label>
	{/if}

	<label class="block space-y-1">
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
