<script lang="ts">
	import type { AppRole } from '$lib/area-admin';
	import { onMount } from 'svelte';
	import { toast } from '$lib/ui/sonner';
	import { adminRoleManagerPagePresenter } from '$lib/area-admin';
	import RoleOverviewTable from '$lib/ui/components/user/RoleOverviewTable.svelte';

	type Props = { data: { isSuperAdmin?: boolean } };

	let { data }: Props = $props();
	let isSuperAdmin = $derived(data.isSuperAdmin ?? false);

	let usersVm = $derived(adminRoleManagerPagePresenter.allUsersToManageVm);
	let showToastMessage = $derived(adminRoleManagerPagePresenter.showToastMessage);
	let toastMessage = $derived(adminRoleManagerPagePresenter.toastMessage);

	onMount(() => {
		adminRoleManagerPagePresenter.load();
	});

	$effect(() => {
		if (showToastMessage) {
			const msg = toastMessage;
			if (msg && (msg.includes('Error') || msg.includes('Failed'))) {
				toast.error(msg);
			} else {
				toast.success(msg || 'Updated');
			}
			adminRoleManagerPagePresenter.showToastMessage = false;
		}
	});

	function handleRoleAssigned(userId: string, role: AppRole) {
		adminRoleManagerPagePresenter.applyUserRoleAdd(userId, role);
	}

	function handleRoleRemoved(userId: string, role: AppRole) {
		adminRoleManagerPagePresenter.applyUserRoleRemove(userId, role);
	}
</script>

<div class="p-4 md:p-6">
	<div class="min-w-0">
		<h1 class="text-xl font-semibold text-base-content">
			Role manager</h1>
		<p class="text-sm text-base-content/70 mt-1">
			Manage user roles. Assign or remove editor and admin roles. Admin area.
		</p>
	</div>

	<div class="mt-4">
		<RoleOverviewTable
			usersVm={usersVm}
			isCurrentAdminSuperAdmin={isSuperAdmin}
			onRoleAssigned={handleRoleAssigned}
			onRoleRemoved={handleRoleRemoved}
		/>
	</div>
</div>
