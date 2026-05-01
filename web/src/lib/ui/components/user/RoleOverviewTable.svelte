<script lang="ts">
	import type { ExtendedFullUserViewModel } from '$lib/user-management';
	import type { AppRole } from '$lib/rbac/rbac.types';
	import { ActionVerificationModalStatus } from '$lib/core/ActionVerificationModal.presenter.svelte';
	import { icons } from '$data/icons';
	import { assignRolePresenter, removeRolePresenter } from '$lib/rbac/index';
	import { createPagination } from '$lib/ui/helpers/createPagination.svelte';
	import ActionVerificationModal from '$lib/ui/templates/ActionVerificationModal.svelte';
	import { CardContent, CardFooter } from '$lib/ui/card';
	import FormattedISODate from '$lib/ui/components/FormattedISODate.svelte';
	import { Pagination } from '$lib/ui/pagination';
	import {
		Root as Select,
		Content as SelectContent,
		Item as SelectItem,
		Trigger as SelectTrigger
	} from '$lib/ui/select';

	type Props = {
		usersVm: ExtendedFullUserViewModel[];
		isCurrentAdminSuperAdmin?: boolean;
		onRoleAssigned: (userId: string, role: AppRole) => void;
		onRoleRemoved: (userId: string, role: AppRole) => void;
	};

	let {
		usersVm,
		isCurrentAdminSuperAdmin = false,
		onRoleAssigned,
		onRoleRemoved
	}: Props = $props();

	let usersWithoutSuperAdmin = $derived(usersVm.filter((u) => !u.isSuperAdmin));

	let availableRoles: AppRole[] = $derived(isCurrentAdminSuperAdmin ? ['editor', 'admin'] : ['editor']);

	let pagination = $derived(
		createPagination({
			initialItemsPerPage: 10,
			initialData: usersWithoutSuperAdmin,
			searchField: 'email'
		})
	);

	let {
		currentData,
		currentPage,
		totalPages,
		totalFilteredItems,
		itemsPerPage,
		paginateFrontFF,
		paginateBackFF,
		setItemsPerPage,
		setCurrentPage
	} = $derived(pagination);

	let selectedUserRole: { userId: string; role: AppRole } | null = $state(null);
	let modalOpen = $state(false);

	let selectedUserRoleToRemove: { userId: string; role: AppRole } | null = $state(null);
	let removeModalOpen = $state(false);

	function formatRole(role: string): string {
		return role.charAt(0).toUpperCase() + role.slice(1);
	}

	function handleRoleSelection(userId: string, role: AppRole) {
		selectedUserRole = { userId, role };
		modalOpen = true;
	}

	function handleRoleRemovalSelection(userId: string, role: AppRole) {
		selectedUserRoleToRemove = { userId, role };
		removeModalOpen = true;
	}

	function handleAssignModalSuccess() {
		if (
			selectedUserRole &&
			assignRolePresenter.status === ActionVerificationModalStatus.SUBMITTED
		) {
			onRoleAssigned(selectedUserRole.userId, selectedUserRole.role);
		}
		modalOpen = false;
		selectedUserRole = null;
	}

	function handleRemoveModalSuccess() {
		if (
			selectedUserRoleToRemove &&
			removeRolePresenter.status === ActionVerificationModalStatus.SUBMITTED
		) {
			onRoleRemoved(selectedUserRoleToRemove.userId, selectedUserRoleToRemove.role);
		}
		removeModalOpen = false;
		selectedUserRoleToRemove = null;
	}
</script>

