<script lang="ts">
	import type { SkillBuilderWorkflowStepViewModel } from '$lib/skill-builder/skillBuilder.types';

	type TextStepViewModel = Extract<SkillBuilderWorkflowStepViewModel, { type: 'text' }>;

	type Props = {
		stepVm: TextStepViewModel;
		onUpdate: (patch: Partial<TextStepViewModel>) => void;
	};

	let { stepVm, onUpdate }: Props = $props();
</script>

<div class="space-y-3">
	<label class="block space-y-1">
		<span class="text-xs font-medium text-base-content/70">Step title</span>
		<input
			class="input input-bordered input-sm w-full"
			type="text"
			value={stepVm.title ?? ''}
			oninput={(event) => onUpdate({ title: event.currentTarget.value })}
			placeholder="e.g. Do the first thing"
		/>
	</label>
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
