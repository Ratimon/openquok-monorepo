<script lang="ts">
	import type { ListingTagViewModel } from '$lib/listings/GetListing.presenter.svelte';
	import type { ListingTagGroupProgrammerModel } from '$lib/listings/Listing.repository.svelte';
	import { listingTagFormSchema } from '$lib/listings/listing.types';
	import { upsertListingTagModalPresenter } from '$lib/listings';
	import { buildListingTagViewModelFromUpsert } from '$lib/listings/UpsertListingTagModal.presenter.svelte';

	import { icons } from '$data/icons';
	import { toast } from '$lib/ui/sonner';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { Checkbox } from '$lib/ui/checkbox';
	import { Textarea } from '$lib/ui/textarea';
	import { Input } from '$lib/ui/input';
	import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '$lib/ui/dialog';

	type ListingTagDraft = {
		name: string;
		slug: string;
		description: string;
		groupNames: string[];
	};

	type Props = {
		tag?: ListingTagViewModel;
		draft?: ListingTagDraft;
		allTagGroups: ListingTagGroupProgrammerModel[];
		buttonVariant?: import('$lib/ui/buttons/Button.svelte').ButtonVariant;
		buttonLabel?: string;
		onTagCreated?: (vm: ListingTagViewModel) => void | Promise<void>;
		onTagUpdated?: (vm: ListingTagViewModel) => void | Promise<void>;
	};

	let {
		tag,
		draft,
		allTagGroups,
		buttonVariant = 'primary',
		buttonLabel,
		onTagCreated,
		onTagUpdated
	}: Props = $props();

	let dialogOpen = $state(false);
	let submitting = $state(false);

	let name = $state('');
	let description = $state('');
	let selectedTagGroupIds = $state<string[]>([]);

	let sortedTagGroups = $derived(
		[...(allTagGroups ?? [])].sort((a, b) => a.name.localeCompare(b.name))
	);

	let fieldSuffix = $derived((tag?.id ?? draft?.slug ?? 'new').replace(/[^a-zA-Z0-9_-]/g, '-'));
	let nameFieldId = $derived(`listing-tag-name-${fieldSuffix}`);
	let descriptionFieldId = $derived(`listing-tag-description-${fieldSuffix}`);

	$effect(() => {
		if (!dialogOpen) return;
		name = tag?.name ?? draft?.name ?? '';
		description = tag?.description ?? draft?.description ?? '';
		if (tag?.tagGroups) {
			selectedTagGroupIds = tag.tagGroups.map((group) => group.id);
			return;
		}
		if (draft?.groupNames?.length) {
			const wanted = new Set(draft.groupNames.map((groupName) => groupName.toLowerCase()));
			selectedTagGroupIds = sortedTagGroups
				.filter((group) => wanted.has(group.name.toLowerCase()))
				.map((group) => group.id);
			return;
		}
		selectedTagGroupIds = [];
	});

	function isGroupSelected(groupId: string): boolean {
		return selectedTagGroupIds.includes(groupId);
	}

	function toggleTagGroup(groupId: string, checked: boolean) {
		if (checked) {
			if (!selectedTagGroupIds.includes(groupId)) {
				selectedTagGroupIds = [...selectedTagGroupIds, groupId];
			}
			return;
		}
		selectedTagGroupIds = selectedTagGroupIds.filter((id) => id !== groupId);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		const payload = {
			...(tag?.id ? { id: tag.id } : {}),
			name: name.trim(),
			description: description.trim() || null
		};

		const result = listingTagFormSchema.safeParse(payload);
		if (!result.success) {
			toast.error(result.error.issues.map((i) => i.message).join(' '));
			return;
		}

		submitting = true;
		try {
			const parsed = result.data;
			const tagGroupIds = [...selectedTagGroupIds];
			const upsertResult = tag?.id
				? await upsertListingTagModalPresenter.updateListingTag(
						{
							id: tag.id,
							name: parsed.name,
							description: parsed.description ?? null
						},
						tagGroupIds
					)
				: await upsertListingTagModalPresenter.createListingTag(
						{
							name: parsed.name,
							description: parsed.description ?? null
						},
						tagGroupIds
					);

			if (upsertResult.ok) {
				toast.success(tag?.id ? 'Tag updated.' : 'Tag created.');
				const id = upsertResult.id ?? tag?.id;
				if (!id) {
					toast.error('Missing tag id from server.');
					return;
				}
				const selectedGroups = sortedTagGroups.filter((group) => tagGroupIds.includes(group.id));
				const vm = buildListingTagViewModelFromUpsert({
					id,
					name: parsed.name,
					description: parsed.description ?? null,
					tagGroups: selectedGroups
				});
				if (tag?.id) {
					await onTagUpdated?.(vm);
				} else {
					await onTagCreated?.(vm);
				}
				dialogOpen = false;
			} else {
				toast.error(upsertResult.error ?? 'Failed to save tag.');
			}
		} catch (err) {
			console.error(err);
			toast.error('Failed to save tag.');
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
		{#if tag?.id}
			{buttonLabel ?? 'Edit'}
		{:else if buttonLabel}
			{buttonLabel}
		{:else}
			<span class="flex items-center gap-2">
				<AbstractIcon name={icons.Plus.name} width="16" height="16" focusable="false" />
				Add tag
			</span>
		{/if}
	</Button>

	<DialogContent class="sm:max-w-[425px]">
		<DialogHeader>
			<DialogTitle>{tag?.id ? 'Edit listing tag' : 'Create a new listing tag'}</DialogTitle>
			<DialogDescription>
				{tag?.id ? 'Update the tag name, description, and groups.' : 'Fill out the tag details.'}
			</DialogDescription>
		</DialogHeader>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<label for={nameFieldId} class="text-sm font-medium text-base-content/70">Name</label>
				<Input id={nameFieldId} bind:value={name} placeholder="Tag name" disabled={submitting} />
			</div>

			<div class="space-y-2">
				<label for={descriptionFieldId} class="text-sm font-medium text-base-content/70">Description</label>
				<Textarea
					id={descriptionFieldId}
					bind:value={description}
					rows={4}
					placeholder="Tag description"
					disabled={submitting}
				/>
			</div>

			{#if sortedTagGroups.length > 0}
				<div class="space-y-2">
					<p class="text-sm font-medium text-base-content/70">Tag groups</p>
					<div class="max-h-40 space-y-2 overflow-y-auto rounded-md border border-base-300 p-3">
						{#each sortedTagGroups as group (group.id)}
							<label class="flex cursor-pointer items-center gap-2 text-sm">
								<Checkbox
									checked={isGroupSelected(group.id)}
									onCheckedChange={(checked) => toggleTagGroup(group.id, checked === true)}
									disabled={submitting}
								/>
								<span>{group.name}</span>
							</label>
						{/each}
					</div>
				</div>
			{/if}

			<DialogFooter>
				<Button variant="ghost" type="button" onclick={() => (dialogOpen = false)} disabled={submitting}>
					Cancel
				</Button>
				<Button type="submit" disabled={submitting}>
					{#if submitting}
						<span class="flex items-center gap-2">
							<AbstractIcon name={icons.LoaderCircle.name} width="18" height="18" focusable="false" />
							Saving...
						</span>
					{:else}
						{tag?.id ? 'Update' : 'Create'}
					{/if}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
