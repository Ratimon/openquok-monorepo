<script lang="ts">
	import { OAuthAppsPresenterStatus } from '$lib/developers';
	import type { MediaLibraryItemViewModel } from '$lib/medias/GetMedia.presenter.svelte';
	import type { OauthAppViewModel } from '$lib/developers/UpsertOAuthApp.presenter.svelte';

	import { icons } from '$data/icons';
	import Button from '$lib/ui/buttons/Button.svelte';
	import CopyBlock from '$lib/ui/components/CopyBlock.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import { Dropzone } from '$lib/ui/dropzone';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import DeleteModal from '$lib/ui/modals/DeleteModal.svelte';

	type Props = {
		loadForbidden: boolean;
		forbiddenMessage: string;

		appVm: OauthAppViewModel | null | undefined;
		isLoading: boolean;
		creating: boolean;
		editing: boolean;
		canManageApps: boolean;
		status: OAuthAppsPresenterStatus;

		formName: string;
		formDescription: string;
		formRedirectUrl: string;
		formPictureId: string | null;
		formPicturePreviewUrl: string | null;

		plaintextClientSecret: string | null;

		mediaPickerOpen: boolean;
		mediaPickerLoading: boolean;
		mediaPickerUploadBusy: boolean;
		mediaPickerItemsVm: MediaLibraryItemViewModel[];

		confirmRotateOpen: boolean;
		confirmDeleteOpen: boolean;

		onStartCreate: () => void;
		onCancelCreate: () => void;
		onOpenMediaPicker: () => void | Promise<void>;
		onClearPicture: () => void;
		onSubmitCreate: () => void | Promise<void>;

		onStartEdit: () => void;
		onCancelEdit: () => void;
		onSubmitUpdate: () => void | Promise<void>;

		onRequestRotateSecret: () => void;
		onConfirmRotateSecret: () => void | Promise<void>;
		onCancelRotateConfirm: () => void;

		onRequestDeleteApp: () => void;
		onConfirmDeleteApp: () => void | Promise<void>;
		onCancelDeleteConfirm: () => void;

		onSetMediaPickerOpen: (open: boolean) => void;
		onSelectMediaItem: (vm: MediaLibraryItemViewModel) => void;
		onUploadMediaPickerFiles: (files: FileList | null) => void | Promise<void>;

		onCopy: (text: string) => void | Promise<void>;
	};

	let {
		loadForbidden,
		forbiddenMessage,
		appVm,
		isLoading,
		creating,
		editing,
		canManageApps,
		status,
		formName = $bindable(''),
		formDescription = $bindable(''),
		formRedirectUrl = $bindable(''),
		formPictureId = $bindable<string | null>(null),
		formPicturePreviewUrl = $bindable<string | null>(null),
		plaintextClientSecret,
		mediaPickerOpen = $bindable(false),
		mediaPickerLoading,
		mediaPickerUploadBusy,
		mediaPickerItemsVm,
		confirmRotateOpen = $bindable(false),
		confirmDeleteOpen = $bindable(false),
		onStartCreate,
		onCancelCreate,
		onOpenMediaPicker,
		onClearPicture,
		onSubmitCreate,
		onStartEdit,
		onCancelEdit,
		onSubmitUpdate,
		onRequestRotateSecret,
		onConfirmRotateSecret,
		onCancelRotateConfirm,
		onRequestDeleteApp,
		onConfirmDeleteApp,
		onCancelDeleteConfirm,
		onSetMediaPickerOpen,
		onSelectMediaItem,
		onUploadMediaPickerFiles,
		onCopy
	}: Props = $props();

	const mediaPickerBusy = $derived(mediaPickerLoading || mediaPickerUploadBusy);
</script>

