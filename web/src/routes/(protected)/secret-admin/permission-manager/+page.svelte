<script lang="ts">
	import type { AppRole, AppPermission } from '$lib/area-admin';
	import { onMount } from 'svelte';
	import toast from 'svelte-hot-french-toast';
	import { adminPermissionManagerPagePresenter } from '$lib/area-admin';
	import PermissionOverviewTable from '$lib/ui/components/user/PermissionOverviewTable.svelte';

	let rolesVm = $derived(adminPermissionManagerPagePresenter.allRolesToManageVm);
	let allAvailablePermissions = $derived(adminPermissionManagerPagePresenter.allAvailablePermissions);
	let showToastMessage = $derived(adminPermissionManagerPagePresenter.showToastMessage);
	let toastMessage = $derived(adminPermissionManagerPagePresenter.toastMessage);

	onMount(() => {
		adminPermissionManagerPagePresenter.load();
	});

	$effect(() => {
		if (showToastMessage) {
			const msg = toastMessage;
			if (msg && (msg.includes('Error') || msg.includes('Failed'))) {
				toast.error(msg);
			} else {
				toast.success(msg || 'Updated');
			}
			adminPermissionManagerPagePresenter.showToastMessage = false;
		}
	});

	function handleRolePermissionAdded(role: AppRole, permission: AppPermission) {
		// API + toast are handled by the modal; we only update the VM here.
		adminPermissionManagerPagePresenter.applyRolePermissionAdd(role, permission);
	}

	function handleRolePermissionRemoved(role: AppRole, permission: AppPermission) {
		// API + toast are handled by the modal; we only update the VM here.
		adminPermissionManagerPagePresenter.applyRolePermissionRemove(role, permission);
	}
</script>

<div class="p-4 md:p-6">
	<div class="min-w-0">
		<h1 class="text-xl font-semibold text-base-content">
			Permission manager</h1>
		<p class="text-sm text-base-content/70 mt-1">
			Manage role permissions. Assign or remove permissions from editor and admin roles. Super admin only.
		</p>
	</div>

	<div class="mt-4">
		<PermissionOverviewTable
			rolesVm={rolesVm}
			allAvailablePermissions={allAvailablePermissions}
			onRolePermissionAdded={handleRolePermissionAdded}
			onRolePermissionRemoved={handleRolePermissionRemoved}
		/>
	</div>
</div>
