<script lang="ts">
	import {
		workspaceCreateFormSchema,
		workspaceInviteMemberFormSchema,
		workspaceUpdateFormSchema,
		type PendingInviteViewModel,
		type SentInviteViewModel,
		type TeamMemberViewModel,
		type WorkspaceCardViewModel
	} from '$lib/settings';
	import { createForm } from '@tanstack/svelte-form';
	import { toast } from '$lib/ui/sonner';

	import { getRootPathAccount } from '$lib/area-protected';
	import { firstBillingGatePresenter } from '$lib/billing';
	import { route, url } from '$lib/utils/path';

	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import HomeAccountNoticeBanner from '$lib/ui/components/home/HomeAccountNoticeBanner.svelte';
	import TeamMembersLimitUpgradeModal from '$lib/ui/components/workspaces/TeamMembersLimitUpgradeModal.svelte';
	import WorkspaceLimitUpgradeModal from '$lib/ui/components/workspaces/WorkspaceLimitUpgradeModal.svelte';
	import UpdateWorkspaceModal from '$lib/ui/components/settings/UpdateWorkspaceModal.svelte';
	import DeleteModal from '$lib/ui/modals/DeleteModal.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import * as DropdownMenu from '$lib/ui/dropdown-menu/index.js';
	import * as Field from '$lib/ui/field';

	type Props = {
		workspacesVm: WorkspaceCardViewModel[];
		currentWorkspaceId: string | null;
		teamMembersVm: TeamMemberViewModel[];
		sentInvitesVm: SentInviteViewModel[];
		pendingInvitesVm: PendingInviteViewModel[];
		canInviteInCurrentWorkspace: boolean;
		canManageSentInvitesInCurrentWorkspace: boolean;
		loadingWorkspaces: boolean;
		createSubmitting: boolean;
		updateSubmitting: boolean;
		leavingWorkspace: boolean;
		deletingWorkspace: boolean;
		loadingTeam: boolean;
		inviting: boolean;
		loadingPendingInvites: boolean;
		acceptingInviteId: string | null;
		cancelingSentInviteId: string | null;
		onSwitchWorkspace: (workspaceId: string) => void;
		onCreateWorkspace: (name: string) => Promise<{ success: boolean; message: string }>;
		onUpdateWorkspace: (
			workspaceId: string,
			params: { name: string; description: string | null }
		) => Promise<{ success: boolean; message: string }>;
		onLeaveWorkspace: (workspaceId: string) => Promise<{ success: boolean; message: string }>;
		onDeleteWorkspace: (workspaceId: string) => Promise<{ success: boolean; message: string }>;
		onInviteMember: (params: {
			email: string;
			role: 'user' | 'admin';
			sendEmail: boolean;
		}) => Promise<{ success: boolean; message: string }>;
		onAcceptPendingInvite: (inviteId: string) => Promise<{ success: boolean; message: string }>;
		onCancelSentInvite: (inviteId: string) => Promise<{ success: boolean; message: string }>;
		onCopyWorkspaceId: (workspaceId: string) => void;
	};

	let {
		workspacesVm,
		currentWorkspaceId,
		teamMembersVm,
		sentInvitesVm,
		pendingInvitesVm,
		canInviteInCurrentWorkspace,
		canManageSentInvitesInCurrentWorkspace,
		loadingWorkspaces,
		createSubmitting,
		updateSubmitting,
		leavingWorkspace,
		deletingWorkspace,
		loadingTeam,
		inviting,
		loadingPendingInvites,
		acceptingInviteId,
		cancelingSentInviteId,
		onSwitchWorkspace,
		onCreateWorkspace,
		onUpdateWorkspace,
		onLeaveWorkspace,
		onDeleteWorkspace,
		onInviteMember,
		onAcceptPendingInvite,
		onCancelSentInvite,
		onCopyWorkspaceId
	}: Props = $props();

	const defaultNewWorkspaceName = 'My Workspace';

	const accountBillingHref = $derived(url(`${route(getRootPathAccount())}/billing`));

	const teamMembersUsed = $derived(
		firstBillingGatePresenter.pricingVm?.currentVm?.teamMembers?.used ?? 0
	);
	const teamMembersLimit = $derived(
		firstBillingGatePresenter.pricingVm?.currentVm?.teamMembers?.limit ?? null
	);
	const teamSeatsUsageLabel = $derived(
		teamMembersLimit != null ? `${teamMembersUsed}/${teamMembersLimit}` : null
	);
	const showTeamSeatsLimitSection = $derived(teamMembersLimit != null);
	const isTeamSeatsLimitFull = $derived(
		teamMembersLimit != null && teamMembersUsed >= teamMembersLimit
	);
	const showTeamSeatsUpgradeCta = $derived(isTeamSeatsLimitFull && Boolean(accountBillingHref));

	const workspaceCountUsed = $derived(workspacesVm.length);
	const workspaceCountLimit = $derived.by(() => {
		const cap = firstBillingGatePresenter.pricingVm?.currentVm?.limits?.workspaces ?? null;
		return cap != null && cap >= 1 ? cap : null;
	});
	const workspacesUsageLabel = $derived(
		workspaceCountLimit != null ? `${workspaceCountUsed}/${workspaceCountLimit}` : null
	);
	const showWorkspacesLimitSection = $derived(workspaceCountLimit != null);
	const isWorkspaceLimitFull = $derived(
		workspaceCountLimit != null && workspaceCountUsed >= workspaceCountLimit
	);
	const showWorkspacesUpgradeCta = $derived(isWorkspaceLimitFull && Boolean(accountBillingHref));

	let createDialogOpen = $state(false);
	let inviteDialogOpen = $state(false);
	let editWorkspaceModalOpen = $state(false);
	let editingWorkspaceId = $state<string | null>(null);
	let teamMembersUpgradeDialogOpen = $state(false);
	let workspaceUpgradeDialogOpen = $state(false);
	let deleteWorkspaceConfirmOpen = $state(false);
	let deleteWorkspaceTarget = $state<WorkspaceCardViewModel | null>(null);

	function openTeamMembersUpgradeDialog() {
		teamMembersUpgradeDialogOpen = true;
	}

	function openWorkspaceUpgradeDialog() {
		workspaceUpgradeDialogOpen = true;
	}

	function adjustTeamMembersUsed(delta: number) {
		if (!delta) return;
		const pricingVm = firstBillingGatePresenter.pricingVm;
		if (!pricingVm?.currentVm?.teamMembers || pricingVm.currentVm.teamMembers.limit == null) return;

		const nextUsed = Math.max(0, pricingVm.currentVm.teamMembers.used + delta);
		firstBillingGatePresenter.pricingVm = {
			plansVm: pricingVm.plansVm,
			billingEnabled: pricingVm.billingEnabled,
			currentVm: {
				...pricingVm.currentVm,
				teamMembers: { ...pricingVm.currentVm.teamMembers, used: nextUsed }
			}
		};
	}

	const createWorkspaceForm = createForm(() => ({
		defaultValues: {
			workspaceName: defaultNewWorkspaceName
		},
		validators: {
			onChange: workspaceCreateFormSchema
		},
		onSubmit: async ({ value }) => {
			const result = await onCreateWorkspace(value.workspaceName);
			if (result.success) {
				createDialogOpen = false;
			} else {
				toast.error(result.message);
			}
		}
	}));

	const updateWorkspaceForm = createForm(() => ({
		defaultValues: {
			workspaceName: '',
			workspaceDescription: ''
		},
		validators: {
			onChange: workspaceUpdateFormSchema
		},
		onSubmit: async ({ value }) => {
			const workspaceId = editingWorkspaceId;
			if (!workspaceId) return;
			const description = value.workspaceDescription.trim();
			const result = await onUpdateWorkspace(workspaceId, {
				name: value.workspaceName,
				description: description === '' ? null : description
			});
			if (result.success) {
				editWorkspaceModalOpen = false;
				editingWorkspaceId = null;
			} else {
				toast.error(result.message);
			}
		}
	}));

	const inviteMemberForm = createForm(() => ({
		defaultValues: {
			email: '',
			role: 'user' as 'user' | 'admin',
			sendEmail: true
		},
		validators: {
			onChange: workspaceInviteMemberFormSchema
		},
		onSubmit: async ({ value }) => {
			if (!currentWorkspaceId) return;
			const result = await onInviteMember({
				email: value.email,
				role: value.role,
				sendEmail: value.sendEmail
			});
			if (result.success) {
				inviteDialogOpen = false;
				adjustTeamMembersUsed(1);
			} else {
				toast.error(result.message);
			}
		}
	}));

	function canEditWorkspace(role: 'user' | 'admin' | 'owner'): boolean {
		return role === 'admin' || role === 'owner';
	}

	function roleDisplayLabel(role: 'user' | 'admin' | 'owner'): string {
		switch (role) {
			case 'owner':
				return 'Owner';
			case 'admin':
				return 'Admin';
			default:
				return 'Member';
		}
	}

	function formatInviteExpiry(expiresAt: string): string {
		try {
			const d = new Date(expiresAt);
			if (Number.isNaN(d.getTime())) return 'Expired';
			const now = new Date();
			if (d <= now) return 'Expired';
			const diffMs = d.getTime() - now.getTime();
			const diffM = Math.floor(diffMs / 60000);
			if (diffM < 60) return `Expires in ${diffM} min`;
			const diffH = Math.floor(diffM / 60);
			return `Expires in ${diffH} hour${diffH !== 1 ? 's' : ''}`;
		} catch {
			return '';
		}
	}

	function openCreateDialog() {
		if (isWorkspaceLimitFull) {
			openWorkspaceUpgradeDialog();
			return;
		}
		createWorkspaceForm.setFieldValue('workspaceName', defaultNewWorkspaceName);
		createDialogOpen = true;
	}

	function openInviteDialog() {
		if (!canInviteInCurrentWorkspace) return;
		if (isTeamSeatsLimitFull) {
			openTeamMembersUpgradeDialog();
			return;
		}
		inviteMemberForm.setFieldValue('email', '');
		inviteMemberForm.setFieldValue('role', 'user');
		inviteMemberForm.setFieldValue('sendEmail', true);
		inviteDialogOpen = true;
	}

	function handleCreateFormSubmit(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		if (
			createWorkspaceForm.state.errors &&
			createWorkspaceForm.state.errors.length > 0 &&
			createWorkspaceForm.state.errors[0]
		) {
			Object.entries(
				createWorkspaceForm.state.errors[0] as Record<string, Array<{ message?: string }>>
			).forEach(([, errors]) => {
				errors.forEach((err) => toast.error(err?.message ?? 'Invalid field'));
			});
			return;
		}
		createWorkspaceForm.handleSubmit();
	}

	function handleInviteFormSubmit(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		if (
			inviteMemberForm.state.errors &&
			inviteMemberForm.state.errors.length > 0 &&
			inviteMemberForm.state.errors[0]
		) {
			Object.entries(
				inviteMemberForm.state.errors[0] as Record<string, Array<{ message?: string }>>
			).forEach(([, errors]) => {
				errors.forEach((err) => toast.error(err?.message ?? 'Invalid field'));
			});
			return;
		}
		inviteMemberForm.handleSubmit();
	}

	async function handleAcceptPendingInvite(inviteId: string) {
		await onAcceptPendingInvite(inviteId);
	}

	async function handleCancelSentInvite(inviteId: string) {
		const result = await onCancelSentInvite(inviteId);
		if (result.success) {
			adjustTeamMembersUsed(-1);
		}
	}

	function openEditWorkspaceModal(org: WorkspaceCardViewModel) {
		if (!canEditWorkspace(org.workspaceRole)) return;
		editingWorkspaceId = org.id;
		updateWorkspaceForm.setFieldValue('workspaceName', org.name);
		updateWorkspaceForm.setFieldValue('workspaceDescription', org.description ?? '');
		editWorkspaceModalOpen = true;
	}

	function handleUpdateWorkspaceFormSubmit(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		if (
			updateWorkspaceForm.state.errors &&
			updateWorkspaceForm.state.errors.length > 0 &&
			updateWorkspaceForm.state.errors[0]
		) {
			Object.entries(
				updateWorkspaceForm.state.errors[0] as Record<string, Array<{ message?: string }>>
			).forEach(([, errors]) => {
				errors.forEach((err) => toast.error(err?.message ?? 'Invalid field'));
			});
			return;
		}
		updateWorkspaceForm.handleSubmit();
	}

	function copyWorkspaceId(workspaceId: string) {
		onCopyWorkspaceId(workspaceId);
	}

	const workspaceMutationBusy = $derived(leavingWorkspace || deletingWorkspace);

	async function leaveWorkspace(workspaceId: string) {
		const result = await onLeaveWorkspace(workspaceId);
		if (!result.success) toast.error(result.message);
	}

	function openDeleteWorkspaceConfirm(org: WorkspaceCardViewModel) {
		if (org.workspaceRole !== 'owner') return;
		deleteWorkspaceTarget = org;
		deleteWorkspaceConfirmOpen = true;
	}

	function closeDeleteWorkspaceConfirm() {
		if (deletingWorkspace) return;
		deleteWorkspaceConfirmOpen = false;
		deleteWorkspaceTarget = null;
	}

	async function confirmDeleteWorkspace() {
		const target = deleteWorkspaceTarget;
		if (!target) return;
		const result = await onDeleteWorkspace(target.id);
		if (result.success) {
			deleteWorkspaceConfirmOpen = false;
			deleteWorkspaceTarget = null;
		} else {
			toast.error(result.message);
		}
	}

	function switchWorkspace(org: WorkspaceCardViewModel) {
		onSwitchWorkspace(org.id);
		toast.success(`Switched to ${org.name}`);
	}
