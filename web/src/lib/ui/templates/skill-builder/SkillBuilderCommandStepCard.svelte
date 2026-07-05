<script lang="ts">
	import type { SkillBuilderWorkflowStepViewModel } from '$lib/skill-builder/skillBuilder.types';

	import { OPENQUOK_COMMAND_WORKFLOW_META } from '$lib/skill-builder/constants/openquokCommandWorkflowMeta';
	import { supportsWorkflowJsonPayload } from '$lib/skill-builder/utils/postsCreatePayload';
	import { url } from '$lib/utils/path';

	import ExternalLink from '$lib/ui/components/ExternalLink.svelte';
	import SkillBuilderPostsCreatePayloadFields from '$lib/ui/templates/skill-builder/SkillBuilderPostsCreatePayloadFields.svelte';

	type CommandStepViewModel = Extract<SkillBuilderWorkflowStepViewModel, { type: 'command' }>;

	type Props = {
		stepVm: CommandStepViewModel;
		onUpdate: (patch: Partial<CommandStepViewModel>) => void;
	};

	let { stepVm, onUpdate }: Props = $props();

	const docsPath = $derived(OPENQUOK_COMMAND_WORKFLOW_META[stepVm.commandName]?.docsPath);
	const docsHref = $derived(docsPath ? url(docsPath) : null);
	const showPayloadFields = $derived(supportsWorkflowJsonPayload(stepVm.commandName));
</script>

<div class="space-y-3">
	<label class="block space-y-1">
		<span class="text-xs font-medium text-base-content/70">Workflow step title</span>
		<input
			class="input input-bordered input-sm w-full"
			type="text"
			value={stepVm.title ?? ''}
			oninput={(event) => onUpdate({ title: event.currentTarget.value })}
			placeholder="e.g. Schedule a post"
		/>
	</label>

	<label class="block space-y-1">
		<span class="text-xs font-medium text-base-content/70">Agent instructions</span>
		<textarea
			class="textarea textarea-bordered w-full text-sm"
			rows="3"
			value={stepVm.prompt}
			oninput={(event) => onUpdate({ prompt: event.currentTarget.value })}
			placeholder="Describe what the agent should do in this workflow step."
		></textarea>
	</label>

	{#if stepVm.commandTemplate}
		<label class="block space-y-1">
			<span class="text-xs font-medium text-base-content/70">CLI example</span>
			<textarea
				class="textarea textarea-bordered w-full font-mono text-xs"
				rows={Math.min(8, stepVm.commandTemplate.split('\n').length + 1)}
				value={stepVm.commandTemplate}
				oninput={(event) => onUpdate({ commandTemplate: event.currentTarget.value })}
			></textarea>
		</label>
	{/if}

	{#if showPayloadFields}
		<SkillBuilderPostsCreatePayloadFields
			payload={stepVm.examplePayload}
			onChange={(examplePayload) => onUpdate({ examplePayload })}
		/>
	{/if}

	{#if docsHref}
		<p class="text-xs text-base-content/60">
			API reference:
			<ExternalLink href={docsHref}>Open playground</ExternalLink>
		</p>
	{/if}
</div>
