<script lang="ts">
	import type { ListingTagGroupProgrammerModel } from '$lib/listings/Listing.repository.svelte';
	import { listingTagGroupFormSchema } from '$lib/listings/listing.types';
	import { upsertListingTagGroupModalPresenter } from '$lib/listings';
	import { buildListingTagGroupViewModelFromUpsert } from '$lib/listings/UpsertListingTagGroupModal.presenter.svelte';

	import { icons } from '$data/icons';
	import { toast } from '$lib/ui/sonner';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { Input } from '$lib/ui/input';
	import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '$lib/ui/dialog';

	type Props = {
		tagGroup?: ListingTagGroupProgrammerModel;
		buttonVariant?: import('$lib/ui/buttons/Button.svelte').ButtonVariant;
		onTagGroupCreated?: (vm: ListingTagGroupProgrammerModel) => void | Promise<void>;
		onTagGroupUpdated?: (vm: ListingTagGroupProgrammerModel) => void | Promise<void>;
	};

	let { tagGroup, buttonVariant = 'primary', onTagGroupCreated, onTagGroupUpdated }: Props = $props();

	let dialogOpen = $state(false);
	let submitting = $state(false);

	let name = $state('');

	$effect(() => {
		if (!dialogOpen) return;
		name = tagGroup?.name ?? '';
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();

		const payload = {
			...(tagGroup?.id ? { id: tagGroup.id } : {}),
			name: name.trim()
		};

		const result = listingTagGroupFormSchema.safeParse(payload);
		if (!result.success) {
			toast.error(result.error.issues.map((i) => i.message).join(' '));
			return;
		}

		submitting = true;
		try {
			const parsed = result.data;
			const upsertResult = tagGroup?.id
				? await upsertListingTagGroupModalPresenter.updateListingTagGroup({
						id: tagGroup.id,
						name: parsed.name
					})
				: await upsertListingTagGroupModalPresenter.createListingTagGroup({
						name: parsed.name
					});

			if (upsertResult.ok) {
				toast.success(tagGroup?.id ? 'Tag group updated.' : 'Tag group created.');
				const id = upsertResult.id ?? tagGroup?.id;
				if (!id) {
					toast.error('Missing tag group id from server.');
					return;
				}
				const vm = buildListingTagGroupViewModelFromUpsert({
					id,
					name: parsed.name
				});
				if (tagGroup?.id) {
					await onTagGroupUpdated?.(vm);
				} else {
					await onTagGroupCreated?.(vm);
				}
				dialogOpen = false;
			} else {
				toast.error(upsertResult.error ?? 'Failed to save tag group.');
			}
		} catch (err) {
			console.error(err);
			toast.error('Failed to save tag group.');
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
		{#if tagGroup?.id}
			Edit
		{:else}
			<span class="flex items-center gap-2">
				<AbstractIcon name={icons.Plus.name} width="16" height="16" focusable="false" />
				Add tag group
			</span>
		{/if}
	</Button>

	<DialogContent class="sm:max-w-[425px]">
		<DialogHeader>
			<DialogTitle>{tagGroup?.id ? 'Edit tag group' : 'Create a new tag group'}</DialogTitle>
			<DialogDescription>
				{tagGroup?.id ? 'Update the group name.' : 'Tag groups organize filters on the Extensions Hub.'}
			</DialogDescription>
		</DialogHeader>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<label for="tag-group-name" class="text-sm font-medium text-base-content/70">Name</label>
				<Input id="tag-group-name" bind:value={name} placeholder="Group name" disabled={submitting} />
			</div>

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
						{tagGroup?.id ? 'Update' : 'Create'}
					{/if}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
