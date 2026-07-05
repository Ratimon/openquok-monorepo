<script lang="ts">
	import type { SkillBuilderLibraryItemKind, SkillBuilderWorkflowStepViewModel } from '$lib/skill-builder/skillBuilder.types';

	import { icons } from '$data/icons';

	import { resolveCommandWorkflowTitle } from '$lib/skill-builder/constants/openquokCommandWorkflowMeta';

	import * as Accordion from '$lib/ui/accordion';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import SkillBuilderCommandStepCard from '$lib/ui/templates/skill-builder/SkillBuilderCommandStepCard.svelte';
	import SkillBuilderTextStepCard from '$lib/ui/templates/skill-builder/SkillBuilderTextStepCard.svelte';

	type Props = {
		stepVm: SkillBuilderWorkflowStepViewModel;
		stepNumber: number;
		index: number;
		onUpdate: (patch: Partial<SkillBuilderWorkflowStepViewModel>) => void;
		onRemove: () => void;
		onDragStart: (index: number) => void;
		onDragOver: (event: DragEvent, index: number) => void;
		onDragEnd: () => void;
	};

	let { stepVm, stepNumber, index, onUpdate, onRemove, onDragStart, onDragOver, onDragEnd }: Props =
		$props();

	let expanded = $state(false);

	let itemElement = $state<HTMLLIElement | null>(null);

	const stepIcon = $derived(resolveStepIcon(stepVm));

	const stepTitle = $derived(
		stepVm.type === 'command'
			? resolveCommandWorkflowTitle(stepVm.commandName, stepVm.title)
			: stepVm.title?.trim() || 'Workflow note'
	);

	function resolveStepIcon(step: SkillBuilderWorkflowStepViewModel) {
		if (step.type === 'text') return icons.FileText.name;
		return step.kind === 'mcp' ? icons.Bot.name : icons.Terminal.name;
	}

	function stepKindLabel(kind: SkillBuilderLibraryItemKind): string {
		return kind === 'cli' ? 'CLI command' : 'MCP tool';
	}

	function handleDragStart(event: DragEvent) {
		if (!event.dataTransfer) return;
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/plain', String(index));
		if (itemElement) {
			event.dataTransfer.setDragImage(itemElement, 24, 24);
		}
		onDragStart(index);
	}
</script>

<li
	bind:this={itemElement}
	class="rounded-lg border border-dashed border-base-content/15 bg-base-100 transition-shadow"
	ondragover={(event) => onDragOver(event, index)}
	ondragenter={(event) => event.preventDefault()}
	ondrop={(event) => event.preventDefault()}
>
	<div class="flex items-center gap-2 p-3">
		<span
			role="button"
			tabindex="0"
			draggable="true"
			data-drag-handle
			class="inline-flex cursor-grab touch-none text-base-content/45 transition hover:text-base-content active:cursor-grabbing"
			aria-label="Reorder step {stepNumber}"
			ondragstart={handleDragStart}
			ondragend={onDragEnd}
			onkeydown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
				}
			}}
		>
			<AbstractIcon
				name={icons.GripVertical.name}
				class="size-4"
				width="16"
				height="16"
				aria-hidden="true"
			/>
		</span>

		<AbstractIcon
			name={stepIcon}
			class="size-4 shrink-0 text-base-content/55"
			width="16"
			height="16"
			aria-hidden="true"
		/>

		<span class="min-w-0 flex-1 truncate text-sm font-medium text-base-content">
			{stepTitle}
			{#if stepVm.type === 'command'}
				<span class="sr-only">({stepKindLabel(stepVm.kind)})</span>
			{/if}
		</span>

		<button
			type="button"
			class="btn btn-ghost btn-xs btn-square shrink-0 text-error hover:bg-error/10 hover:text-error"
			aria-label="Remove step {stepNumber}"
			onclick={onRemove}
		>
			<AbstractIcon
				name={icons.Trash.name}
				class="size-3.5"
				width="14"
				height="14"
				aria-hidden="true"
			/>
		</button>
	</div>

	<Accordion.Root class="w-full">
		<Accordion.Item bind:open={expanded} class="border-none">
			<Accordion.Trigger
				class="flex w-full items-center justify-between px-3 py-2 text-xs text-base-content/70 transition hover:bg-base-200/40"
			>
				<span>Customize step</span>
				<AbstractIcon
					name={expanded ? icons.ChevronUp.name : icons.ChevronDown.name}
					class="size-3.5 shrink-0 text-base-content/55"
					width="14"
					height="14"
					aria-hidden="true"
				/>
			</Accordion.Trigger>

			<Accordion.Content class="overflow-hidden px-3 pb-3">
				{#if stepVm.type === 'command'}
					<SkillBuilderCommandStepCard stepVm={stepVm} onUpdate={onUpdate} />
				{:else}
					<SkillBuilderTextStepCard stepVm={stepVm} onUpdate={onUpdate} />
				{/if}
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>
</li>
