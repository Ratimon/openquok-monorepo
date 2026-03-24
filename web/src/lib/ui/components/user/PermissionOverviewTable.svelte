<script lang="ts">
	import type { RoleViewModel } from '$lib/rbac/GetRole.presenter.svelte';
	import type { AppRole, AppPermission } from '$lib/rbac/rbac.types';
	import { ActionVerificationModalStatus } from '$lib/core/ActionVerificationModal.presenter.svelte';
	import { icons } from '$data/icon';
	import {
		assignPermissionToRolePresenter,
		removePermissionFromRolePresenter
	} from '$lib/rbac/index';
	import ActionVerificationModal from '$lib/ui/templates/ActionVerificationModal.svelte';
	import { CardContent } from '$lib/ui/card';
	import {
		Root as Select,
		Content as SelectContent,
		Item as SelectItem,
		Trigger as SelectTrigger
	} from '$lib/ui/select';

	type Props = {
		rolesVm: RoleViewModel[];
		allAvailablePermissions: AppPermission[];
		onRolePermissionAdded: (role: AppRole, permission: AppPermission) => void;
		onRolePermissionRemoved: (role: AppRole, permission: AppPermission) => void;
	};

	let {
		rolesVm,
		allAvailablePermissions,
		onRolePermissionAdded,
		onRolePermissionRemoved
	}: Props = $props();

	function formatRole(role: string): string {
		return role.charAt(0).toUpperCase() + role.slice(1);
	}

	let selectedRolePermission: { role: AppRole; permission: AppPermission } | null = $state(null);
	let modalOpen = $state(false);

	let selectedRolePermissionToRemove: { role: AppRole; permission: AppPermission } | null = $state(null);
	let removeModalOpen = $state(false);

	function handlePermissionSelection(role: AppRole, permission: AppPermission) {
		selectedRolePermission = { role, permission };
		modalOpen = true;
	}

	function handlePermissionRemovalSelection(role: AppRole, permission: AppPermission) {
		selectedRolePermissionToRemove = { role, permission };
		removeModalOpen = true;
	}

	function handleAssignModalSuccess() {
		if (
			selectedRolePermission &&
			assignPermissionToRolePresenter.status === ActionVerificationModalStatus.SUBMITTED
		) {
			onRolePermissionAdded(selectedRolePermission.role, selectedRolePermission.permission);
		}
		modalOpen = false;
		selectedRolePermission = null;
	}

	function handleRemoveModalSuccess() {
		if (
			selectedRolePermissionToRemove &&
			removePermissionFromRolePresenter.status === ActionVerificationModalStatus.SUBMITTED
		) {
			onRolePermissionRemoved(
				selectedRolePermissionToRemove.role,
				selectedRolePermissionToRemove.permission
			);
		}
		removeModalOpen = false;
		selectedRolePermissionToRemove = null;
	}

	function getAvailablePermissionsForRole(roleVm: RoleViewModel): AppPermission[] {
		return allAvailablePermissions.filter((p) => !roleVm.permissions.includes(p));
	}
</script>