</script>

<section
	class="rounded-lg border border-base-300 bg-base-200 shadow-sm overflow-hidden"
	aria-labelledby="workspaces-heading"
>
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6">
		<h2 id="workspaces-heading" class="text-lg font-semibold text-base-content">
			All Workspaces
			{#if workspacesUsageLabel}
				<span class={isWorkspaceLimitFull ? 'text-warning' : 'text-base-content/70'}>
					({workspacesUsageLabel})
				</span>
			{/if}
		</h2>
		<Button
			class="gap-1.5"
			variant={isWorkspaceLimitFull ? 'warning' : 'primary'}
			type="button"
			onclick={openCreateDialog}
			disabled={loadingWorkspaces || createSubmitting}
		>
			{#if isWorkspaceLimitFull}
				<AbstractIcon
					name={icons.Lock.name}
					class="size-4"
					width="16"
					height="16"
					focusable="false"
				/>
				Workspace limit reached
			{:else}
				Create New Workspace
			{/if}
		</Button>
	</div>

	{#if showWorkspacesLimitSection && workspacesUsageLabel}
		<div class="border-t border-base-300 px-6 pb-4 pt-4">
			<HomeAccountNoticeBanner
				iconName={isWorkspaceLimitFull ? icons.Sparkles.name : icons.Info.name}
				tone={isWorkspaceLimitFull ? 'upgrade' : 'neutral'}
				dismissible={false}
			>
				<p class="text-base-content/90">
					{#if isWorkspaceLimitFull}
						You have reached your plan workspace limit
						<span class="font-medium tabular-nums">({workspacesUsageLabel})</span>. Upgrade to
						create more workspaces for another team or brand.
					{:else}
						Workspaces on your plan:
						<span class="font-medium tabular-nums">{workspacesUsageLabel}</span>
						used across your account.
					{/if}
				</p>
				{#snippet actions()}
					{#if showWorkspacesUpgradeCta}
						<Button href={accountBillingHref} variant="secondary" size="sm" class="gap-1.5">
							<AbstractIcon name={icons.ArrowUp.name} class="size-4" width="16" height="16" />
							Upgrade plan
						</Button>
					{/if}
				{/snippet}
			</HomeAccountNoticeBanner>
		</div>
	{/if}

	<div class="border-t border-base-300 px-6 pb-6 pt-4 space-y-4">
		{#if loadingWorkspaces}
			<p class="text-sm text-base-content/70">
				Loading workspaces…
			</p>
		{:else if workspacesVm.length === 0}
			<p class="text-sm text-base-content/70">
				You have no workspaces yet. Create one to get started.
			</p>
		{:else}
			{#each workspacesVm as org (org.id)}
				<div
					class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-base-300 bg-base-100 p-4"
				>
					<div class="min-w-0">
						<h3 class="text-sm font-semibold text-base-content">
							{org.name}
						</h3>
						<p class="mt-1 text-sm text-base-content/70">
							{org.subtitle}
						</p>
						{#if org.description}
							<p class="mt-0.5 line-clamp-2 text-xs text-base-content/60">
								{org.description}
							</p>
						{/if}
					</div>
					<div class="flex items-center gap-2 shrink-0">
						{#if currentWorkspaceId === org.id}
							<span
								class="rounded-full border border-base-300 bg-base-300 px-4 py-2 text-sm font-medium text-base-content/60 select-none"
								aria-current="true"
							>
								Current Workspace
							</span>
						{:else}
							<Button
								type="button"
								variant="ghost"
								onclick={() => switchWorkspace(org)}
								disabled={workspaceMutationBusy}
							>
								Switch
							</Button>
						{/if}
						<DropdownMenu.Root>
							<DropdownMenu.Trigger
								class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-base-300 bg-base-100 text-sm font-medium text-base-content shadow-sm outline-none hover:bg-base-content/10 focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50"
								aria-label="Workspace options"
								disabled={workspaceMutationBusy}
							>
								<AbstractIcon name={icons.Cog.name} width="16" height="16" focusable="false" />
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="end" sideOffset={6} class="min-w-[180px]">
								{#if canEditWorkspace(org.workspaceRole)}
									<DropdownMenu.Item
										disabled={updateSubmitting}
										onclick={() => openEditWorkspaceModal(org)}
									>
										<AbstractIcon name={icons.Pencil.name} width="16" height="16" focusable="false" />
										Edit workspace
									</DropdownMenu.Item>
								{/if}
								<DropdownMenu.Item onclick={() => copyWorkspaceId(org.id)}>
									<AbstractIcon name={icons.Copy.name} width="16" height="16" focusable="false" />
									Copy Workspace ID
								</DropdownMenu.Item>
								{#if org.workspaceRole === 'owner'}
									<DropdownMenu.Item
										variant="destructive"
										disabled={workspaceMutationBusy}
										onclick={() => openDeleteWorkspaceConfirm(org)}
									>
										<AbstractIcon name={icons.Trash.name} width="16" height="16" focusable="false" />
										Delete workspace
									</DropdownMenu.Item>
								{:else}
									<DropdownMenu.Item
										variant="destructive"
										disabled={workspaceMutationBusy}
										onclick={() => leaveWorkspace(org.id)}
									>
										Leave Workspace
									</DropdownMenu.Item>
								{/if}
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</section>

<!-- Current Workspace's team -->
{#if currentWorkspaceId}
	<section
		class="mt-6 rounded-lg border border-base-300 bg-base-200 p-6 shadow-sm"
		aria-labelledby="team-members-heading"
	>
		<h2 id="team-members-heading" class="text-lg font-semibold text-base-content">
			Team Members
		</h2>
		<p class="mt-1 text-sm text-base-content/70">
			Invite your assistant or team member to manage your account
		</p>

		{#if showTeamSeatsLimitSection && teamSeatsUsageLabel}
			<div class="mt-4">
				<HomeAccountNoticeBanner
					iconName={isTeamSeatsLimitFull ? icons.Sparkles.name : icons.Info.name}
					tone={isTeamSeatsLimitFull ? 'upgrade' : 'neutral'}
					dismissible={false}
				>
					<p class="text-base-content/90">
						{#if isTeamSeatsLimitFull}
							This workspace has reached its team member limit
							<span class="font-medium tabular-nums">({teamSeatsUsageLabel})</span>. Upgrade to
							invite more collaborators, or remove members and pending invites to free seats.
						{:else}
							Workspace team seats:
							<span class="font-medium tabular-nums">{teamSeatsUsageLabel}</span>
							used (members and pending invites count toward your plan limit).
						{/if}
					</p>
					{#snippet actions()}
						{#if showTeamSeatsUpgradeCta}
							<Button href={accountBillingHref} variant="secondary" size="sm" class="gap-1.5">
								<AbstractIcon name={icons.ArrowUp.name} class="size-4" width="16" height="16" />
								Upgrade plan
							</Button>
						{/if}
					{/snippet}
				</HomeAccountNoticeBanner>
			</div>
		{/if}

		<div class="mt-4 rounded-lg border border-base-300 bg-base-100 p-4 space-y-4">
			{#if loadingTeam}
				<p class="text-sm text-base-content/70">
					Loading team…
				</p>
			{:else if teamMembersVm.length === 0 && sentInvitesVm.length === 0}
				<p class="text-sm text-base-content/70">
					No members yet.
				</p>
			{:else}
				{#each teamMembersVm as member (member.id)}
					<div class="flex items-center justify-between gap-4">
						<div class="min-w-0">
							<p class="text-sm font-medium text-base-content">
								{member.displayName}
							</p>
							{#if member.email}
								<p class="text-xs text-base-content/70 truncate">
									{member.email}
								</p>
							{/if}
						</div>
						<span class="shrink-0 text-sm text-base-content/70">
							{roleDisplayLabel(member.workspaceRole)}
						</span>
					</div>
				{/each}
			{/if}

			{#if canManageSentInvitesInCurrentWorkspace && sentInvitesVm.length > 0}
				<div class="space-y-3 border-t border-base-300 pt-4">
					<h3 class="text-sm font-medium text-base-content">
						Pending invitations
					</h3>
					{#each sentInvitesVm as invite (invite.id)}
						<div class="flex items-center justify-between gap-4">
							<div class="min-w-0">
								<p class="text-sm font-medium text-base-content truncate">
									{invite.email}
								</p>
								<p class="text-xs text-base-content/70">
									Invited · {roleDisplayLabel(invite.workspaceRole)}
									{#if formatInviteExpiry(invite.expiresAt)}
										<span class="ml-1">· {formatInviteExpiry(invite.expiresAt)}</span>
									{/if}
								</p>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								class="shrink-0 text-error hover:text-error"
								onclick={() => handleCancelSentInvite(invite.id)}
								disabled={cancelingSentInviteId !== null}
							>
								{cancelingSentInviteId === invite.id ? 'Cancelling…' : 'Cancel'}
							</Button>
						</div>
					{/each}
				</div>
			{/if}

			{#if canInviteInCurrentWorkspace}
				<Button
					class="gap-1.5"
					variant={isTeamSeatsLimitFull ? 'warning' : 'primary'}
					type="button"
					onclick={openInviteDialog}
					disabled={loadingTeam || inviting}
				>
					{#if isTeamSeatsLimitFull}
						<AbstractIcon
							name={icons.Lock.name}
							class="size-4"
							width="16"
							height="16"
							focusable="false"
						/>
						Member limit reached
					{:else}
						{inviting ? 'Sending…' : 'Add another member'}
					{/if}
				</Button>
			{:else}
				<p class="text-xs text-base-content/60">
					Only workspace admins can invite new members.
				</p>
			{/if}
		</div>
	</section>
{/if}

<!-- Workspace Invites -->
<section
	class="mt-6 rounded-lg border border-base-300 bg-base-200 p-6 shadow-sm"
	aria-labelledby="workspace-invites-heading"
>
	<h2 id="workspace-invites-heading" class="text-lg font-semibold text-base-content">
		Workspace Invites
	</h2>
	<p class="mt-1 text-sm text-base-content/70">
		Invitations sent to you to join a workspace. Accept to become a member.
	</p>
	<div class="mt-4 rounded-lg border border-base-300 bg-base-100 p-4 space-y-3">
		{#if loadingPendingInvites}
			<p class="text-sm text-base-content/70">
				Loading invites…
			</p>
		{:else if pendingInvitesVm.length === 0}
			<p class="text-sm text-base-content/80">
				You have no pending workspace invites.
			</p>
		{:else}
			{#each pendingInvitesVm as invite (invite.id)}
				<div
					class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-base-300 bg-base-200 px-3 py-2"
				>
					<div class="min-w-0">
						<p class="text-sm font-medium text-base-content">
							{invite.organizationName}
						</p>
						<p class="text-xs text-base-content/70">
							{roleDisplayLabel(invite.role as 'user' | 'admin' | 'owner')}
							{#if formatInviteExpiry(invite.expiresAt)}
								<span class="ml-2">· {formatInviteExpiry(invite.expiresAt)}</span>
							{/if}
						</p>
					</div>
					<Button
						type="button"
						size="sm"
						onclick={() => handleAcceptPendingInvite(invite.id)}
						disabled={acceptingInviteId !== null}
					>
						{acceptingInviteId === invite.id ? 'Accepting…' : 'Accept'}
					</Button>
				</div>
			{/each}
		{/if}
	</div>
</section>

<!-- Create new workspace dialog -->
<Dialog.Root bind:open={createDialogOpen}>
	<Dialog.Content>
		<form
			id="create-workspace-form"
			method="dialog"
			onsubmit={handleCreateFormSubmit}
			class="space-y-4"
		>
			<Dialog.Header>
				<Dialog.Title>
					Create new workspace
				</Dialog.Title>
				<Dialog.Description>
					Before proceeding, please note:
				</Dialog.Description>
			</Dialog.Header>
			<div
				class="rounded-lg border border-base-300 bg-base-200 p-4 text-sm text-base-content/90 space-y-2"
			>
				<ul class="list-disc list-inside space-y-1">
					<li>
						This workspace will have its own member list and roles (e.g. admin, member). You can invite people from the workspace settings after it's created.
					</li>
					<li>
						Data and settings are scoped to this workspace and are not shared with other workspaces you belong to.
					</li>
				</ul>
			</div>
			<createWorkspaceForm.Field name="workspaceName">
				{#snippet children(field)}
					<div>
						<Field.Label field={field} for="create-workspace-name">Workspace name</Field.Label>
						<input
							id="create-workspace-name"
							type="text"
							value={field.state.value}
							onblur={field.handleBlur}
							oninput={(e) => field.handleChange(e.currentTarget.value)}
							class="input input-bordered w-full"
							placeholder="My Workspace"
						/>
						<Field.Error
							errors={field.state.meta.errors as unknown as Array<{ message?: string }>}
						/>
					</div>
				{/snippet}
			</createWorkspaceForm.Field>
			<Dialog.Footer>
				<Dialog.Close>
					<Button
						type="button"
						variant="ghost"
					>
						Cancel
					</Button>
				</Dialog.Close>
				<createWorkspaceForm.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting })}>
					{#snippet children(state)}
						<Button
							type="submit"
							form="create-workspace-form"
							variant="primary"
							disabled={state.isSubmitting || createSubmitting}
						>
							{state.isSubmitting || createSubmitting ? 'Creating…' : 'Create New Workspace'}
						</Button>
					{/snippet}
				</createWorkspaceForm.Subscribe>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Invite team member dialog -->
<Dialog.Root bind:open={inviteDialogOpen}>
	<Dialog.Content>
		<form
			id="invite-member-form"
			method="dialog"
			onsubmit={handleInviteFormSubmit}
			class="space-y-4"
		>
			<Dialog.Header>
				<Dialog.Title>Add another member</Dialog.Title>
				<Dialog.Description>
					Send an invite by email. They can join this workspace from the link in the email or you can share the link with them.
				</Dialog.Description>
			</Dialog.Header>
			<div class="space-y-4">
				<inviteMemberForm.Field name="email">
					{#snippet children(field)}
						<div>
							<Field.Label field={field} for="invite-email">Email</Field.Label>
							<input
								id="invite-email"
								type="email"
								placeholder="colleague@example.com"
								value={field.state.value}
								onblur={field.handleBlur}
								oninput={(e) => field.handleChange(e.currentTarget.value)}
								class="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-base-content placeholder-base-content/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary input input-bordered"
							/>
							<Field.Error
								errors={field.state.meta.errors as unknown as Array<{ message?: string }>}
							/>
						</div>
					{/snippet}
				</inviteMemberForm.Field>
				<inviteMemberForm.Field name="role">
					{#snippet children(field)}
						<div>
							<Field.Label field={field} for="invite-role">Role</Field.Label>
							<select
								id="invite-role"
								value={field.state.value}
								onblur={field.handleBlur}
								onchange={(e) => field.handleChange((e.currentTarget as HTMLSelectElement).value as 'user' | 'admin')}
								class="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-base-content focus:outline-none focus-visible:ring-2 focus-visible:ring-primary select select-bordered"
							>
								<option value="user">
									Member</option>
								<option value="admin">
									Admin</option>
							</select>
							<Field.Error
								errors={field.state.meta.errors as unknown as Array<{ message?: string }>}
							/>
						</div>
					{/snippet}
				</inviteMemberForm.Field>
				<inviteMemberForm.Field name="sendEmail">
					{#snippet children(field)}
						<label class="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								checked={field.state.value}
								onblur={field.handleBlur}
								onchange={(e) => field.handleChange((e.currentTarget as HTMLInputElement).checked)}
								class="rounded border-base-300 checkbox"
							/>
							<span class="text-sm text-base-content">Send invitation email</span>
						</label>
						<Field.Error
							errors={field.state.meta.errors as unknown as Array<{ message?: string }>}
						/>
					{/snippet}
				</inviteMemberForm.Field>
			</div>
			<Dialog.Footer>
				<Dialog.Close>
					<Button type="button" variant="outline">
						Cancel
					</Button>
				</Dialog.Close>
				<inviteMemberForm.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting })}>
					{#snippet children(state)}
						<Button
							type="submit"
							form="invite-member-form"
							variant="primary"
							disabled={state.isSubmitting || inviting}
						>
							{state.isSubmitting || inviting ? 'Sending…' : 'Send invite'}
						</Button>
					{/snippet}
				</inviteMemberForm.Subscribe>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<UpdateWorkspaceModal
	bind:open={editWorkspaceModalOpen}
	form={updateWorkspaceForm}
	onSubmit={handleUpdateWorkspaceFormSubmit}
/>

<TeamMembersLimitUpgradeModal
	bind:open={teamMembersUpgradeDialogOpen}
	upgradeHref={accountBillingHref}
/>

<WorkspaceLimitUpgradeModal
	bind:open={workspaceUpgradeDialogOpen}
	upgradeHref={accountBillingHref}
/>

{#if deleteWorkspaceTarget}
	<DeleteModal
		bind:open={deleteWorkspaceConfirmOpen}
		title="Delete workspace?"
		description="This permanently deletes the workspace for all members. Posts, channels, media, and settings in this workspace cannot be recovered."
		itemName={deleteWorkspaceTarget.name}
		confirmLabel="Yes, delete workspace"
		cancelLabel="Cancel"
		loading={deletingWorkspace}
		contentClass="max-w-md"
		confirmVariant="red"
		cancelFirst
		onOpenChange={(open) => {
			if (!open && !deletingWorkspace) {
				deleteWorkspaceTarget = null;
			}
		}}
		onConfirm={() => void confirmDeleteWorkspace()}
		onCancel={closeDeleteWorkspaceConfirm}
	/>
{/if}
