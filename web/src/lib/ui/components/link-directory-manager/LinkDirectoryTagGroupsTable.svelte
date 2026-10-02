<script lang="ts">
	import type { LinkDirectoryTagGroupDto } from '$lib/link-directory/link-directory-admin.types';
	import { linkDirectoryRepository } from '$lib/link-directory/index';

	import { icons } from '$data/icons';
	import ActionVerificationModal from '$lib/ui/modals/ActionVerificationModal.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import {
		Root as Table,
		Body as TableBody,
		Cell as TableCell,
		Head as TableHead,
		Header as TableHeader,
		Row as TableRow
	} from '$lib/ui/table';

	import LinkDirectoryTagGroupUpsertModal from '$lib/ui/components/link-directory-manager/LinkDirectoryTagGroupUpsertModal.svelte';

	type Props = {
		tagGroupsVm: LinkDirectoryTagGroupDto[];
		onTagGroupCreated: (vm: LinkDirectoryTagGroupDto) => void | Promise<void>;
		onTagGroupUpdated: (vm: LinkDirectoryTagGroupDto) => void | Promise<void>;
		onTagGroupDeleted: (group: LinkDirectoryTagGroupDto) => void | Promise<void>;
	};

	let { tagGroupsVm, onTagGroupCreated, onTagGroupUpdated, onTagGroupDeleted }: Props = $props();

	let deleteModalOpen = $state(false);
	let selectedToDelete = $state<LinkDirectoryTagGroupDto | null>(null);

</script>

<div class="mt-4">
	<LinkDirectoryTagGroupUpsertModal buttonVariant="outline" onTagGroupCreated={onTagGroupCreated} />
	<Table containerClass="mt-4 w-full border border-base-300 rounded-xl bg-base-100">
		<TableHeader>
			<TableRow>
				<TableHead>Name</TableHead>
				<TableHead>Sort</TableHead>
				<TableHead class="w-36">Actions</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			{#each tagGroupsVm as group (group.id)}
				<TableRow>
					<TableCell>{group.name}</TableCell>
					<TableCell>{group.sortOrder}</TableCell>
					<TableCell>
						<div class="flex gap-2">
							<LinkDirectoryTagGroupUpsertModal
								tagGroup={group}
								buttonVariant="ghost"
								onTagGroupUpdated={onTagGroupUpdated}
							/>
							<Button
								variant="ghost"
								size="sm"
								onclick={() => {
									selectedToDelete = group;
									deleteModalOpen = true;
								}}>Delete</Button
							>
						</div>
					</TableCell>
				</TableRow>
			{/each}
		</TableBody>
	</Table>
</div>

{#if selectedToDelete}
	<ActionVerificationModal
		data={{ tagGroupId: selectedToDelete.id }}
		bind:open={deleteModalOpen}
		executionFunction={async () => {
			const result = await linkDirectoryRepository.deleteTagGroup(selectedToDelete!.id);
			if (result.ok) {
				await onTagGroupDeleted(selectedToDelete!);
				selectedToDelete = null;
				return { success: true, message: 'Tag group deleted.' };
			}
			return { success: false, message: result.error ?? 'Failed to delete tag group.' };
		}}
		buttonIconName={icons.Trash.name}
		buttonText=""
		modalTitle="Delete tag group"
		modalDescription={`Remove “${selectedToDelete.name}”.`}
		modalVerficationWithAnswer={true}
		modalVerificationAnswer="YES"
	/>
{/if}
