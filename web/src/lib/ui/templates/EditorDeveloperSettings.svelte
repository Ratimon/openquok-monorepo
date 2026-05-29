<script lang="ts">
	import type { MediaLibraryItemViewModel } from '$lib/medias/GetMedia.presenter.svelte';
	import type { DeveloperSettingsTabId } from '$lib/settings/utils/buildAccountSettingsSearch';
	import { OAuthAppsPresenterStatus } from '$lib/developers/UpsertOAuthApp.presenter.svelte';
	import type { OauthAppViewModel } from '$lib/developers/UpsertOAuthApp.presenter.svelte';

	import { browser } from '$app/environment';
	import { getRootPathPublicDocs } from '$lib/area-public/constants/getRootPathPublicDocs';
	import { route, url } from '$lib/utils/path';
	import { icons } from '$data/icons';

	import UpdateDeveloperAccess from '$lib/ui/components/developer/UpdateDeveloperAccess.svelte';
	import UpdateDeveloperOauth from '$lib/ui/components/developer/UpdateDeveloperOauth.svelte';
	import HomeAccountNoticeBanner from '$lib/ui/components/home/HomeAccountNoticeBanner.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	const CLI_DEVICE_LOGIN_NOTICE_STORAGE_KEY = 'settings:developers:cli-device-login-dismissed';

	// /docs/getting-started-for-cli/authentication
	const rootPathPublicDocs = getRootPathPublicDocs();
	const publicDocsPath = route(rootPathPublicDocs);
	const cliAuthDocsHref = url(`${publicDocsPath}/getting-started-for-cli/authentication`);

	let cliDeviceLoginNoticeDismissed = $state(false);

	function readCliDeviceLoginNoticeDismissed(): boolean {
		if (!browser) return false;
		try {
			return localStorage.getItem(CLI_DEVICE_LOGIN_NOTICE_STORAGE_KEY) === 'true';
		} catch {
			return false;
		}
	}

	function dismissCliDeviceLoginNotice(): void {
		cliDeviceLoginNoticeDismissed = true;
		if (!browser) return;
		try {
			localStorage.setItem(CLI_DEVICE_LOGIN_NOTICE_STORAGE_KEY, 'true');
		} catch {
			// ignore
		}
	}

	$effect(() => {
		cliDeviceLoginNoticeDismissed = readCliDeviceLoginNoticeDismissed();
	});

	type Props = {
		publicApiEnabled: boolean | null;
		programmaticAccessToken: string | null;
		programmaticAccessConfigured: boolean;
		tokenVisible: boolean;
		canRotate: boolean;
		rotating: boolean;
		oauthAppReady: boolean;
		oauthAppLoading: boolean;
		onSetTokenVisible: (visible: boolean) => void;
		onRotateToken: () => void | Promise<void>;
		onGoToAppsTab: () => void;

		oauthLoadForbidden: boolean;
		oauthForbiddenMessage: string;
		oauthAppVm: OauthAppViewModel | null | undefined;
		oauthIsLoading: boolean;
		oauthCreating: boolean;
		oauthEditing: boolean;
		oauthCanManageApps: boolean;
		oauthStatus: OAuthAppsPresenterStatus;
		oauthFormName: string;
		oauthFormDescription: string;
		oauthFormRedirectUrl: string;
		oauthFormPictureId: string | null;
		oauthFormPicturePreviewUrl: string | null;
		oauthPlaintextClientSecret: string | null;
		oauthMediaPickerOpen: boolean;
		oauthMediaPickerLoading: boolean;
		oauthMediaPickerUploadBusy: boolean;
		oauthMediaPickerItemsVm: MediaLibraryItemViewModel[];
		oauthConfirmRotateOpen: boolean;
		oauthConfirmDeleteOpen: boolean;

		onOauthStartCreate: () => void;
		onOauthCancelCreate: () => void;
		onOauthOpenMediaPicker: () => void | Promise<void>;
		onOauthClearPicture: () => void;
		onOauthSubmitCreate: () => void | Promise<void>;
		onOauthStartEdit: () => void;
		onOauthCancelEdit: () => void;
		onOauthSubmitUpdate: () => void | Promise<void>;
		onOauthRequestRotateSecret: () => void;
		onOauthConfirmRotateSecret: () => void | Promise<void>;
		onOauthCancelRotateConfirm: () => void;
		onOauthRequestDeleteApp: () => void;
		onOauthConfirmDeleteApp: () => void | Promise<void>;
		onOauthCancelDeleteConfirm: () => void;
		onOauthSetMediaPickerOpen: (open: boolean) => void;
		onOauthSelectMediaItem: (vm: MediaLibraryItemViewModel) => void;
		onOauthUploadMediaPickerFiles: (files: FileList | null) => void | Promise<void>;

		onCopy: (text: string) => void | Promise<void>;
		developerTab: DeveloperSettingsTabId;
		onDeveloperTabChange: (tab: DeveloperSettingsTabId) => void;
	};

	let {
		publicApiEnabled,
		programmaticAccessToken,
		programmaticAccessConfigured,
		tokenVisible,
		canRotate,
		rotating,
		oauthAppReady,
		oauthAppLoading,
		onSetTokenVisible,
		onRotateToken,
		onGoToAppsTab,

		oauthLoadForbidden,
		oauthForbiddenMessage,
		oauthAppVm,
		oauthIsLoading,
		oauthCreating,
		oauthEditing,
		oauthCanManageApps,
		oauthStatus,
		oauthFormName = $bindable(''),
		oauthFormDescription = $bindable(''),
		oauthFormRedirectUrl = $bindable(''),
		oauthFormPictureId = $bindable<string | null>(null),
		oauthFormPicturePreviewUrl = $bindable<string | null>(null),
		oauthPlaintextClientSecret,
		oauthMediaPickerOpen = $bindable(false),
		oauthMediaPickerLoading,
		oauthMediaPickerUploadBusy,
		oauthMediaPickerItemsVm,
		oauthConfirmRotateOpen = $bindable(false),
		oauthConfirmDeleteOpen = $bindable(false),

		onOauthStartCreate,
		onOauthCancelCreate,
		onOauthOpenMediaPicker,
		onOauthClearPicture,
		onOauthSubmitCreate,
		onOauthStartEdit,
		onOauthCancelEdit,
		onOauthSubmitUpdate,
		onOauthRequestRotateSecret,
		onOauthConfirmRotateSecret,
		onOauthCancelRotateConfirm,
		onOauthRequestDeleteApp,
		onOauthConfirmDeleteApp,
		onOauthCancelDeleteConfirm,
		onOauthSetMediaPickerOpen,
		onOauthSelectMediaItem,
		onOauthUploadMediaPickerFiles,
		onCopy,
		developerTab,
		onDeveloperTabChange
	}: Props = $props();
