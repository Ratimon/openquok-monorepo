<script lang="ts">
	import type { ListingTagViewModel } from '$lib/listings/GetListing.presenter.svelte';
	import { listingTagFormSchema } from '$lib/listings/listing.types';
	import { upsertListingTagModalPresenter } from '$lib/listings';
	import { buildListingTagViewModelFromUpsert } from '$lib/listings/utils';

	import { icons } from '$data/icons';
	import { toast } from '$lib/ui/sonner';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { Textarea } from '$lib/ui/textarea';
	import { Input } from '$lib/ui/input';
	import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '$lib/ui/dialog';

	type Props = {
		tag?: ListingTagViewModel;
		buttonVariant?: import('$lib/ui/buttons/Button.svelte').ButtonVariant;
		onTagCreated?: (vm: ListingTagViewModel) => void | Promise<void>;
		onTagUpdated?: (vm: ListingTagViewModel) => void | Promise<void>;
	};

	let { tag, buttonVariant = 'primary', onTagCreated, onTagUpdated }: Props = $props();

	let dialogOpen = $state(false);
	let submitting = $state(false);

	let name = $state('');
	let description = $state('');

	$effect(() => {
		if (!dialogOpen) return;
		name = tag?.name ?? '';
		description = tag?.description ?? '';
	});

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
			const upsertResult = tag?.id
				? await upsertListingTagModalPresenter.updateListingTag({
						id: tag.id,
						name: parsed.name,
						description: parsed.description ?? null
					})
				: await upsertListingTagModalPresenter.createListingTag({
						name: parsed.name,
						description: parsed.description ?? null
					});

			if (upsertResult.ok) {
				toast.success(tag?.id ? 'Tag updated.' : 'Tag created.');
				const id = upsertResult.id ?? tag?.id;
				if (!id) {
					toast.error('Missing tag id from server.');
					return;
				}
				const vm = buildListingTagViewModelFromUpsert({
					id,
					name: parsed.name,
					description: parsed.description ?? null
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
			Edit
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
				{tag?.id ? 'Update the tag name and description.' : 'Fill out the tag details.'}
			</DialogDescription>
		</DialogHeader>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<label for="tag-name" class="text-sm font-medium text-base-content/70">Name</label>
				<Input id="tag-name" bind:value={name} placeholder="Tag name" disabled={submitting} />
			</div>

			<div class="space-y-2">
				<label for="tag-description" class="text-sm font-medium text-base-content/70">Description</label>
				<Textarea
					id="tag-description"
					bind:value={description}
					rows={4}
					placeholder="Tag description"
					disabled={submitting}
				/>
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
						{tag?.id ? 'Update' : 'Create'}
					{/if}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
