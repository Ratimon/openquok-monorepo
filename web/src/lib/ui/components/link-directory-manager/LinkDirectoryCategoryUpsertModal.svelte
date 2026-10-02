<script lang="ts">
	import type { LinkDirectoryCategoryDto } from '$lib/link-directory/link-directory.types';
	import { linkDirectoryCategoryFormSchema } from '$lib/link-directory/link-directory-admin.types';
	import { linkDirectoryRepository } from '$lib/link-directory/index';

	import { icons } from '$data/icons';
	import { toast } from '$lib/ui/sonner';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { Textarea } from '$lib/ui/textarea';
	import { Input } from '$lib/ui/input';
	import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '$lib/ui/dialog';

	type Props = {
		category?: LinkDirectoryCategoryDto;
		buttonVariant?: import('$lib/ui/buttons/Button.svelte').ButtonVariant;
		onCategoryCreated?: (vm: LinkDirectoryCategoryDto) => void | Promise<void>;
		onCategoryUpdated?: (vm: LinkDirectoryCategoryDto) => void | Promise<void>;
	};

	let { category, buttonVariant = 'primary', onCategoryCreated, onCategoryUpdated }: Props = $props();

	let dialogOpen = $state(false);
	let submitting = $state(false);
	let name = $state('');
	let slug = $state('');
	let headline = $state('');
	let description = $state('');
	let sortOrder = $state('0');

	$effect(() => {
		if (!dialogOpen) return;
		name = category?.name ?? '';
		slug = category?.slug ?? '';
		headline = category?.headline ?? '';
		description = category?.description ?? '';
		sortOrder = String(category?.sortOrder ?? 0);
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		const parsedSort = Number.parseInt(sortOrder, 10);
		const payload = {
			...(category?.id ? { id: category.id } : {}),
			name: name.trim(),
			slug: slug.trim() || undefined,
			headline: headline.trim() || null,
			description: description.trim() || null,
			sort_order: Number.isFinite(parsedSort) ? parsedSort : 0
		};
		const result = linkDirectoryCategoryFormSchema.safeParse(payload);
		if (!result.success) {
			toast.error(result.error.issues.map((i) => i.message).join(' '));
			return;
		}
		submitting = true;
		try {
			const upsertResult = category?.id
				? await linkDirectoryRepository.updateCategory(category.id, result.data)
				: await linkDirectoryRepository.createCategory(result.data);
			if (!upsertResult.ok || !upsertResult.id) {
				toast.error(upsertResult.error ?? 'Failed to save category.');
				return;
			}
			toast.success(category?.id ? 'Category updated.' : 'Category created.');
			const vm: LinkDirectoryCategoryDto = {
				id: upsertResult.id,
				name: result.data.name,
				slug: result.data.slug ?? (slug.trim() || result.data.name.toLowerCase().replace(/\s+/g, '-')),
				headline: result.data.headline ?? null,
				description: result.data.description ?? null,
				sortOrder: result.data.sort_order ?? 0,
				openquokChannelsHubPath: category?.openquokChannelsHubPath ?? '/channels'
			};
			if (category?.id) await onCategoryUpdated?.(vm);
			else await onCategoryCreated?.(vm);
			dialogOpen = false;
		} finally {
			submitting = false;
		}
	}
</script>

<Button variant={buttonVariant} size="sm" onclick={() => (dialogOpen = true)}>
	<AbstractIcon name={icons.Plus.name} width="16" height="16" class="mr-1" />
	{category ? 'Edit category' : 'Add category'}
</Button>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="max-w-lg">
		<DialogHeader>
			<DialogTitle>{category ? 'Edit category' : 'New category'}</DialogTitle>
			<DialogDescription>Curated navigation group for the build-backlinks hub.</DialogDescription>
		</DialogHeader>
		<form class="space-y-3" onsubmit={handleSubmit}>
			<label class="form-control w-full">
				<span class="label-text text-sm">Name</span>
				<Input bind:value={name} required />
			</label>
			<label class="form-control w-full">
				<span class="label-text text-sm">Slug (optional)</span>
				<Input bind:value={slug} />
			</label>
			<label class="form-control w-full">
				<span class="label-text text-sm">Headline</span>
				<Input bind:value={headline} />
			</label>
			<label class="form-control w-full">
				<span class="label-text text-sm">Description</span>
				<Textarea bind:value={description} rows={3} />
			</label>
			<label class="form-control w-full">
				<span class="label-text text-sm">Sort order</span>
				<Input type="number" bind:value={sortOrder} />
			</label>
			<DialogFooter>
				<Button type="button" variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
				<Button type="submit" variant="primary" disabled={submitting}>
					{submitting ? 'Saving…' : 'Save'}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
