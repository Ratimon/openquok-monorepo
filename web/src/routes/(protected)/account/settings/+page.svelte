<script lang="ts">
	import type { SettingsSidebarContext } from '$lib/ui/sidebar-main/types';

	import { getContext } from 'svelte';
	import { toast } from '$lib/ui/sonner';
	import { SETTINGS_SIDEBAR_KEY } from '$lib/ui/templates/sidebar-secondary-context';
	import SidebarSecondary from '$lib/ui/templates/SidebarSecondary.svelte';
	import {
		protectedSettingsPagePresenter,
		signatureSettingPresenter,
		UpdateProfileStatus,
		WorkspaceSettingsStatus
	} from '$lib/area-protected';

	import EditorAccountSettings from '$lib/ui/templates/EditorAccountSettings.svelte';
	import EditorMetric from '$lib/ui/templates/EditorMetric.svelte';
	import EditorWorkspaceSettings from '$lib/ui/templates/EditorWorkspaceSettings.svelte';
	import SignaturesList from '$lib/ui/components/signature/SignaturesList.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { DevelopersSettingsPresenter, DevelopersSettingsStatus } from '$lib/settings/DevelopersSettings.presenter.svelte';
	import { settingsRepository } from '$lib/settings';
	
	const ctx = getContext<SettingsSidebarContext>(SETTINGS_SIDEBAR_KEY);
	const currentSection = $derived(ctx?.getCurrentSection() ?? 'global');
	const sectionTitle = $derived(ctx?.getSectionTitle() ?? 'Global Settings');

	const pagePresenter = protectedSettingsPagePresenter;
	const accountPresenter = pagePresenter.accountPresenter;
	const workspacePresenter = pagePresenter.workspacePresenter;

	const currentProfileVm = $derived(accountPresenter.profileVm);
	const loadingProfile = $derived(accountPresenter.loadingProfile);

	const workspacesVm = $derived(workspacePresenter.workspacesVm);
	const currentWorkspaceId = $derived(workspacePresenter.currentWorkspaceId);
	const teamMembersVm = $derived(workspacePresenter.teamMembersVm);
	const pendingInvitesVm = $derived(workspacePresenter.pendingInvitesVm);
	const canInviteInCurrentWorkspace = $derived(workspacePresenter.canInviteInCurrentWorkspace);
	const loadingWorkspaces = $derived(workspacePresenter.status === WorkspaceSettingsStatus.LOADING);
	const createSubmitting = $derived(workspacePresenter.status === WorkspaceSettingsStatus.CREATING);
	const leavingWorkspace = $derived(workspacePresenter.status === WorkspaceSettingsStatus.LEAVING);
	const loadingTeam = $derived(workspacePresenter.status === WorkspaceSettingsStatus.LOADING_TEAM);
	const inviting = $derived(workspacePresenter.status === WorkspaceSettingsStatus.INVITING);
	const loadingPendingInvites = $derived(workspacePresenter.loadingPendingInvites);
	const acceptingInviteId = $derived(workspacePresenter.acceptingInviteId);

	// Load profile when profile section is shown
	$effect(() => {
		if (currentSection === 'profile') {
			pagePresenter.loadProfile();
		}
	});

	// Load workspace when workspace section is shown
	$effect(() => {
		if (currentSection === 'workspace' || currentSection === 'developers') {
			pagePresenter.loadWorkspace();
			pagePresenter.loadPendingInvites();
		}
	});

	const developersPresenter = new DevelopersSettingsPresenter(settingsRepository, workspacePresenter);
	const developerApiKey = $derived(developersPresenter.currentApiKey);
	const developerApiKeyVisible = $derived(developersPresenter.apiKeyVisible);
	const developerCanRotate = $derived(developersPresenter.canRotateApiKey);
	const developerRotating = $derived(developersPresenter.status === DevelopersSettingsStatus.ROTATING);

	let developerTab = $state<'access' | 'apps'>('access');

	function maskedKey(key: string) {
		if (key.length <= 10) return '•'.repeat(Math.max(4, key.length));
		return `${'•'.repeat(Math.max(12, key.length - 6))}${key.slice(-6)}`;
	}

	async function copyToClipboard(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			toast.success('Copied to clipboard');
		} catch {
			toast.error('Failed to copy');
		}
	}

	$effect(() => {
		if (!accountPresenter.showToastMessage) return;
		const isUpdated = accountPresenter.status === UpdateProfileStatus.UPDATED;
		if (isUpdated) {
			toast.success(accountPresenter.toastMessage);
		} else {
			toast.error(accountPresenter.toastMessage);
		}
		accountPresenter.showToastMessage = false;
	});

	$effect(() => {
		if (!workspacePresenter.showToastMessage) return;
		if (workspacePresenter.toastIsError) {
			toast.error(workspacePresenter.toastMessage);
		} else {
			toast.success(workspacePresenter.toastMessage);
		}
		workspacePresenter.showToastMessage = false;
	});

	$effect(() => {
		if (!developersPresenter.showToastMessage) return;
		if (developersPresenter.toastIsError) toast.error(developersPresenter.toastMessage);
		else toast.success(developersPresenter.toastMessage);
		developersPresenter.showToastMessage = false;
	});

	async function handleUpdateProfileDetails(updates: {
		fullName?: string;
		avatarUrl?: string | null;
		websiteUrl?: string | null;
	}) {
		return pagePresenter.handleUpdateProfileDetails(updates);
	}

	async function handleRequestChangePasswordEmail() {
		return pagePresenter.requestChangePasswordEmail();
	}

	function handleSwitchWorkspace(workspaceId: string) {
		pagePresenter.switchWorkspace(workspaceId);
	}

	async function handleCreateWorkspace(name: string) {
		return pagePresenter.createWorkspace(name);
	}

	async function handleLeaveWorkspace(workspaceId: string) {
		return pagePresenter.leaveWorkspace(workspaceId);
	}

	async function handleInviteMember(params: {
		email: string;
		role: 'user' | 'admin';
		sendEmail: boolean;
	}) {
		return pagePresenter.inviteTeamMember(params);
	}

	async function handleAcceptPendingInvite(inviteId: string) {
		return pagePresenter.acceptPendingInvite(inviteId);
	}

	function handleCopyWorkspaceId(workspaceId: string) {
		navigator.clipboard.writeText(workspaceId).then(
			() => toast.success('Workspace ID copied to clipboard'),
			() => toast.error('Failed to copy')
		);
	}
