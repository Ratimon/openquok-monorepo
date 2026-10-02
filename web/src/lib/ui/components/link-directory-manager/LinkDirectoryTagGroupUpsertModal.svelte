<script lang="ts">
	import type { LinkDirectoryTagGroupDto } from '$lib/link-directory/link-directory-admin.types';
	import { linkDirectoryTagGroupFormSchema } from '$lib/link-directory/link-directory-admin.types';
	import { linkDirectoryRepository } from '$lib/link-directory/index';

	import { toast } from '$lib/ui/sonner';

	import Button from '$lib/ui/buttons/Button.svelte';
	import { Input } from '$lib/ui/input';
	import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '$lib/ui/dialog';

	type Props = {
		tagGroup?: LinkDirectoryTagGroupDto;
		buttonVariant?: import('$lib/ui/buttons/Button.svelte').ButtonVariant;
		onTagGroupCreated?: (vm: LinkDirectoryTagGroupDto) => void | Promise<void>;
		onTagGroupUpdated?: (vm: LinkDirectoryTagGroupDto) => void | Promise<void>;
	};

	let { tagGroup, buttonVariant = 'primary', onTagGroupCreated, onTagGroupUpdated }: Props = $props();

	let dialogOpen = $state(false);
	let submitting = $state(false);
	let name = $state('');
	let sortOrder = $state('0');

	$effect(() => {
		if (!dialogOpen) return;
		name = tagGroup?.name ?? '';
		sortOrder = String(tagGroup?.sortOrder ?? 0);
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		const parsedSort = Number.parseInt(sortOrder, 10);
		const payload = { name: name.trim(), sort_order: Number.isFinite(parsedSort) ? parsedSort : 0 };
		const result = linkDirectoryTagGroupFormSchema.safeParse(payload);
		if (!result.success) {
			toast.error(result.error.issues.map((i) => i.message).join(' '));
			return;
		}
		submitting = true;
		try {
			const upsertResult = tagGroup?.id
				? await linkDirectoryRepository.updateTagGroup(tagGroup.id, result.data)
				: await linkDirectoryRepository.createTagGroup(result.data);
			if (!upsertResult.ok || !upsertResult.id) {
				toast.error(upsertResult.error ?? 'Failed to save tag group.');
				return;
			}
			const vm: LinkDirectoryTagGroupDto = {
				id: upsertResult.id,
				name: result.data.name,
				sortOrder: result.data.sort_order ?? 0
			};
			if (tagGroup?.id) await onTagGroupUpdated?.(vm);
			else await onTagGroupCreated?.(vm);
			dialogOpen = false;
		} finally {
			submitting = false;
		}
	}
</script>

<Button variant={buttonVariant} size="sm" onclick={() => (dialogOpen = true)}>
	{tagGroup ? 'Edit group' : 'Add tag group'}
</Button>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="max-w-md">
		<DialogHeader>
			<DialogTitle>{tagGroup ? 'Edit tag group' : 'New tag group'}</DialogTitle>
		</DialogHeader>
		<form class="space-y-3" onsubmit={handleSubmit}>
			<label class="form-control w-full">
				<span class="label-text text-sm">Name</span>
				<Input bind:value={name} required />
			</label>
			<label class="form-control w-full">
				<span class="label-text text-sm">Sort order</span>
				<Input type="number" bind:value={sortOrder} />
			</label>
			<DialogFooter>
				<Button type="button" variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
				<Button type="submit" variant="primary" disabled={submitting}>Save</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