</script>

<div class="space-y-6">
	{#if publicApiEnabled === null}
		<div class="rounded-xl border border-base-300 bg-base-200 p-8 text-center text-sm text-base-content/70">
			Loading developer settings…
		</div>
	{:else if publicApiEnabled === false}
		<div class="rounded-xl border border-warning/40 bg-warning/10 p-6 text-sm text-base-content">
			<p class="font-medium">Public API is not included on your current plan.</p>
			<p class="mt-1 text-base-content/70">
				Upgrade to unlock programmatic access tokens and OAuth app management.
			</p>
		</div>
	{:else}
	<div class="space-y-3">
	<div class="flex items-center justify-between gap-3">
		<div class="min-w-0 flex-1">
			{#if developerTab === 'access'}
				<p class="text-sm text-base-content/70">
					Generate a programmatic token (<code class="text-xs">opo_…</code>) for CI and headless scripts using your
					workspace OAuth app. Create that app on the Apps tab first, then rotate the token here.
				</p>
			{:else if developerTab === 'apps'}
				<p class="text-sm text-base-content/70">
					Register one OAuth application per workspace (redirect URL, client credentials). Required before you
					can generate a programmatic access token on the Access tab. You can also use this app for third-party
					OAuth flows.
				</p>
			{/if}
		</div>

		<div class="inline-flex shrink-0 rounded-full bg-base-200 p-1">
			<button
				type="button"
				class={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
					developerTab === 'access' ? 'bg-primary text-primary-content' : 'text-base-content/70 hover:bg-base-300/50'
				}`}
				onclick={() => onDeveloperTabChange('access')}
			>
				Access
			</button>
			<button
				type="button"
				class={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
					developerTab === 'apps' ? 'bg-primary text-primary-content' : 'text-base-content/70 hover:bg-base-300/50'
				}`}
				onclick={() => onDeveloperTabChange('apps')}
			>
				Apps
			</button>
		</div>
	</div>

	{#if developerTab === 'access' && !cliDeviceLoginNoticeDismissed}
		<HomeAccountNoticeBanner
			iconName={icons.Info.name}
			tone="neutral"
			onDismiss={dismissCliDeviceLoginNotice}
		>
			<p class="text-base-content/90">
				For everyday CLI use, run <code class="text-xs">openquok auth:login</code> — official device login uses the
				hosted auth server and is separate from the programmatic token on this page. You only need an
				<code class="text-xs">opo_…</code> token for CI or headless automation. Follow the
				<a class="link link-primary font-medium" href={cliAuthDocsHref} target="_blank" rel="noopener noreferrer">
					CLI authentication tutorial
				</a>.
			</p>
			{#snippet actions()}
				<Button href={cliAuthDocsHref} variant="outline" size="sm" class="gap-1.5" target="_blank">
					<AbstractIcon name={icons.BookOpen.name} class="size-4" width="16" height="16" />
					Open tutorial
				</Button>
			{/snippet}
		</HomeAccountNoticeBanner>
	{/if}
	</div>

	{#if developerTab === 'access'}
		<UpdateDeveloperAccess
			{programmaticAccessToken}
			{programmaticAccessConfigured}
			{tokenVisible}
			{canRotate}
			{rotating}
			{oauthAppReady}
			{oauthAppLoading}
			{onSetTokenVisible}
			{onRotateToken}
			{onGoToAppsTab}
		/>
	{:else}
		<UpdateDeveloperOauth
			loadForbidden={oauthLoadForbidden}
			forbiddenMessage={oauthForbiddenMessage}
			appVm={oauthAppVm}
			isLoading={oauthIsLoading}
			creating={oauthCreating}
			editing={oauthEditing}
			canManageApps={oauthCanManageApps}
			status={oauthStatus}
			bind:formName={oauthFormName}
			bind:formDescription={oauthFormDescription}
			bind:formRedirectUrl={oauthFormRedirectUrl}
			bind:formPictureId={oauthFormPictureId}
			bind:formPicturePreviewUrl={oauthFormPicturePreviewUrl}
			plaintextClientSecret={oauthPlaintextClientSecret}
			bind:mediaPickerOpen={oauthMediaPickerOpen}
			mediaPickerLoading={oauthMediaPickerLoading}
			mediaPickerUploadBusy={oauthMediaPickerUploadBusy}
			mediaPickerItemsVm={oauthMediaPickerItemsVm}
			bind:confirmRotateOpen={oauthConfirmRotateOpen}
			bind:confirmDeleteOpen={oauthConfirmDeleteOpen}
			onStartCreate={onOauthStartCreate}
			onCancelCreate={onOauthCancelCreate}
			onOpenMediaPicker={onOauthOpenMediaPicker}
			onClearPicture={onOauthClearPicture}
			onSubmitCreate={onOauthSubmitCreate}
			onStartEdit={onOauthStartEdit}
			onCancelEdit={onOauthCancelEdit}
			onSubmitUpdate={onOauthSubmitUpdate}
			onRequestRotateSecret={onOauthRequestRotateSecret}
			onConfirmRotateSecret={onOauthConfirmRotateSecret}
			onCancelRotateConfirm={onOauthCancelRotateConfirm}
			onRequestDeleteApp={onOauthRequestDeleteApp}
			onConfirmDeleteApp={onOauthConfirmDeleteApp}
			onCancelDeleteConfirm={onOauthCancelDeleteConfirm}
			onSetMediaPickerOpen={onOauthSetMediaPickerOpen}
			onSelectMediaItem={onOauthSelectMediaItem}
			onUploadMediaPickerFiles={onOauthUploadMediaPickerFiles}
			onCopy={onCopy}
		/>
	{/if}
	{/if}
</div>
