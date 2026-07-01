<script lang="ts">
	import type { StackBuilderWorkflowStepViewModel } from '$lib/stack-builder/stackBuilder.types';

	type TextStepViewModel = Extract<StackBuilderWorkflowStepViewModel, { type: 'text' }>;

	type Props = {
		stepVm: TextStepViewModel;
		onUpdate: (patch: Partial<TextStepViewModel>) => void;
	};

	let { stepVm, onUpdate }: Props = $props();
</script>

<div>
	<label class="block space-y-1">
		<span class="text-xs font-medium text-base-content/70">Instructions</span>
		<textarea
			class="textarea textarea-bordered w-full text-sm"
			rows="3"
			value={stepVm.content}
			oninput={(event) => onUpdate({ content: event.currentTarget.value })}
			placeholder="e.g. Wait for publish, then review metrics before the next command."
		></textarea>
	</label>
</div>
