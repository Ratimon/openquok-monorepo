<script lang="ts">
	import type { SettingsSidebarContext } from '$lib/ui/sidebar-main/types';
	import type { DeveloperSettingsTabId } from '$lib/settings/utils/buildAccountSettingsSearch';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getContext } from 'svelte';
	import { toast } from '$lib/ui/sonner';
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

	import EditorAccountSettings from '$lib/ui/templates/EditorAccountSettings.svelte';
	import EditorDeveloperSettings from '$lib/ui/templates/EditorDeveloperSettings.svelte';
	import EditorMetric from '$lib/ui/templates/EditorMetric.svelte';
	import EditorApprovedAppsSettings from '$lib/ui/templates/EditorApprovedAppsSettings.svelte';
	import EditorSignatureSettings from '$lib/ui/templates/EditorSignatureSettings.svelte';
	import EditorWorkspaceSettings from '$lib/ui/templates/EditorWorkspaceSettings.svelte';
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
	const loadingWorkspaces = $derived(workspacePresenter.status === WorkspaceSettingsStatus.LOADING);
	const createSubmitting = $derived(workspacePresenter.status === WorkspaceSettingsStatus.CREATING);
	const updateSubmitting = $derived(workspacePresenter.status === WorkspaceSettingsStatus.UPDATING);
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

	const developerApiKey = $derived(developersPresenter.currentApiKey);
	const developerApiKeyVisible = $derived(developersPresenter.apiKeyVisible);
	const developerCanRotate = $derived(developersPresenter.canRotateApiKey);
	const developerRotating = $derived(developersPresenter.status === DevelopersSettingsStatus.ROTATING);

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
		if (currentSection === 'developers' && developerTab === 'apps') {
			upsertOauthAppsPresenter.loadForCurrentWorkspace();
		}
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
	{#if currentSection === 'timezone'}
		<EditorMetric />
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
			loadingWorkspaces={loadingWorkspaces}
			createSubmitting={createSubmitting}
			updateSubmitting={updateSubmitting}
			leavingWorkspace={leavingWorkspace}
			loadingTeam={loadingTeam}
			inviting={inviting}
			loadingPendingInvites={loadingPendingInvites}
			acceptingInviteId={acceptingInviteId}
			onSwitchWorkspace={handleSwitchWorkspace}
			onCreateWorkspace={handleCreateWorkspace}
			onUpdateWorkspace={handleUpdateWorkspace}
			onLeaveWorkspace={handleLeaveWorkspace}
			onInviteMember={handleInviteMember}
			onAcceptPendingInvite={handleAcceptPendingInvite}
			onCopyWorkspaceId={handleCopyWorkspaceId}
		/>
	{:else if currentSection === 'developers'}
		<EditorDeveloperSettings
			apiKey={developerApiKey}
			apiKeyVisible={developerApiKeyVisible}
			canRotate={developerCanRotate}
			rotating={developerRotating}
			onSetApiKeyVisible={(v) => developersPresenter.setApiKeyVisible(v)}
			onRotateApiKey={() => developersPresenter.rotateApiKey()}
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
