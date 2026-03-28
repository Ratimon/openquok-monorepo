<script lang="ts">
	import type { BlogTopicViewModel } from '$lib/blog/GetBlog.presenter.svelte';
	import { blogTopicFormSchema } from '$lib/blog/blog.types';
	import { upsertBlogTopicModalPresenter } from '$lib/blog';
	import { buildBlogTopicViewModelFromUpsert } from '$lib/blog/utils';
	import { createSortedTopicChoices } from '$lib/blog/utils/parentPathCreator';

	import { icons } from '$data/icon';
	import { toast } from '$lib/ui/sonner';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { Textarea } from '$lib/ui/textarea';
	import { Input } from '$lib/ui/input';
	import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '$lib/ui/dialog';
	import {
		Root as Select,
		Trigger as SelectTrigger,
		Content as SelectContent,
		Item as SelectItem
	} from '$lib/ui/select';

	type Props = {
		topic?: BlogTopicViewModel;
		allTopics: BlogTopicViewModel[];
		buttonVariant?: import('$lib/ui/buttons/Button.svelte').ButtonVariant;
		onTopicCreated?: (vm: BlogTopicViewModel) => void | Promise<void>;
		onTopicUpdated?: (vm: BlogTopicViewModel) => void | Promise<void>;
	};

	const NO_PARENT_VALUE = 'NO_PARENT';

	let {
		topic,
		allTopics,
		buttonVariant = 'primary',
		onTopicCreated,
		onTopicUpdated
	}: Props = $props();

	let dialogOpen = $state(false);
	let submitting = $state(false);

	let name = $state('');
	let description = $state('');
	let parentIdValue = $state<string>(NO_PARENT_VALUE);

	let topicChoices = $derived(
		createSortedTopicChoices((allTopics ?? []).filter((t) => t.id !== topic?.id))
	);

	$effect(() => {
		if (!dialogOpen) return;
		name = topic?.name ?? '';
		description = topic?.description ?? '';
		parentIdValue = topic?.parentId ? topic.parentId : NO_PARENT_VALUE;
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();

		const payload = {
			...(topic?.id ? { id: topic.id } : {}),
			name: name.trim(),
			description: description.trim(),
			...(parentIdValue !== NO_PARENT_VALUE ? { parent_id: parentIdValue } : {})
		};

		const result = blogTopicFormSchema.safeParse(payload);
		if (!result.success) {
			toast.error(result.error.issues.map((i) => i.message).join(' '));
			return;
		}

		submitting = true;
		try {
			const parsed = result.data;
			const upsertResult = topic?.id
				? await upsertBlogTopicModalPresenter.updateBlogTopic(
						{
							id: topic.id,
							name: parsed.name,
							description: parsed.description,
							...(parsed.parent_id ? { parent_id: parsed.parent_id } : {})
						}
					)
				: await upsertBlogTopicModalPresenter.createBlogTopic({
						name: parsed.name,
						description: parsed.description,
						...(parsed.parent_id ? { parent_id: parsed.parent_id } : {})
					});

			if (upsertResult.success) {
				toast.success(
					upsertResult.message ?? (topic?.id ? 'Topic updated.' : 'Topic created.')
				);
				const id = upsertResult.id ?? topic?.id;
				if (!id) {
					toast.error('Missing topic id from server.');
					return;
				}
				const vm = buildBlogTopicViewModelFromUpsert({
					id,
					name: parsed.name,
					description: parsed.description,
					parentId: parsed.parent_id ?? null,
					allTopics
				});
				if (topic?.id) {
					await onTopicUpdated?.(vm);
				} else {
					await onTopicCreated?.(vm);
				}
				dialogOpen = false;
			} else {
				toast.error(upsertResult.message ?? 'Failed to save topic.');
			}
		} catch (err) {
			console.error(err);
			toast.error('Failed to save topic.');
		} finally {
			submitting = false;
		}
	}
</script>

<Dialog bind:open={dialogOpen}>
	<Button
		variant={buttonVariant}
		size="sm"
		type="button"
		onclick={() => (dialogOpen = true)}
		disabled={submitting}
	>
		{#if topic?.id}
			Edit
		{:else}
			<span class="flex items-center gap-2">
				<AbstractIcon name={icons.Plus.name} width="16" height="16" focusable="false" />
				Add topic
			</span>
		{/if}
	</Button>

	<DialogContent class="sm:max-w-[425px]">
		<DialogHeader>
			<DialogTitle>{topic?.id ? 'Edit blog topic' : 'Create a new blog topic'}</DialogTitle>
			<DialogDescription>
				{topic?.id
					? 'Update the topic name, description, and optional parent.'
					: 'Fill out the topic details. Parent is optional.'}
			</DialogDescription>
		</DialogHeader>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<label for="topic-name" class="text-sm font-medium text-base-content/70">
					Name</label>
				<Input id="topic-name" bind:value={name} placeholder="Topic name" disabled={submitting} />
			</div>

			<div class="space-y-2">
				<label for="topic-description" class="text-sm font-medium text-base-content/70">
					Description</label>
				<Textarea
					id="topic-description"
					bind:value={description}
					rows={4}
					placeholder="Topic description"
					disabled={submitting}
				/>
			</div>

			<div class="space-y-2">
				<label for="topic-parent" class="text-sm font-medium text-base-content/70">
					Parent</label>
				<Select
					type="single"
					value={parentIdValue}
					onValueChange={(value: string | undefined) => {
						parentIdValue = value ?? NO_PARENT_VALUE;
					}}
				>
					<SelectTrigger id="topic-parent" class="w-full max-w-md">
						<span class="truncate">
							{#if parentIdValue === NO_PARENT_VALUE}
								No parent
							{:else}
								{topicChoices.find((c) => c.value === parentIdValue)?.label ?? 'Select parent'}
							{/if}
						</span>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={NO_PARENT_VALUE} label="No parent" />
						{#each topicChoices as choice (choice.value)}
							<SelectItem value={choice.value} label={choice.label} />
						{/each}
					</SelectContent>
				</Select>
			</div>

			<DialogFooter>
				<Button variant="outline" type="button" onclick={() => (dialogOpen = false)} disabled={submitting}>
					Cancel
				</Button>
				<Button type="submit" disabled={submitting}>
					{#if submitting}
						<span class="flex items-center gap-2">
							<AbstractIcon name={icons.LoaderCircle.name} width="18" height="18" focusable="false" />
							Saving...
						</span>
					{:else}
						{topic?.id ? 'Update' : 'Create'}
					{/if}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
