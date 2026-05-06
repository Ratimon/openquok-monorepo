<script lang="ts">
	import type { MediaLibraryItemViewModel } from '$lib/medias/GetMedia.presenter.svelte';
	import { OAuthAppsPresenterStatus } from '$lib/developers/UpsertOAuthApp.presenter.svelte';
	import type { OauthAppViewModel } from '$lib/developers/UpsertOAuthApp.presenter.svelte';

	import UpdateDeveloperAccess from '$lib/ui/components/developer/UpdateDeveloperAccess.svelte';
	import UpdateDeveloperOauth from '$lib/ui/components/developer/UpdateDeveloperOauth.svelte';

	type Props = {
		apiKey: string | null;
		apiKeyVisible: boolean;
		canRotate: boolean;
		rotating: boolean;
		onSetApiKeyVisible: (visible: boolean) => void;
		onRotateApiKey: () => void | Promise<void>;

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

		onCopy: (text: string) => void | Promise<void>;
		developerTab?: 'access' | 'apps';
	};

	let {
		apiKey,
		apiKeyVisible,
		canRotate,
		rotating,
		onSetApiKeyVisible,
		onRotateApiKey,

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
		onCopy,
		developerTab = $bindable<'access' | 'apps'>('access')
	}: Props = $props();
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between gap-3">
		<div>
			<p class="text-sm text-base-content/70">Use your API Key to automate your own account.</p>
			<p class="text-sm text-base-content/70">
				If you’re building a product that schedules posts on behalf of other users, use OAuth Apps.
			</p>
		</div>

		<div class="inline-flex rounded-full bg-base-200 p-1">
			<button
				type="button"
				class={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
					developerTab === 'access' ? 'bg-primary text-primary-content' : 'text-base-content/70 hover:bg-base-300/50'
				}`}
				onclick={() => (developerTab = 'access')}
			>
				Access
			</button>
			<button
				type="button"
				class={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
					developerTab === 'apps' ? 'bg-primary text-primary-content' : 'text-base-content/70 hover:bg-base-300/50'
				}`}
				onclick={() => (developerTab = 'apps')}
			>
				Apps
			</button>
		</div>
	</div>

	{#if developerTab === 'access'}
		<UpdateDeveloperAccess
			apiKey={apiKey}
			apiKeyVisible={apiKeyVisible}
			canRotate={canRotate}
			rotating={rotating}
			{onSetApiKeyVisible}
			{onRotateApiKey}
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
			onCopy={onCopy}
		/>
	{/if}
</div>
