<script lang="ts">
	import type { PostTagProgrammerModel, RepeatIntervalKey } from '$lib/posts';
	import Button from '$lib/ui/buttons/Button.svelte';
	import DatePicker from './DatePicker.svelte';
	import RepeatComponent from './RepeatComponent.svelte';
	import TagsComponent from './TagsComponent.svelte';

	type RepeatOption = { value: RepeatIntervalKey; label: string };

	type Props = {
		tagList: PostTagProgrammerModel[];
		selectedTagNames: string[];
		repeatInterval: RepeatIntervalKey | null;
		repeatOptions: RepeatOption[];
		scheduledLocal?: string;
		busy?: boolean;
		primaryLabel: string;
		scheduleDisabled?: boolean;
		onToggleTag: (name: string) => void;
		onAddTag: (name?: string, color?: string) => void | Promise<void>;
		onDeleteTag?: (tag: PostTagProgrammerModel) => void | Promise<void>;
		onRepeatChange: (value: RepeatIntervalKey | null) => void;
		onSaveDraft: () => void | Promise<void>;
		onSchedule: () => void | Promise<void>;
	};

	let {
		tagList,
		selectedTagNames,
		repeatInterval,
		repeatOptions,
		scheduledLocal = $bindable(''),
		busy = false,
		primaryLabel,
		scheduleDisabled = false,
		onToggleTag,
		onAddTag,
		onDeleteTag,
		onRepeatChange,
		onSaveDraft,
		onSchedule
	}: Props = $props();
</script>

<div
	class="border-base-300 bg-base-100/95 flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6"
>
	<div class="flex min-w-0 flex-wrap items-center gap-2">
		<TagsComponent
			{tagList}
			{selectedTagNames}
			{busy}
			onToggleTag={onToggleTag}
			onAddTag={onAddTag}
			onDeleteTag={onDeleteTag}
		/>
		<RepeatComponent {repeatInterval} {repeatOptions} disabled={busy} onChange={onRepeatChange} />
	</div>

	<div class="flex flex-wrap items-center justify-end gap-2">
		<DatePicker bind:value={scheduledLocal} disabled={busy} />
		<Button type="button" variant="secondary" disabled={busy} onclick={() => void onSaveDraft()}>
			Save as draft
		</Button>
		<Button
			type="button"
			variant="primary"
			disabled={busy || scheduleDisabled}
			onclick={() => void onSchedule()}
		>
			{primaryLabel}
		</Button>
	</div>
</div>
