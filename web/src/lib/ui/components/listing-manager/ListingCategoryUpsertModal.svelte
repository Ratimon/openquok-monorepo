<script lang="ts">
	import type { ListingCategoryViewModel } from '$lib/listings/GetListing.presenter.svelte';
	import { listingCategoryFormSchema } from '$lib/listings/listing.types';
	import { upsertListingCategoryModalPresenter } from '$lib/listings';
	import { buildListingCategoryViewModelFromUpsert } from '$lib/listings/utils';
	import { createSortedCategoryChoices } from '$lib/listings/utils/parentPathCreator';

	import { icons } from '$data/icons';
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
		category?: ListingCategoryViewModel;
		allCategories: ListingCategoryViewModel[];
		buttonVariant?: import('$lib/ui/buttons/Button.svelte').ButtonVariant;
		onCategoryCreated?: (vm: ListingCategoryViewModel) => void | Promise<void>;
		onCategoryUpdated?: (vm: ListingCategoryViewModel) => void | Promise<void>;
	};

	const NO_PARENT_VALUE = 'NO_PARENT';

	let {
		category,
		allCategories,
		buttonVariant = 'primary',
		onCategoryCreated,
		onCategoryUpdated
	}: Props = $props();

	let dialogOpen = $state(false);
	let submitting = $state(false);

	let name = $state('');
	let description = $state('');
	let parentIdValue = $state<string>(NO_PARENT_VALUE);

	let categoryChoices = $derived(
		createSortedCategoryChoices((allCategories ?? []).filter((c) => c.id !== category?.id))
	);

	$effect(() => {
		if (!dialogOpen) return;
		name = category?.name ?? '';
		description = category?.description ?? '';
		parentIdValue = category?.parentId ? category.parentId : NO_PARENT_VALUE;
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();

		const payload = {
			...(category?.id ? { id: category.id } : {}),
			name: name.trim(),
			description: description.trim() || null,
			parent_path: '/',
			...(parentIdValue !== NO_PARENT_VALUE ? { parent_id: parentIdValue } : {})
		};

		const result = listingCategoryFormSchema.safeParse(payload);
		if (!result.success) {
			toast.error(result.error.issues.map((i) => i.message).join(' '));
			return;
		}

		submitting = true;
		try {
			const parsed = result.data;
			const upsertResult = category?.id
				? await upsertListingCategoryModalPresenter.updateListingCategory({
						id: category.id,
						name: parsed.name,
						description: parsed.description ?? null,
						parent_path: parsed.parent_path ?? '/',
						...(parsed.parent_id ? { parent_id: parsed.parent_id } : {})
					})
				: await upsertListingCategoryModalPresenter.createListingCategory({
						name: parsed.name,
						description: parsed.description ?? null,
						parent_path: parsed.parent_path ?? '/',
						...(parsed.parent_id ? { parent_id: parsed.parent_id } : {})
					});

			if (upsertResult.ok) {
				toast.success(category?.id ? 'Category updated.' : 'Category created.');
				const id = upsertResult.id ?? category?.id;
				if (!id) {
					toast.error('Missing category id from server.');
					return;
				}
				const vm = buildListingCategoryViewModelFromUpsert({
					id,
					name: parsed.name,
					description: parsed.description ?? null,
					parentId: parsed.parent_id ?? null,
					allCategories
				});
				if (category?.id) {
					await onCategoryUpdated?.(vm);
				} else {
					await onCategoryCreated?.(vm);
				}
				dialogOpen = false;
			} else {
				toast.error(upsertResult.error ?? 'Failed to save category.');
			}
		} catch (err) {
			console.error(err);
			toast.error('Failed to save category.');
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
		{#if category?.id}
			Edit
		{:else}
			<span class="flex items-center gap-2">
				<AbstractIcon name={icons.Plus.name} width="16" height="16" focusable="false" />
				Add category
			</span>
		{/if}
	</Button>

	<DialogContent class="sm:max-w-[425px]">
		<DialogHeader>
			<DialogTitle>{category?.id ? 'Edit listing category' : 'Create a new listing category'}</DialogTitle>
			<DialogDescription>
				{category?.id
					? 'Update the category name, description, and optional parent.'
					: 'Fill out the category details. Parent is optional.'}
			</DialogDescription>
		</DialogHeader>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<label for="category-name" class="text-sm font-medium text-base-content/70">Name</label>
				<Input id="category-name" bind:value={name} placeholder="Category name" disabled={submitting} />
			</div>

			<div class="space-y-2">
				<label for="category-description" class="text-sm font-medium text-base-content/70">
					Description
				</label>
				<Textarea
					id="category-description"
					bind:value={description}
					rows={4}
					placeholder="Category description"
					disabled={submitting}
				/>
			</div>

			<div class="space-y-2">
				<label for="category-parent" class="text-sm font-medium text-base-content/70">Parent</label>
				<Select
					type="single"
					value={parentIdValue}
					onValueChange={(value: string | undefined) => {
						parentIdValue = value ?? NO_PARENT_VALUE;
					}}
				>
					<SelectTrigger id="category-parent" class="w-full max-w-md">
						<span class="truncate">
							{#if parentIdValue === NO_PARENT_VALUE}
								No parent
							{:else}
								{categoryChoices.find((c) => c.value === parentIdValue)?.label ?? 'Select parent'}
							{/if}
						</span>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={NO_PARENT_VALUE} label="No parent" />
						{#each categoryChoices as choice (choice.value)}
							<SelectItem value={choice.value} label={choice.label} />
						{/each}
					</SelectContent>
				</Select>
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
						{category?.id ? 'Update' : 'Create'}
					{/if}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
