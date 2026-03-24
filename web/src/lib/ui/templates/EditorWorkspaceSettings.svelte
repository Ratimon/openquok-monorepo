<script lang="ts">
	import {
		workspaceCreateFormSchema,
		workspaceInviteMemberFormSchema,
		type PendingInviteViewModel,
		type TeamMemberViewModel,
		type WorkspaceCardViewModel
	} from '$lib/settings';
	import { createForm } from '@tanstack/svelte-form';
	import toast from 'svelte-hot-french-toast';
	import * as Dialog from '$lib/ui/dialog';
	import * as Field from '$lib/ui/field';
	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		workspacesVm: WorkspaceCardViewModel[];
		currentWorkspaceId: string | null;
		teamMembersVm: TeamMemberViewModel[];
		pendingInvitesVm: PendingInviteViewModel[];
		canInviteInCurrentWorkspace: boolean;
		loadingWorkspaces: boolean;
		createSubmitting: boolean;
		leavingWorkspace: boolean;
		loadingTeam: boolean;
		inviting: boolean;
		loadingPendingInvites: boolean;
		acceptingInviteId: string | null;
		onSwitchWorkspace: (workspaceId: string) => void;
		onCreateWorkspace: (name: string) => Promise<{ success: boolean; message: string }>;
		onLeaveWorkspace: (workspaceId: string) => Promise<{ success: boolean; message: string }>;
		onInviteMember: (params: {
			email: string;
			role: 'user' | 'admin';
			sendEmail: boolean;
		}) => Promise<{ success: boolean; message: string }>;
		onAcceptPendingInvite: (inviteId: string) => Promise<{ success: boolean; message: string }>;
		onCopyWorkspaceId: (workspaceId: string) => void;
	};

	let {
		workspacesVm,
		currentWorkspaceId,
		teamMembersVm,
		pendingInvitesVm,
		canInviteInCurrentWorkspace,
		loadingWorkspaces,
		createSubmitting,
		leavingWorkspace,
		loadingTeam,
		inviting,
		loadingPendingInvites,
		acceptingInviteId,
		onSwitchWorkspace,
		onCreateWorkspace,
		onLeaveWorkspace,
		onInviteMember,
		onAcceptPendingInvite,
		onCopyWorkspaceId
	}: Props = $props();

	const defaultNewWorkspaceName = 'My Workspace';

	let createDialogOpen = $state(false);
	let inviteDialogOpen = $state(false);
	let openMenuOrgId = $state<string | null>(null);

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
			} else {
				toast.error(result.message);
			}
		}
	}));

	function roleDisplayLabel(role: 'user' | 'admin' | 'superadmin'): string {
		switch (role) {
			case 'superadmin':
				return 'Super Admin';
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
		createWorkspaceForm.setFieldValue('workspaceName', defaultNewWorkspaceName);
		createDialogOpen = true;
	}

	function openInviteDialog() {
		if (!canInviteInCurrentWorkspace) return;
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

	function copyWorkspaceId(workspaceId: string) {
		onCopyWorkspaceId(workspaceId);
		openMenuOrgId = null;
	}

	async function leaveWorkspace(workspaceId: string) {
		openMenuOrgId = null;
		const result = await onLeaveWorkspace(workspaceId);
		if (!result.success) toast.error(result.message);
	}

	function switchWorkspace(workspaceId: string) {
		onSwitchWorkspace(workspaceId);
	}

	$effect(() => {
		if (!openMenuOrgId) return;
		function onDocClick(e: MouseEvent) {
			const t = e.target as Node;
			if (!document.querySelector('[data-workspace-menu]')?.contains(t)) {
				openMenuOrgId = null;
			}
		}
		setTimeout(() => document.addEventListener('click', onDocClick), 0);
		return () => document.removeEventListener('click', onDocClick);
	});
</script>

<!-- All Workspaces -->
<section
	class="rounded-lg border border-base-300 bg-base-200 shadow-sm overflow-hidden"
	aria-labelledby="workspaces-heading"
>
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6">
		<h2 id="workspaces-heading" class="text-lg font-semibold text-base-content">
			All Workspaces
		</h2>
		<button
			type="button"
			class="rounded-lg border border-base-300 bg-base-content px-4 py-2 text-sm font-medium text-base-100 shadow-sm hover:bg-base-content/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
			onclick={openCreateDialog}
			disabled={loadingWorkspaces || createSubmitting}
		>
			Create New Workspace
		</button>
	</div>
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
							<button
								type="button"
								class="rounded-full border border-base-300 bg-base-100 px-4 py-2 text-sm font-medium text-base-content shadow-sm hover:bg-base-content/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
								onclick={() => switchWorkspace(org.id)}
								disabled={leavingWorkspace}
							>
								Switch
							</button>
						{/if}
						<div class="relative" data-workspace-menu>
							<button
								type="button"
								class="rounded-full p-2 border border-base-300 bg-base-100 text-base-content/70 hover:bg-base-content/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
								aria-label="Workspace options"
								aria-expanded={openMenuOrgId === org.id}
								aria-haspopup="true"
								onclick={() => openMenuOrgId = openMenuOrgId === org.id ? null : org.id}
							>
								<AbstractIcon name={icons.Cog.name} width="16" height="16" focusable="false" />
							</button>
							{#if openMenuOrgId === org.id}
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div
									class="absolute right-0 top-full z-10 mt-1 min-w-[180px] rounded-lg border border-base-300 bg-base-100 py-1 shadow-lg"
									role="menu"
									tabindex="-1"
									onclick={(e) => e.stopPropagation()}
									onkeydown={(e) => e.key === 'Escape' && (openMenuOrgId = null)}
								>
									<button
										type="button"
										role="menuitem"
										class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-base-content hover:bg-base-200"
										onclick={() => copyWorkspaceId(org.id)}
									>
										<AbstractIcon name={icons.Copy.name} width="16" height="16" focusable="false" />
										Copy Workspace ID
									</button>
									<button
										type="button"
										role="menuitem"
										class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-error hover:bg-error/10"
										onclick={() => leaveWorkspace(org.id)}
										disabled={leavingWorkspace}
									>
										<span aria-hidden="true">→</span>
										Leave Workspace
									</button>
								</div>
							{/if}
						</div>
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
		<div class="mt-4 rounded-lg border border-base-300 bg-base-100 p-4 space-y-4">
			{#if loadingTeam}
				<p class="text-sm text-base-content/70">
					Loading team…
				</p>
			{:else if teamMembersVm.length === 0}
				<p class="text-sm text-base-content/70">
					No members yet.
				</p>
			{:else}
				{#each teamMembersVm as member (member.id)}
					<div class="flex items-center justify-between gap-4">
						<span class="text-sm font-medium text-base-content">{member.displayName}</span>
						<span class="text-sm text-base-content/70">{roleDisplayLabel(member.workspaceRole)}</span>
					</div>
				{/each}
			{/if}

			{#if canInviteInCurrentWorkspace}
				<button
					type="button"
					class="rounded-lg border-0 bg-base-content px-4 py-2 text-sm font-medium text-base-100 shadow-sm hover:bg-base-content/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
					onclick={openInviteDialog}
					disabled={loadingTeam || inviting}
				>
					{inviting ? 'Sending…' : 'Add another member'}
				</button>
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
							{roleDisplayLabel(invite.role as 'user' | 'admin' | 'superadmin')}
							{#if formatInviteExpiry(invite.expiresAt)}
								<span class="ml-2">· {formatInviteExpiry(invite.expiresAt)}</span>
							{/if}
						</p>
					</div>
					<button
						type="button"
						class="rounded-lg border-0 bg-base-content px-3 py-1.5 text-sm font-medium text-base-100 shadow-sm hover:bg-base-content/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
						onclick={() => handleAcceptPendingInvite(invite.id)}
						disabled={acceptingInviteId !== null}
					>
						{acceptingInviteId === invite.id ? 'Accepting…' : 'Accept'}
					</button>
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
				<Dialog.Title>Create new workspace</Dialog.Title>
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
					<button type="button" class="btn btn-ghost border border-base-content text-base-content hover:bg-base-content/10">
						Cancel
					</button>
				</Dialog.Close>
				<createWorkspaceForm.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting })}>
					{#snippet children(state)}
						<button
							type="submit"
							form="create-workspace-form"
							class="btn bg-base-content text-base-100 hover:bg-base-content/90 border-0"
							disabled={state.isSubmitting || createSubmitting}
						>
							{state.isSubmitting || createSubmitting ? 'Creating…' : 'Create New Workspace'}
						</button>
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
					<button type="button" class="btn btn-ghost border border-base-content text-base-content hover:bg-base-content/10">
						Cancel
					</button>
				</Dialog.Close>
				<inviteMemberForm.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting })}>
					{#snippet children(state)}
						<button
							type="submit"
							form="invite-member-form"
							class="btn bg-base-content text-base-100 hover:bg-base-content/90 border-0"
							disabled={state.isSubmitting || inviting}
						>
							{state.isSubmitting || inviting ? 'Sending…' : 'Send invite'}
						</button>
					{/snippet}
				</inviteMemberForm.Subscribe>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
