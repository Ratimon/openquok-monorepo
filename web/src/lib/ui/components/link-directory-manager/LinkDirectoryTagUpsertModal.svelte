<script lang="ts">
	import type { LinkDirectoryTagDto } from '$lib/link-directory/link-directory.types';
	import type { LinkDirectoryTagGroupDto } from '$lib/link-directory/link-directory-admin.types';
	import { linkDirectoryTagFormSchema } from '$lib/link-directory/link-directory-admin.types';
	import { linkDirectoryRepository } from '$lib/link-directory/index';

	import { toast } from '$lib/ui/sonner';

	import Button from '$lib/ui/buttons/Button.svelte';
	import { Textarea } from '$lib/ui/textarea';
	import { Input } from '$lib/ui/input';
	import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '$lib/ui/dialog';

	type Props = {
		tag?: LinkDirectoryTagDto;
		tagGroups: LinkDirectoryTagGroupDto[];
		buttonVariant?: import('$lib/ui/buttons/Button.svelte').ButtonVariant;
		onTagCreated?: (vm: LinkDirectoryTagDto) => void | Promise<void>;
		onTagUpdated?: (vm: LinkDirectoryTagDto) => void | Promise<void>;
	};

	let { tag, tagGroups, buttonVariant = 'primary', onTagCreated, onTagUpdated }: Props = $props();

	let dialogOpen = $state(false);
	let submitting = $state(false);
	let name = $state('');
	let slug = $state('');
	let headline = $state('');
	let description = $state('');
	let selectedGroupIds = $state<string[]>([]);

	$effect(() => {
		if (!dialogOpen) return;
		name = tag?.name ?? '';
		slug = tag?.slug ?? '';
		headline = tag?.headline ?? '';
		description = tag?.description ?? '';
		selectedGroupIds = tag?.groups?.map((g) => g.id) ?? [];
	});

	function toggleGroup(groupId: string) {
		if (selectedGroupIds.includes(groupId)) {
			selectedGroupIds = selectedGroupIds.filter((id) => id !== groupId);
		} else {
			selectedGroupIds = [...selectedGroupIds, groupId];
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		const payload = {
			...(tag?.id ? { id: tag.id } : {}),
			name: name.trim(),
			slug: slug.trim() || undefined,
			headline: headline.trim() || null,
			description: description.trim() || null,
			tagGroupIds: selectedGroupIds
		};
		const result = linkDirectoryTagFormSchema.safeParse(payload);
		if (!result.success) {
			toast.error(result.error.issues.map((i) => i.message).join(' '));
			return;
		}
		submitting = true;
		try {
			const upsertResult = tag?.id
				? await linkDirectoryRepository.updateTag(tag.id, result.data)
				: await linkDirectoryRepository.createTag(result.data);
			if (!upsertResult.ok || !upsertResult.id) {
				toast.error(upsertResult.error ?? 'Failed to save tag.');
				return;
			}
			const vm: LinkDirectoryTagDto = {
				id: upsertResult.id,
				name: result.data.name,
				slug: result.data.slug ?? (slug.trim() || result.data.name.toLowerCase().replace(/\s+/g, '-')),
				headline: result.data.headline ?? null,
				description: result.data.description ?? null,
				groups: tagGroups
					.filter((g) => selectedGroupIds.includes(g.id))
					.map((g) => ({ id: g.id, name: g.name, sortOrder: g.sortOrder }))
			};
			if (tag?.id) await onTagUpdated?.(vm);
			else await onTagCreated?.(vm);
			dialogOpen = false;
		} finally {
			submitting = false;
		}
	}
</script>

<Button variant={buttonVariant} size="sm" onclick={() => (dialogOpen = true)}>
	{tag ? 'Edit tag' : 'Add tag'}
</Button>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="max-w-lg">
		<DialogHeader>
			<DialogTitle>{tag ? 'Edit tag' : 'New tag'}</DialogTitle>
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
				<Textarea bind:value={description} rows={2} />
			</label>
			{#if tagGroups.length > 0}
				<div class="space-y-1">
					<p class="text-sm font-medium">Tag groups</p>
					{#each tagGroups as group (group.id)}
						<label class="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								class="checkbox checkbox-sm"
								checked={selectedGroupIds.includes(group.id)}
								onchange={() => toggleGroup(group.id)}
							/>
							{group.name}
						</label>
					{/each}
				</div>
			{/if}
			<DialogFooter>
				<Button type="button" variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
				<Button type="submit" variant="primary" disabled={submitting}>Save</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