<div>
	<div class="flex w-full justify-end">
		<input
			type="text"
			class="border-input bg-transparent focus-visible:ring-ring h-9 w-60 rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
			placeholder="Search Email..."
			bind:value={pagination.searchTerm}
		/>
	</div>

	<CardContent>
		<div class="grid">
			<div class="mt-6 table w-full table-auto">
				<div class="table-header-group">
					<div class="table-row text-sm">
						<div
							class="table-cell h-10 border-b-2 border-base-300 px-2 text-left align-middle font-medium"
						>
							Email
						</div>
						<div
							class="table-cell h-10 border-b-2 border-base-300 px-2 text-left align-middle font-medium"
						>
							Current Roles
						</div>
						<div
							class="hidden h-10 border-b-2 border-base-300 px-2 text-left align-middle font-medium sm:table-cell"
						>
							Created
						</div>
						<div
							class="table-cell h-10 border-b-2 border-base-300 px-2 text-left align-middle font-medium"
						>
							Assign Role
						</div>
						<div
							class="table-cell h-10 border-b-2 border-base-300 px-2 text-left align-middle font-medium"
						>
							Remove Role
						</div>
					</div>
				</div>

				<div class="table-row-group">
					{#each currentData as user}
						<div class="table-row h-auto">
							<div
								class="table-cell content-center overflow-hidden border-b-2 border-base-300 p-2 text-sm"
							>
								{user.email || '—'}
							</div>

							<div class="table-cell content-center border-b-2 border-base-300 p-2 text-sm">
								{#if user.roles.length === 0}
									<span class="text-base-content/50">No roles</span>
								{:else}
									{user.roles.map((r) => formatRole(r)).join(', ')}
								{/if}
							</div>

							<div
								class="hidden content-center border-b-2 border-base-300 p-2 align-middle text-sm sm:table-cell"
							>
								<FormattedISODate date={user.createdAt} />
							</div>

							<div class="table-cell content-center border-b-2 border-base-300 p-2 text-sm">
								<Select
									type="single"
									value={undefined}
									onValueChange={(value: string | undefined) => {
										if (value) handleRoleSelection(user.id, value as AppRole);
									}}
								>
									<SelectTrigger class="w-36 max-w-xs" size="sm">
										<span>Assign Role</span>
									</SelectTrigger>
									<SelectContent>
										{#each availableRoles as role}
											<SelectItem value={role}>
												{formatRole(role)}
											</SelectItem>
										{/each}
									</SelectContent>
								</Select>
								{#if selectedUserRole && selectedUserRole.userId === user.id}
									<ActionVerificationModal
										data={selectedUserRole}
										bind:open={modalOpen}
										executionFunction={assignRolePresenter.execute}
										status={assignRolePresenter.status}
										showToastMessage={assignRolePresenter.showToastMessage}
										toastMessage={assignRolePresenter.toastMessage}
										buttonIconName={icons.UserCheck.name}
										buttonText=""
										modalTitle="Assign Role"
										modalDescription={`Are you sure you want to assign the role "${formatRole(selectedUserRole.role)}" to ${user.email}?`}
										modalVerficationWithAnswer={true}
										modalVerificationAnswer="YES"
										onSuccess={handleAssignModalSuccess}
									/>
								{/if}
							</div>

							<div class="table-cell content-center border-b-2 border-base-300 p-2 text-sm">
								{#if user.roles.length > 0}
									<Select
										type="single"
										value={undefined}
										onValueChange={(value: string | undefined) => {
											if (value) handleRoleRemovalSelection(user.id, value as AppRole);
										}}
									>
										<SelectTrigger class="w-36 max-w-xs" size="sm">
											<span>Remove Role</span>
										</SelectTrigger>
										<SelectContent>
											{#each user.roles as role}
												<SelectItem value={role}>
													{formatRole(role)}
												</SelectItem>
											{/each}
										</SelectContent>
									</Select>
									{#if selectedUserRoleToRemove && selectedUserRoleToRemove.userId === user.id}
										<ActionVerificationModal
											data={selectedUserRoleToRemove}
											bind:open={removeModalOpen}
											executionFunction={removeRolePresenter.execute}
											status={removeRolePresenter.status}
											showToastMessage={removeRolePresenter.showToastMessage}
											toastMessage={removeRolePresenter.toastMessage}
											buttonIconName={icons.X2.name}
											buttonText=""
											modalTitle="Remove Role"
											modalDescription={`Are you sure you want to remove the role "${formatRole(selectedUserRoleToRemove.role)}" from ${user.email}?`}
											modalVerficationWithAnswer={true}
											modalVerificationAnswer="YES"
											onSuccess={handleRemoveModalSuccess}
										/>
									{/if}
								{:else}
									<span class="text-base-content/50">—</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</CardContent>

	<CardFooter>
		<Pagination
			itemsPerPage={itemsPerPage}
			totalItems={totalFilteredItems}
			currentPage={currentPage}
			totalPages={totalPages}
			setItemsPerPage={setItemsPerPage}
			setCurrentPage={setCurrentPage}
			paginateFrontFF={paginateFrontFF}
			paginateBackFF={paginateBackFF}
			nameOfItems="users"
			pageSizeOptions={[5, 10, 25, 50]}
		/>
	</CardFooter>
</div>