<div class="space-y-6">
	{#if loadForbidden}
		<div class="rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-base-content">
			{forbiddenMessage || 'Only workspace admins can manage OAuth applications.'}
		</div>
	{:else if appVm === undefined || isLoading}
		<div class="rounded-xl border border-base-300 bg-base-200 p-8 text-center text-sm text-base-content/70">
			Loading OAuth app…
		</div>
	{:else if !appVm && !creating}
		<div class="rounded-xl border border-base-300 bg-base-200 p-6">
			<div class="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h3 class="text-base font-semibold">
						OAuth application
					</h3>
					<p class="text-sm text-base-content/70">
						One OAuth app per workspace. You’ll get a client ID and secret for the authorization code flow.
					</p>
				</div>
				<Button
					variant="ghost"
					size="sm"
					href="/docs/developer-guidelines/oauth2-authentication"
				>
					Read more ..
				</Button>
			</div>
			<div class="mt-6">
				<Button variant="primary" disabled={!canManageApps} onclick={() => onStartCreate()}>
					Create OAuth app
				</Button>
			</div>
		</div>
	{:else if creating && !appVm}
		<div class="rounded-xl border border-base-300 bg-base-200 p-6">
			<h3 class="text-base font-semibold">
				Create OAuth app
			</h3>
			<p class="mt-1 text-sm text-base-content/70">
				The client secret is shown only once. Store it securely on your server.
			</p>
			<div class="mt-4 flex flex-col gap-4">
				<div>
					<label class="text-sm font-medium" for="oauth-create-name">App name *</label>
					<input
						id="oauth-create-name"
						class="input input-bordered mt-1 w-full bg-base-100"
						maxlength={100}
						bind:value={formName}
						placeholder="My App"
					/>
				</div>
				<div>
					<label class="text-sm font-medium" for="oauth-create-desc">Description</label>
					<textarea
						id="oauth-create-desc"
						class="textarea textarea-bordered mt-1 min-h-20 w-full bg-base-100"
						maxlength={500}
						bind:value={formDescription}
						placeholder="What your app does"
					></textarea>
				</div>
				<div>
					<span class="text-sm font-medium">Profile image</span>
					<div class="mt-2 flex flex-wrap items-center gap-3">
						{#if formPicturePreviewUrl}
							<img
								src={formPicturePreviewUrl}
								alt=""
								class="size-12 rounded-full object-cover"
							/>
						{:else}
							<div class="flex size-12 items-center justify-center rounded-full bg-base-300 text-base-content/50">
								?
							</div>
						{/if}
						<Button variant="outline" type="button" onclick={() => onOpenMediaPicker()}>
							Choose image
						</Button>
						{#if formPictureId}
							<Button variant="ghost" type="button" onclick={() => onClearPicture()}>Remove</Button>
						{/if}
					</div>
				</div>
				<div>
					<label class="text-sm font-medium" for="oauth-create-redirect">
						Redirect URL *
					</label>
					<input
						id="oauth-create-redirect"
						class="input input-bordered mt-1 w-full bg-base-100"
						bind:value={formRedirectUrl}
						placeholder="https://yourapp.com/oauth/callback"
					/>
				</div>
				<div class="flex flex-wrap gap-2">
					<Button
						variant="primary"
						disabled={status === OAuthAppsPresenterStatus.MUTATING}
						onclick={() => onSubmitCreate()}
					>
						Create
					</Button>
					<Button
						variant="ghost"
						onclick={() => onCancelCreate()}>
						Cancel
					</Button>
				</div>
			</div>
		</div>
	{:else if appVm}
		{@const app = appVm}
		<div class="space-y-6">
			<div class="rounded-xl border border-base-300 bg-base-200 p-6">
				<div class="flex flex-wrap items-start justify-between gap-4">
					<div>
						<h3 class="text-base font-semibold">
							OAuth application
						</h3>
						<p class="text-sm text-base-content/70">
							Shown on the user consent screen.
						</p>
					</div>
					<Button
						variant="ghost"
						size="sm"
						href="/docs/developer-guidelines/oauth2-authentication"
					>
						Docs
					</Button>
				</div>

				{#if editing}
					<div class="mt-4 flex flex-col gap-4">
						<div>
							<label class="text-sm font-medium" for="oauth-edit-name">App name *</label>
							<input
								id="oauth-edit-name"
								class="input input-bordered mt-1 w-full bg-base-100"
								maxlength={100}
								bind:value={formName}
							/>
						</div>
						<div>
							<label class="text-sm font-medium" for="oauth-edit-desc">Description</label>
							<textarea
								id="oauth-edit-desc"
								class="textarea textarea-bordered mt-1 min-h-20 w-full bg-base-100"
								maxlength={500}
								bind:value={formDescription}
							></textarea>
						</div>
						<div>
							<span class="text-sm font-medium">
								Profile image
							</span>
							<div class="mt-2 flex flex-wrap items-center gap-3">
								{#if formPicturePreviewUrl}
									<img
										src={formPicturePreviewUrl}
										alt=""
										class="size-12 rounded-full object-cover"
									/>
								{:else if app.pictureThumbnailPublicUrl || app.picturePublicUrl}
									<img
										src={app.pictureThumbnailPublicUrl ?? app.picturePublicUrl ?? ''}
										alt=""
										class="size-12 rounded-full object-cover"
									/>
								{:else if app.pictureId}
									<div
										class="flex size-12 items-center justify-center rounded-full bg-base-300 text-xs text-base-content/60"
									>
										Icon
									</div>
								{:else}
									<div class="flex size-12 items-center justify-center rounded-full bg-base-300 text-base-content/50">
										?
									</div>
								{/if}
								<Button
									variant="secondary"
									type="button" onclick={() => onOpenMediaPicker()}
								>
									Choose image
								</Button>
								{#if formPictureId}
									<Button
										variant="warning"
										type="button"
										onclick={() => onClearPicture()
									}>
										Remove
									</Button>
								{/if}
							</div>
						</div>
						<div>
							<label class="text-sm font-medium" for="oauth-edit-redirect">Redirect URL *</label>
							<input
								id="oauth-edit-redirect"
								class="input input-bordered mt-1 w-full bg-base-100"
								bind:value={formRedirectUrl}
							/>
						</div>
						<div class="flex flex-wrap gap-2">
							<Button
								variant="primary"
								disabled={status === OAuthAppsPresenterStatus.MUTATING}
								onclick={() => onSubmitUpdate()}
							>
								Save
							</Button>
							<Button
								variant="ghost"
								onclick={() => onCancelEdit()}
							>
								Cancel
							</Button>
						</div>
					</div>
				{:else}
					<div class="mt-4 flex flex-col gap-4">
						<div class="flex items-center gap-3">
							{#if app.pictureThumbnailPublicUrl || app.picturePublicUrl}
								<img
									src={app.pictureThumbnailPublicUrl ?? app.picturePublicUrl ?? ''}
									alt=""
									class="size-12 shrink-0 rounded-full object-cover"
								/>
							{:else if app.pictureId}
								<div
									class="flex size-12 shrink-0 items-center justify-center rounded-full bg-base-300 text-xs text-base-content/60"
									title="App icon (media library)"
								>
									Icon
								</div>
							{:else}
								<div
									class="flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-base-300 text-lg font-semibold text-base-content/70"
								>
									{app.name?.[0]?.toUpperCase() ?? '?'}
								</div>
							{/if}
							<div>
								<p class="font-medium">{app.name}</p>
								{#if app.description}
									<p class="text-sm text-base-content/70">{app.description}</p>
								{/if}
							</div>
						</div>
						<div>
							<p class="text-sm font-medium text-base-content/80">
								Redirect URL
							</p>
							<p class="text-sm">
								{app.redirectUrl}
							</p>
						</div>
						<Button
							variant="primary"
							disabled={!canManageApps}
							onclick={() => onStartEdit()}
						>
							Edit app
						</Button>
					</div>
				{/if}
			</div>

			{#if !editing}
				<div class="rounded-xl border border-base-300 bg-base-200 p-6">
					<h3 class="text-base font-semibold">Credentials</h3>
					<div class="mt-4 space-y-4">
						<div>
							<p class="text-sm font-medium text-base-content/80">
								Client ID
							</p>
							<CopyBlock
								text={app.clientId}
								boxClass="mt-1 rounded-lg border border-base-300 p-3"
								background="bg-base-100"
								copiedBackground="bg-success/10"
								class="font-mono text-sm break-all"
								copiedColor="text-success"
							/>
						</div>
						<div>
							<p class="text-sm font-medium text-base-content/80">Client secret</p>
							{#if plaintextClientSecret}
								<CopyBlock
									text={plaintextClientSecret}
									boxClass="mt-1 rounded-lg border border-base-300 p-3"
									background="bg-base-100"
									copiedBackground="bg-success/10"
									class="font-mono text-sm break-all"
									copiedColor="text-success"
								/>
							{:else}
								<div class="mt-1 rounded-lg border border-base-300 bg-base-100 p-3 text-sm">
									<span class="text-base-content/60">
										Secret is only shown when you create the app or rotate it.
									</span>
								</div>
							{/if}
						</div>
						<div class="flex flex-wrap gap-2">
							<Button
								variant="primary"
								onclick={() => app.clientId && onCopy(app.clientId)}>
								Copy client ID
							</Button>
							{#if plaintextClientSecret}
								<Button
									variant="secondary"
									onclick={() => plaintextClientSecret && onCopy(plaintextClientSecret)}
								>
									Copy secret
								</Button>
							{/if}
							<Button
								variant="warning"
								disabled={!canManageApps}
								onclick={() => onRequestRotateSecret()}
							>
								Rotate secret
							</Button>
							<Button
								variant="red"
								disabled={!canManageApps}
								onclick={() => onRequestDeleteApp()}
							>
								Delete app
							</Button>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<Dialog.Root open={mediaPickerOpen} onOpenChange={(o: boolean) => onSetMediaPickerOpen(o)}>
	<Dialog.Content
		class="max-h-[85vh] max-w-2xl gap-5 overflow-y-auto"
		showCloseButton={!mediaPickerUploadBusy}
		onOpenAutoFocus={(e) => e.preventDefault()}
	>
		<Dialog.Header>
			<Dialog.Title>Choose image</Dialog.Title>
			<Dialog.Description class="text-base-content/75 text-sm">
				Upload a new image or pick one from this workspace’s media library.
			</Dialog.Description>
		</Dialog.Header>

		<Dropzone
			accept="image/*"
			multiple
			disabled={mediaPickerBusy}
			class="border-primary/25 hover:border-primary/40 bg-base-200/50 h-40 min-h-36 cursor-pointer border-dashed disabled:cursor-not-allowed disabled:opacity-50"
			onChange={(e) => {
				const t = e.currentTarget as HTMLInputElement;
				void onUploadMediaPickerFiles(t.files);
				t.value = '';
			}}
			onDrop={(e) => {
				const list = e.dataTransfer?.files ?? null;
				if (list?.length) void onUploadMediaPickerFiles(list);
			}}
		>
			<div class="text-base-content/80 pointer-events-none flex flex-col items-center gap-2 px-4 text-center">
				{#if mediaPickerUploadBusy}
					<span class="loading loading-spinner loading-lg text-primary"></span>
					<span class="text-sm font-medium">Uploading…</span>
				{:else}
					<span class="relative inline-flex size-10 items-center justify-center text-primary">
						<AbstractIcon name={icons.Image.name} class="size-10" width="40" height="40" />
					</span>
					<div class="space-y-0.5">
						<p class="text-sm font-medium">Drop an image here</p>
						<p class="text-base-content/60 text-xs">or click to browse</p>
					</div>
				{/if}
			</div>
		</Dropzone>

		{#if mediaPickerLoading && mediaPickerItemsVm.length === 0}
			<p class="text-center text-sm text-base-content/70">Loading library…</p>
		{:else if mediaPickerItemsVm.length > 0}
			<p class="text-xs font-medium text-base-content/70">Or choose from library</p>
			<div class="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
				{#each mediaPickerItemsVm as item (item.id)}
					<button
						type="button"
						class="overflow-hidden rounded-lg border border-base-300 bg-base-100 hover:ring-2 hover:ring-primary disabled:opacity-50"
						disabled={mediaPickerBusy}
						onclick={() => onSelectMediaItem(item)}
					>
						<img
							src={item.thumbnailPublicUrl ?? item.publicUrl ?? item.path}
							alt={item.name}
							class="aspect-square w-full object-cover"
						/>
					</button>
				{/each}
			</div>
		{:else if !mediaPickerLoading}
			<p class="text-center text-xs text-base-content/60">
				No images in the library yet — upload above to add one.
			</p>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<DeleteModal
	bind:open={confirmRotateOpen}
	title="Rotate client secret?"
	description="This generates a new client secret and invalidates the old one. Integrations using the old secret will stop working until you update them."
	confirmLabel="Rotate"
	cancelLabel="Cancel"
	onConfirm={() => onConfirmRotateSecret()}
	onCancel={() => onCancelRotateConfirm()}
/>

<DeleteModal
	bind:open={confirmDeleteOpen}
	title="Delete OAuth app?"
	description="This deletes the OAuth app and revokes tokens issued to users. This cannot be undone."
	confirmLabel="Delete"
	cancelLabel="Cancel"
	onConfirm={() => onConfirmDeleteApp()}
	onCancel={() => onCancelDeleteConfirm()}
/>
