<script lang="ts">
	import type { UpsertOAuthAppsPresenter } from '$lib/developers';
	import { OAuthAppsPresenterStatus } from '$lib/developers';

	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import DeleteModal from '$lib/ui/modals/DeleteModal.svelte';

	type Props = {
		presenter: UpsertOAuthAppsPresenter;
		onCopy: (text: string) => void | Promise<void>;
	};

	let { presenter, onCopy }: Props = $props();
</script>

<div class="space-y-6">
	<p class="text-sm text-base-content/70">
		Create an OAuth app so other users can authorize your product to act on their workspace through Openquok. After
		OAuth2 completes, your server receives a token you can use like an API key on public endpoints.
	</p>

	{#if presenter.loadForbidden}
		<div class="rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-base-content">
			{presenter.forbiddenMessage || 'Only workspace admins can manage OAuth applications.'}
		</div>
	{:else if presenter.appVm === undefined || presenter.isLoading}
		<div class="rounded-xl border border-base-300 bg-base-200 p-8 text-center text-sm text-base-content/70">
			Loading OAuth app…
		</div>
	{:else if !presenter.appVm && !presenter.creating}
		<div class="rounded-xl border border-base-300 bg-base-200 p-6">
			<div class="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h3 class="text-base font-semibold">OAuth application</h3>
					<p class="text-sm text-base-content/70">
						One OAuth app per workspace. You’ll get a client ID and secret for the authorization code flow.
					</p>
				</div>
				<a class="btn btn-outline btn-sm" href="/docs">Docs</a>
			</div>
			<div class="mt-6">
				<Button variant="primary" disabled={!presenter.canManageApps} onclick={() => presenter.startCreate()}>
					Create OAuth app
				</Button>
			</div>
		</div>
	{:else if presenter.creating && !presenter.appVm}
		<div class="rounded-xl border border-base-300 bg-base-200 p-6">
			<h3 class="text-base font-semibold">Create OAuth app</h3>
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
						bind:value={presenter.formName}
						placeholder="My App"
					/>
				</div>
				<div>
					<label class="text-sm font-medium" for="oauth-create-desc">Description</label>
					<textarea
						id="oauth-create-desc"
						class="textarea textarea-bordered mt-1 min-h-20 w-full bg-base-100"
						maxlength={500}
						bind:value={presenter.formDescription}
						placeholder="What your app does"
					></textarea>
				</div>
				<div>
					<span class="text-sm font-medium">Profile image</span>
					<div class="mt-2 flex flex-wrap items-center gap-3">
						{#if presenter.formPicturePreviewUrl}
							<img
								src={presenter.formPicturePreviewUrl}
								alt=""
								class="size-12 rounded-full object-cover"
							/>
						{:else}
							<div class="flex size-12 items-center justify-center rounded-full bg-base-300 text-base-content/50">
								?
							</div>
						{/if}
						<Button variant="outline" type="button" onclick={() => presenter.openMediaPicker()}>
							Choose image
						</Button>
						{#if presenter.formPictureId}
							<Button variant="ghost" type="button" onclick={() => presenter.clearPicture()}>Remove</Button>
						{/if}
					</div>
				</div>
				<div>
					<label class="text-sm font-medium" for="oauth-create-redirect">Redirect URL *</label>
					<input
						id="oauth-create-redirect"
						class="input input-bordered mt-1 w-full bg-base-100"
						bind:value={presenter.formRedirectUrl}
						placeholder="https://yourapp.com/oauth/callback"
					/>
				</div>
				<div class="flex flex-wrap gap-2">
					<Button
						variant="primary"
						disabled={presenter.status === OAuthAppsPresenterStatus.MUTATING}
						onclick={() => presenter.submitCreate()}
					>
						Create
					</Button>
					<Button variant="outline" onclick={() => presenter.cancelCreate()}>Cancel</Button>
				</div>
			</div>
		</div>
	{:else if presenter.appVm}
		{@const app = presenter.appVm}
		<div class="space-y-6">
			<div class="rounded-xl border border-base-300 bg-base-200 p-6">
				<div class="flex flex-wrap items-start justify-between gap-4">
					<div>
						<h3 class="text-base font-semibold">OAuth application</h3>
						<p class="text-sm text-base-content/70">Shown on the user consent screen.</p>
					</div>
					<a class="btn btn-outline btn-sm" href="/docs">Docs</a>
				</div>

				{#if presenter.editing}
					<div class="mt-4 flex flex-col gap-4">
						<div>
							<label class="text-sm font-medium" for="oauth-edit-name">App name *</label>
							<input
								id="oauth-edit-name"
								class="input input-bordered mt-1 w-full bg-base-100"
								maxlength={100}
								bind:value={presenter.formName}
							/>
						</div>
						<div>
							<label class="text-sm font-medium" for="oauth-edit-desc">Description</label>
							<textarea
								id="oauth-edit-desc"
								class="textarea textarea-bordered mt-1 min-h-20 w-full bg-base-100"
								maxlength={500}
								bind:value={presenter.formDescription}
							></textarea>
						</div>
						<div>
							<span class="text-sm font-medium">Profile image</span>
							<div class="mt-2 flex flex-wrap items-center gap-3">
								{#if presenter.formPicturePreviewUrl}
									<img
										src={presenter.formPicturePreviewUrl}
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
								<Button variant="outline" type="button" onclick={() => presenter.openMediaPicker()}>
									Choose image
								</Button>
								{#if presenter.formPictureId}
									<Button variant="ghost" type="button" onclick={() => presenter.clearPicture()}>
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
								bind:value={presenter.formRedirectUrl}
							/>
						</div>
						<div class="flex flex-wrap gap-2">
							<Button
								variant="primary"
								disabled={presenter.status === OAuthAppsPresenterStatus.MUTATING}
								onclick={() => presenter.submitUpdate()}
							>
								Save
							</Button>
							<Button variant="outline" onclick={() => presenter.cancelEdit()}>Cancel</Button>
						</div>
					</div>
				{:else}
					<div class="mt-4 flex flex-col gap-4">
						<div class="flex items-center gap-3">
							{#if app.pictureId}
								<div
									class="flex size-12 items-center justify-center rounded-full bg-base-300 text-xs text-base-content/60"
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
							<p class="text-sm font-medium text-base-content/80">Redirect URL</p>
							<p class="text-sm">{app.redirectUrl}</p>
						</div>
						<Button variant="outline" disabled={!presenter.canManageApps} onclick={() => presenter.startEdit()}>
							Edit app
						</Button>
					</div>
				{/if}
			</div>

			{#if !presenter.editing}
				<div class="rounded-xl border border-base-300 bg-base-200 p-6">
					<h3 class="text-base font-semibold">Credentials</h3>
					<div class="mt-4 space-y-4">
						<div>
							<p class="text-sm font-medium text-base-content/80">Client ID</p>
							<div class="mt-1 rounded-lg border border-base-300 bg-base-100 p-3 font-mono text-sm break-all">
								{app.clientId}
							</div>
						</div>
						<div>
							<p class="text-sm font-medium text-base-content/80">Client secret</p>
							<div class="mt-1 rounded-lg border border-base-300 bg-base-100 p-3 font-mono text-sm break-all">
								{#if presenter.plaintextClientSecret}
									{presenter.plaintextClientSecret}
								{:else}
									<span class="text-base-content/60">Secret is only shown when you create the app or rotate it.</span>
								{/if}
							</div>
						</div>
						<div class="flex flex-wrap gap-2">
							<Button variant="outline" onclick={() => app.clientId && onCopy(app.clientId)}>Copy client ID</Button>
							{#if presenter.plaintextClientSecret}
								<Button
									variant="outline"
									onclick={() => presenter.plaintextClientSecret && onCopy(presenter.plaintextClientSecret)}
								>
									Copy secret
								</Button>
							{/if}
							<Button
								variant="outline"
								disabled={!presenter.canManageApps}
								onclick={() => presenter.requestRotateSecret()}
							>
								Rotate secret
							</Button>
							<Button
								variant="outline"
								class="border-error/50 text-error hover:bg-error/10"
								disabled={!presenter.canManageApps}
								onclick={() => presenter.requestDeleteApp()}
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

<Dialog.Root open={presenter.mediaPickerOpen} onOpenChange={(o: boolean) => presenter.setMediaPickerOpen(o)}>
	<Dialog.Content class="max-h-[85vh] max-w-2xl overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Choose image</Dialog.Title>
			<Dialog.Description>Pick an image from this workspace’s media library.</Dialog.Description>
		</Dialog.Header>
		{#if presenter.mediaPickerLoading}
			<p class="py-8 text-center text-sm text-base-content/70">Loading…</p>
		{:else if presenter.mediaPickerItemsVm.length === 0}
			<p class="py-8 text-center text-sm text-base-content/70">No images yet. Upload some in Media Library first.</p>
		{:else}
			<div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
				{#each presenter.mediaPickerItemsVm as item (item.id)}
					<button
						type="button"
						class="overflow-hidden rounded-lg border border-base-300 bg-base-100 hover:ring-2 hover:ring-primary"
						onclick={() => presenter.selectMediaItem(item)}
					>
						<img
							src={item.thumbnailPublicUrl ?? item.publicUrl ?? item.path}
							alt={item.name}
							class="aspect-square w-full object-cover"
						/>
					</button>
				{/each}
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<DeleteModal
	bind:open={presenter.confirmRotateOpen}
	title="Rotate client secret?"
	description="This generates a new client secret and invalidates the old one. Integrations using the old secret will stop working until you update them."
	confirmLabel="Rotate"
	cancelLabel="Cancel"
	onConfirm={() => presenter.confirmRotateSecret()}
	onCancel={() => presenter.cancelRotateConfirm()}
/>

<DeleteModal
	bind:open={presenter.confirmDeleteOpen}
	title="Delete OAuth app?"
	description="This deletes the OAuth app and revokes tokens issued to users. This cannot be undone."
	confirmLabel="Delete"
	cancelLabel="Cancel"
	onConfirm={() => presenter.confirmDeleteApp()}
	onCancel={() => presenter.cancelDeleteConfirm()}
/>