<div>
	<CardContent>
		<div class="grid">
			<div class="mt-6 table w-full table-auto">
				<div class="table-header-group">
					<div class="table-row text-sm">
						<div
							class="table-cell h-10 border-b-2 border-base-300 px-2 text-left align-middle font-medium"
						>
							Role
						</div>
						<div
							class="table-cell h-10 border-b-2 border-base-300 px-2 text-left align-middle font-medium"
						>
							Current Permissions
						</div>
						<div
							class="hidden h-10 border-b-2 border-base-300 px-2 text-left align-middle font-medium sm:table-cell"
						>
							Permission Count
						</div>
						<div
							class="table-cell h-10 border-b-2 border-base-300 px-2 text-left align-middle font-medium"
						>
							Add Permission
						</div>
						<div
							class="table-cell h-10 border-b-2 border-base-300 px-2 text-left align-middle font-medium"
						>
							Remove Permission
						</div>
					</div>
				</div>

				<div class="table-row-group">
					{#each rolesVm as roleVm}
						<div class="table-row h-auto">
							<div
								class="table-cell content-center border-b-2 border-base-300 p-2 text-sm font-medium"
							>
								{formatRole(roleVm.role)}
							</div>

							<div class="table-cell content-center border-b-2 border-base-300 p-2 text-sm">
								{#if roleVm.permissions.length === 0}
									<span class="text-base-content/50">No Permissions</span>
								{:else}
									<div class="flex flex-wrap gap-2">
										{#each roleVm.permissions as permission}
											<span
												class="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
											>
												{permission}
											</span>
										{/each}
									</div>
								{/if}
							</div>

							<div
								class="hidden content-center border-b-2 border-base-300 p-2 align-middle text-sm sm:table-cell"
							>
								{roleVm.permissions.length}
							</div>

							<div class="table-cell content-center border-b-2 border-base-300 p-2 text-sm">
								{#if getAvailablePermissionsForRole(roleVm).length > 0}
									<Select
										type="single"
										value={undefined}
										onValueChange={(value: string | undefined) => {
											if (value) handlePermissionSelection(roleVm.role, value as AppPermission);
										}}
									>
										<SelectTrigger class="w-40 max-w-xs" size="sm">
											<span>Add Permission</span>
										</SelectTrigger>
										<SelectContent>
											{#each getAvailablePermissionsForRole(roleVm) as permission}
												<SelectItem value={permission}>
													{permission}
												</SelectItem>
											{/each}
										</SelectContent>
									</Select>
									{#if selectedRolePermission && selectedRolePermission.role === roleVm.role}
										<ActionVerificationModal
											data={selectedRolePermission}
											bind:open={modalOpen}
											executionFunction={assignPermissionToRolePresenter.execute}
											status={assignPermissionToRolePresenter.status}
											showToastMessage={assignPermissionToRolePresenter.showToastMessage}
											toastMessage={assignPermissionToRolePresenter.toastMessage}
											buttonIconName={icons.Plus.name}
											buttonText=""
											modalTitle="Add Permission"
											modalDescription={`Are you sure you want to add the permission "${selectedRolePermission.permission}" to the role "${formatRole(selectedRolePermission.role)}"?`}
											modalVerficationWithAnswer={true}
											modalVerificationAnswer="YES"
											onSuccess={handleAssignModalSuccess}
										/>
									{/if}
								{:else}
									<span class="text-base-content/50">—</span>
								{/if}
							</div>

							<div class="table-cell content-center border-b-2 border-base-300 p-2 text-sm">
								{#if roleVm.permissions.length > 0}
									<Select
										type="single"
										value={undefined}
										onValueChange={(value: string | undefined) => {
											if (value) handlePermissionRemovalSelection(roleVm.role, value as AppPermission);
										}}
									>
										<SelectTrigger class="w-40 max-w-xs" size="sm">
											<span>Remove Permission</span>
										</SelectTrigger>
										<SelectContent>
											{#each roleVm.permissions as permission}
												<SelectItem value={permission}>
													{permission}
												</SelectItem>
											{/each}
										</SelectContent>
									</Select>
									{#if selectedRolePermissionToRemove &&
										selectedRolePermissionToRemove.role === roleVm.role}
										<ActionVerificationModal
											data={selectedRolePermissionToRemove}
											bind:open={removeModalOpen}
											executionFunction={removePermissionFromRolePresenter.execute}
											status={removePermissionFromRolePresenter.status}
											showToastMessage={removePermissionFromRolePresenter.showToastMessage}
											toastMessage={removePermissionFromRolePresenter.toastMessage}
											buttonIconName={icons.X2.name}
											buttonText=""
											modalTitle="Remove Permission"
											modalDescription={`Are you sure you want to remove the permission "${selectedRolePermissionToRemove.permission}" from the role "${formatRole(selectedRolePermissionToRemove.role)}"?`}
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
</div>