</script>
<SidebarSecondary>
	{#if currentSection === 'global'}
		<EditorMetric />

	{:else if currentSection === 'profile'}
		<EditorAccountSettings
			profileVm={currentProfileVm}
			loadingProfile={loadingProfile}
			onRequestChangePasswordEmail={handleRequestChangePasswordEmail}
			onUpdateProfileDetails={handleUpdateProfileDetails}
		/>
	{:else if currentSection === 'signature'}
		<SignaturesList presenter={signatureSettingPresenter} />
	{:else if currentSection === 'workspace'}
		<EditorWorkspaceSettings
			workspacesVm={workspacesVm}
			currentWorkspaceId={currentWorkspaceId}
			teamMembersVm={teamMembersVm}
			pendingInvitesVm={pendingInvitesVm}
			canInviteInCurrentWorkspace={canInviteInCurrentWorkspace}
			loadingWorkspaces={loadingWorkspaces}
			createSubmitting={createSubmitting}
			leavingWorkspace={leavingWorkspace}
			loadingTeam={loadingTeam}
			inviting={inviting}
			loadingPendingInvites={loadingPendingInvites}
			acceptingInviteId={acceptingInviteId}
			onSwitchWorkspace={handleSwitchWorkspace}
			onCreateWorkspace={handleCreateWorkspace}
			onLeaveWorkspace={handleLeaveWorkspace}
			onInviteMember={handleInviteMember}
			onAcceptPendingInvite={handleAcceptPendingInvite}
			onCopyWorkspaceId={handleCopyWorkspaceId}
		/>
	{:else if currentSection === 'developers'}
		<div class="space-y-6">
			<div class="flex items-center justify-between gap-3">
				<div>
					<p class="text-sm text-base-content/70">
						Use your API Key to automate your own account.
					</p>
					<p class="text-sm text-base-content/70">
						If you’re building a product that schedules posts on behalf of other users, use OAuth Apps.
					</p>
				</div>

				<div class="inline-flex rounded-full bg-base-200 p-1">
					<button
						type="button"
						class={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
							developerTab === 'access'
								? 'bg-primary text-primary-content'
								: 'text-base-content/70 hover:bg-base-300/50'
						}`}
						onclick={() => (developerTab = 'access')}
					>
						Access
					</button>
					<button
						type="button"
						class={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
							developerTab === 'apps'
								? 'bg-primary text-primary-content'
								: 'text-base-content/70 hover:bg-base-300/50'
						}`}
						onclick={() => (developerTab = 'apps')}
					>
						Apps
					</button>
				</div>
			</div>

			{#if developerTab === 'access'}
				<div class="rounded-xl border border-base-300 bg-base-200 p-6">
					<div class="flex items-start justify-between gap-4">
						<div>
							<h3 class="text-base font-semibold">
								API Key
							</h3>
							<p class="text-sm text-base-content/70">
								Use Openquok API to integrate with your tools.
							</p>
						</div>

						<div class="flex items-center gap-2">
							<Button variant="outline" onclick={() => toast.message('Docs link coming soon')}>Docs</Button>
						</div>
					</div>

					<div class="mt-4 rounded-lg border border-base-300 bg-base-100 p-4 font-mono text-sm">
						{#if developerApiKey}
							{#if developerApiKeyVisible}
								{developerApiKey}
							{:else}
								{maskedKey(developerApiKey)}
							{/if}
						{:else}
							<span class="text-base-content/60">
								No API key found for this workspace.
							</span>
						{/if}
					</div>

					<div class="mt-4 flex flex-wrap items-center gap-2">
						<Button
							variant="outline"
							disabled={!developerApiKey}
							onclick={() => developersPresenter.setApiKeyVisible(!developerApiKeyVisible)}
						>
							{developerApiKeyVisible ? 'Hide' : 'Reveal'}
						</Button>
						<Button
							variant="outline"
							disabled={!developerApiKey}
							onclick={() => developerApiKey && copyToClipboard(developerApiKey)}
						>
							Copy
						</Button>
						<Button
							variant="outline"
							disabled={!developerApiKey || !developerCanRotate || developerRotating}
							onclick={() => developersPresenter.rotateApiKey()}
						>
							{developerRotating ? 'Rotating…' : 'Rotate Key'}
						</Button>
						<Button variant="outline" onclick={() => toast.message('Wizard coming soon')}>Open Wizard</Button>
					</div>
				</div>

				<div class="rounded-xl border border-base-300 bg-base-200 p-6">
					<div class="flex items-start justify-between gap-4">
						<div>
							<h3 class="text-base font-semibold">CLI &amp; AI Skills</h3>
							<p class="text-sm text-base-content/70">
								Install the CLI and configure your environment variable for programmatic access.
							</p>
						</div>
						<Button variant="outline" onclick={() => toast.message('Docs link coming soon')}>Docs</Button>
					</div>

					<div class="mt-4 space-y-3">
						<div>
							<p class="text-sm font-medium text-base-content/80">1. Install the CLI</p>
							<div class="mt-2 rounded-lg border border-base-300 bg-base-100 p-4 font-mono text-sm">
								npm install -g openquok
							</div>
						</div>

						<div>
							<p class="text-sm font-medium text-base-content/80">2. Set your API key</p>
							<div class="mt-2 rounded-lg border border-base-300 bg-base-100 p-4 font-mono text-sm">
								{#if developerApiKey}
									export OPENQUOK_API_KEY="{developerApiKeyVisible
										? developerApiKey
										: maskedKey(developerApiKey)}"
								{:else}
									export OPENQUOK_API_KEY="..."
								{/if}
							</div>
						</div>

						<div class="flex flex-wrap gap-2">
							<Button
								variant="outline"
								disabled={!developerApiKey}
								onclick={() =>
									developerApiKey && copyToClipboard(`export OPENQUOK_API_KEY=\"${developerApiKey}\"`)}
							>
								Copy Export
							</Button>
						</div>
					</div>
				</div>
			{:else}
				<div class="rounded-xl border border-base-300 bg-base-200 p-6">
					<div class="flex items-start justify-between gap-4">
						<div>
							<h3 class="text-base font-semibold">
								OAuth Application
							</h3>
							<p class="text-sm text-base-content/70">
								Create an OAuth application to allow third-party integrations to post on behalf of your users.
							</p>
						</div>
						<Button variant="outline" onclick={() => toast.message('Docs link coming soon')}>Docs</Button>
					</div>

					<div class="mt-6">
						<Button disabled variant="primary">
							Create OAuth App
						</Button>
						<p class="mt-3 text-sm text-base-content/70">
							OAuth Apps are not wired in this port yet.
						</p>
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<div
			class="rounded-lg border border-base-300 bg-base-200 p-8 text-center text-base-content/70"
		>
			<p>
				Settings for "{sectionTitle}" will appear here.</p>
		</div>
	{/if}
</SidebarSecondary>
