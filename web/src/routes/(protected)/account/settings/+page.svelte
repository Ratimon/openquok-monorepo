<script lang="ts">
	import type { SettingsSidebarContext } from '$lib/ui/sidebar-main/types';
	import type { DeveloperSettingsTabId } from '$lib/settings/utils/buildAccountSettingsSearch';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getContext } from 'svelte';
	import { toast } from '$lib/ui/sonner';
	import { planLimitsForTier } from 'openquok-common';
	import {
		buildAccountSettingsSearchParams,
		parseDeveloperSettingsTab
	} from '$lib/settings/utils/buildAccountSettingsSearch';
	import { SETTINGS_SIDEBAR_KEY } from '$lib/ui/templates/sidebar-secondary-context';
	import {
		protectedSettingsPagePresenter,
		signatureSettingPresenter,
		UpdateProfileStatus,
		WorkspaceSettingsStatus
	} from '$lib/area-protected';

	import { DevelopersSettingsStatus } from '$lib/settings/DevelopersSettings.presenter.svelte';
	import { upsertOauthAppsPresenter } from '$lib/developers';
	import { getBillingPresenter } from '$lib/billing';

	import EditorAccountSettings from '$lib/ui/components/settings/EditorAccountSettings.svelte';
	import EditorDeveloperSettings from '$lib/ui/components/settings/EditorDeveloperSettings.svelte';
	import EditorMetricSettings from '$lib/ui/components/settings/EditorMetricSettings.svelte';
	import EditorApprovedAppsSettings from '$lib/ui/components/settings/EditorApprovedAppsSettings.svelte';
	import EditorSignatureSettings from '$lib/ui/components/settings/EditorSignatureSettings.svelte';
	import EditorWorkspaceSettings from '$lib/ui/components/settings/EditorWorkspaceSettings.svelte';
	import SidebarSecondary from '$lib/ui/templates/SidebarSecondary.svelte';
	
	const ctx = getContext<SettingsSidebarContext>(SETTINGS_SIDEBAR_KEY);
	const currentSection = $derived(ctx?.getCurrentSection() ?? 'timezone');
	const sectionTitle = $derived(ctx?.getSectionTitle() ?? 'Global Settings');

	const pagePresenter = protectedSettingsPagePresenter;
	const accountPresenter = pagePresenter.accountPresenter;
	const workspacePresenter = pagePresenter.workspacePresenter;
	const developersPresenter = pagePresenter.developersPresenter;
	const approvedAppsPresenter = pagePresenter.approvedAppsPresenter;

	const currentProfileVm = $derived(accountPresenter.profileVm);
	const loadingProfile = $derived(accountPresenter.loadingProfile);

	const workspacesVm = $derived(workspacePresenter.workspacesVm);
	const currentWorkspaceId = $derived(workspacePresenter.currentWorkspaceId);
	const teamMembersVm = $derived(workspacePresenter.teamMembersVm);
	const sentInvitesVm = $derived(workspacePresenter.sentInvitesVm);
	const pendingInvitesVm = $derived(workspacePresenter.pendingInvitesVm);
	const canInviteInCurrentWorkspace = $derived(workspacePresenter.canInviteInCurrentWorkspace);
	const canManageSentInvitesInCurrentWorkspace = $derived(
		workspacePresenter.canManageSentInvitesInCurrentWorkspace
	);
	const loadingWorkspaces = $derived(workspacePresenter.status === WorkspaceSettingsStatus.LOADING);
	const createSubmitting = $derived(workspacePresenter.status === WorkspaceSettingsStatus.CREATING);
	const updateSubmitting = $derived(workspacePresenter.status === WorkspaceSettingsStatus.UPDATING);
	const leavingWorkspace = $derived(workspacePresenter.status === WorkspaceSettingsStatus.LEAVING);
	const deletingWorkspace = $derived(workspacePresenter.status === WorkspaceSettingsStatus.DELETING);
	const loadingTeam = $derived(workspacePresenter.status === WorkspaceSettingsStatus.LOADING_TEAM);
	const inviting = $derived(workspacePresenter.status === WorkspaceSettingsStatus.INVITING);
	const loadingPendingInvites = $derived(workspacePresenter.loadingPendingInvites);
	const acceptingInviteId = $derived(workspacePresenter.acceptingInviteId);
	const cancelingSentInviteId = $derived(workspacePresenter.cancelingSentInviteId);

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

	const developerProgrammaticToken = $derived(developersPresenter.programmaticAccessToken);
	const developerProgrammaticConfigured = $derived(developersPresenter.programmaticAccessConfigured ?? false);
	const developerTokenVisible = $derived(developersPresenter.tokenVisible);
	const developerCanRotate = $derived(developersPresenter.canRotateProgrammaticToken);
	const developerRotating = $derived(developersPresenter.status === DevelopersSettingsStatus.ROTATING);
	let publicApiEnabled = $state<boolean | null>(null);

	const developerTab = $derived.by((): DeveloperSettingsTabId => {
		if (currentSection !== 'developers') return 'access';
		return parseDeveloperSettingsTab(page.url.searchParams.get('tab'));
	});

	function setDeveloperTab(next: DeveloperSettingsTabId) {
		if (currentSection !== 'developers') return;
		const search = buildAccountSettingsSearchParams('developers', {
			developerTab: next === 'apps' ? 'apps' : undefined
		});
		const nextHref = `${page.url.pathname}?${search}`;
		const currentHref = `${page.url.pathname}${page.url.search}`;
		if (nextHref !== currentHref) {
			void goto(nextHref, { replaceState: true, keepFocus: true, noScroll: true });
		}
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

	$effect(() => {
		if (currentSection === 'developers') {
			void upsertOauthAppsPresenter.loadForCurrentWorkspace();
		}
	});

	const developerOauthAppReady = $derived(upsertOauthAppsPresenter.appVm != null);
	const developerOauthAppLoading = $derived(
		upsertOauthAppsPresenter.appVm === undefined || upsertOauthAppsPresenter.isLoading
	);

	$effect(() => {
		if (currentSection !== 'developers') return;
		const workspaceId = workspacePresenter.currentWorkspaceId;
		if (!workspaceId) {
			developersPresenter.resetProgrammaticAccessSession();
			developersPresenter.clearProgrammaticTokenStatus();
			return;
		}
		developersPresenter.resetProgrammaticAccessSession();
		void developersPresenter.loadProgrammaticTokenStatus();
	});

	$effect(() => {
		if (currentSection !== 'developers') {
			publicApiEnabled = null;
			developersPresenter.setPublicApiEnabled(null);
			upsertOauthAppsPresenter.setPublicApiEnabled(null);
			return;
		}
		let cancelled = false;
		publicApiEnabled = null;
		developersPresenter.setPublicApiEnabled(null);
		upsertOauthAppsPresenter.setPublicApiEnabled(null);
		void getBillingPresenter.loadOwnedAccountBillingVmStateless().then((vm) => {
			if (cancelled) return;
			publicApiEnabled = vm ? planLimitsForTier(vm.tier).public_api : false;
			developersPresenter.setPublicApiEnabled(publicApiEnabled);
			upsertOauthAppsPresenter.setPublicApiEnabled(publicApiEnabled);
		});
		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		if (currentSection === 'approved-apps') {
			void approvedAppsPresenter.load();
		}
	});

	$effect(() => {
		if (!upsertOauthAppsPresenter.showToastMessage) return;
		if (upsertOauthAppsPresenter.toastIsError) toast.error(upsertOauthAppsPresenter.toastMessage);
		else toast.success(upsertOauthAppsPresenter.toastMessage);
		upsertOauthAppsPresenter.showToastMessage = false;
	});

	$effect(() => {
		if (!approvedAppsPresenter.showToastMessage) return;
		if (approvedAppsPresenter.toastIsError) toast.error(approvedAppsPresenter.toastMessage);
		else toast.success(approvedAppsPresenter.toastMessage);
		approvedAppsPresenter.showToastMessage = false;
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

	async function handleUpdateWorkspace(
		workspaceId: string,
		params: { name: string; description: string | null }
	) {
		return pagePresenter.updateWorkspace(workspaceId, params);
	}

	async function handleLeaveWorkspace(workspaceId: string) {
		return pagePresenter.leaveWorkspace(workspaceId);
	}

	async function handleDeleteWorkspace(workspaceId: string) {
		return pagePresenter.deleteWorkspace(workspaceId);
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

	async function handleCancelSentInvite(inviteId: string) {
		return pagePresenter.cancelSentInvite(inviteId);
	}

	function handleCopyWorkspaceId(workspaceId: string) {
		navigator.clipboard.writeText(workspaceId).then(
			() => toast.success('Workspace ID copied to clipboard'),
			() => toast.error('Failed to copy')
		);
	}
</script>
<SidebarSecondary>
	{#if currentSection === 'timezone'}
		<EditorMetricSettings />
	{:else if currentSection === 'profile'}
		<EditorAccountSettings
			profileVm={currentProfileVm}
			loadingProfile={loadingProfile}
			onRequestChangePasswordEmail={handleRequestChangePasswordEmail}
			onUpdateProfileDetails={handleUpdateProfileDetails}
		/>
	{:else if currentSection === 'signature'}
		<EditorSignatureSettings
			status={signatureSettingPresenter.status}
			itemsVm={signatureSettingPresenter.itemsVm}
			showToastMessage={signatureSettingPresenter.showToastMessage}
			toastMessage={signatureSettingPresenter.toastMessage}
			toastIsError={signatureSettingPresenter.toastIsError}
			onClearToast={() => (signatureSettingPresenter.showToastMessage = false)}
			onLoadSignaturesForOrganization={(orgId) => signatureSettingPresenter.loadSignaturesForOrganization(orgId)}
			onCreateSignature={(orgId, input) => signatureSettingPresenter.create(orgId, input)}
			onUpdateSignature={(id, input) => signatureSettingPresenter.update(id, input)}
			onDeleteSignature={(id) => signatureSettingPresenter.delete(id)}
		/>
	{:else if currentSection === 'workspace'}
		<EditorWorkspaceSettings
			workspacesVm={workspacesVm}
			currentWorkspaceId={currentWorkspaceId}
			teamMembersVm={teamMembersVm}
			sentInvitesVm={sentInvitesVm}
			pendingInvitesVm={pendingInvitesVm}
			canInviteInCurrentWorkspace={canInviteInCurrentWorkspace}
			canManageSentInvitesInCurrentWorkspace={canManageSentInvitesInCurrentWorkspace}
			loadingWorkspaces={loadingWorkspaces}
			createSubmitting={createSubmitting}
			updateSubmitting={updateSubmitting}
			leavingWorkspace={leavingWorkspace}
			deletingWorkspace={deletingWorkspace}
			loadingTeam={loadingTeam}
			inviting={inviting}
			loadingPendingInvites={loadingPendingInvites}
			acceptingInviteId={acceptingInviteId}
			cancelingSentInviteId={cancelingSentInviteId}
			onSwitchWorkspace={handleSwitchWorkspace}
			onCreateWorkspace={handleCreateWorkspace}
			onUpdateWorkspace={handleUpdateWorkspace}
			onLeaveWorkspace={handleLeaveWorkspace}
			onDeleteWorkspace={handleDeleteWorkspace}
			onInviteMember={handleInviteMember}
			onAcceptPendingInvite={handleAcceptPendingInvite}
			onCancelSentInvite={handleCancelSentInvite}
			onCopyWorkspaceId={handleCopyWorkspaceId}
		/>
	{:else if currentSection === 'developers'}
		<EditorDeveloperSettings
			publicApiEnabled={publicApiEnabled}
			programmaticAccessToken={developerProgrammaticToken}
			programmaticAccessConfigured={developerProgrammaticConfigured}
			tokenVisible={developerTokenVisible}
			canRotate={developerCanRotate}
			rotating={developerRotating}
			onSetTokenVisible={(v) => developersPresenter.setTokenVisible(v)}
			oauthAppReady={developerOauthAppReady}
			oauthAppLoading={developerOauthAppLoading}
			onRotateToken={() => developersPresenter.rotateProgrammaticAccessToken()}
			onGoToAppsTab={() => setDeveloperTab('apps')}
			oauthLoadForbidden={upsertOauthAppsPresenter.loadForbidden}
			oauthForbiddenMessage={upsertOauthAppsPresenter.forbiddenMessage}
			oauthAppVm={upsertOauthAppsPresenter.appVm}
			oauthIsLoading={upsertOauthAppsPresenter.isLoading}
			oauthCreating={upsertOauthAppsPresenter.creating}
			oauthEditing={upsertOauthAppsPresenter.editing}
			oauthCanManageApps={upsertOauthAppsPresenter.canManageApps}
			oauthStatus={upsertOauthAppsPresenter.status}
			bind:oauthFormName={upsertOauthAppsPresenter.formName}
			bind:oauthFormDescription={upsertOauthAppsPresenter.formDescription}
			bind:oauthFormRedirectUrl={upsertOauthAppsPresenter.formRedirectUrl}
			bind:oauthFormPictureId={upsertOauthAppsPresenter.formPictureId}
			bind:oauthFormPicturePreviewUrl={upsertOauthAppsPresenter.formPicturePreviewUrl}
			oauthPlaintextClientSecret={upsertOauthAppsPresenter.plaintextClientSecret}
			bind:oauthMediaPickerOpen={upsertOauthAppsPresenter.mediaPickerOpen}
			oauthMediaPickerLoading={upsertOauthAppsPresenter.mediaPickerLoading}
			oauthMediaPickerUploadBusy={upsertOauthAppsPresenter.mediaPickerUploadBusy}
			oauthMediaPickerItemsVm={upsertOauthAppsPresenter.mediaPickerItemsVm}
			bind:oauthConfirmRotateOpen={upsertOauthAppsPresenter.confirmRotateOpen}
			bind:oauthConfirmDeleteOpen={upsertOauthAppsPresenter.confirmDeleteOpen}
			onOauthStartCreate={() => upsertOauthAppsPresenter.startCreate()}
			onOauthCancelCreate={() => upsertOauthAppsPresenter.cancelCreate()}
			onOauthOpenMediaPicker={() => upsertOauthAppsPresenter.openMediaPicker()}
			onOauthClearPicture={() => upsertOauthAppsPresenter.clearPicture()}
			onOauthSubmitCreate={() => upsertOauthAppsPresenter.submitCreate()}
			onOauthStartEdit={() => upsertOauthAppsPresenter.startEdit()}
			onOauthCancelEdit={() => upsertOauthAppsPresenter.cancelEdit()}
			onOauthSubmitUpdate={() => upsertOauthAppsPresenter.submitUpdate()}
			onOauthRequestRotateSecret={() => upsertOauthAppsPresenter.requestRotateSecret()}
			onOauthConfirmRotateSecret={() => upsertOauthAppsPresenter.confirmRotateSecret()}
			onOauthCancelRotateConfirm={() => upsertOauthAppsPresenter.cancelRotateConfirm()}
			onOauthRequestDeleteApp={() => upsertOauthAppsPresenter.requestDeleteApp()}
			onOauthConfirmDeleteApp={() => upsertOauthAppsPresenter.confirmDeleteApp()}
			onOauthCancelDeleteConfirm={() => upsertOauthAppsPresenter.cancelDeleteConfirm()}
			onOauthSetMediaPickerOpen={(o) => upsertOauthAppsPresenter.setMediaPickerOpen(o)}
			onOauthSelectMediaItem={(vm) => upsertOauthAppsPresenter.selectMediaItem(vm)}
			onOauthUploadMediaPickerFiles={(files) => upsertOauthAppsPresenter.uploadMediaPickerFiles(files)}
			onCopy={copyToClipboard}
			{developerTab}
			onDeveloperTabChange={setDeveloperTab}
		/>
	{:else if currentSection === 'approved-apps'}
		<EditorApprovedAppsSettings
			status={approvedAppsPresenter.status}
			itemsVm={approvedAppsPresenter.itemsVm}
			revokingAuthorizationId={approvedAppsPresenter.revokingAuthorizationId}
			onRevoke={(id) => approvedAppsPresenter.revoke(id)}
		/>
	{:else}
		<div
			class="rounded-lg border border-base-300 bg-base-200 p-8 text-center text-base-content/70"
		>
			<p>
				Settings for "{sectionTitle}" will appear here.</p>
		</div>
	{/if}
</SidebarSecondary>
