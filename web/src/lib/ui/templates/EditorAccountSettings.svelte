<script lang="ts">
	import type { DatabaseName } from '$lib/core/Image.repository.svelte';
	import type { AccountProfileViewModel } from '$lib/account/EditorAccountSettings.presenter.svelte';
	import {
		accountAvatarDetailsFormSchema,
		accountFullNameFormSchema,
		accountWebsiteFormSchema
	} from '$lib/account/account.types';
	import { avatarDeletePresenter, avatarUploadPresenter } from '$lib/core/index';
	import { createForm } from '@tanstack/svelte-form';
	import { toast } from '$lib/ui/sonner';
	import * as Dialog from '$lib/ui/dialog';
	import * as Field from '$lib/ui/field';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Avatar from '$lib/ui/components/avatar';
	import AvatarUploadForm from '$lib/ui/components/AvatarUploadForm.svelte';
	import SupabaseUserAvatar from '$lib/ui/supabase/SupabaseUserAvatar.svelte';
	import { untrack } from 'svelte';

	type Props = {
		profileVm: AccountProfileViewModel | null;
		loadingProfile: boolean;
		onRequestChangePasswordEmail: () => Promise<{ success: boolean; message: string }>;
		onUpdateProfileDetails: (updates: {
			fullName?: string;
			avatarUrl?: string | null;
			websiteUrl?: string | null;
		}) => Promise<{ success: boolean; message: string }>;
	};

	let { profileVm, loadingProfile, onRequestChangePasswordEmail, onUpdateProfileDetails }: Props =
		$props();

	const displayFullName = $derived(profileVm?.fullName ?? null);
	const displayWebsite = $derived(profileVm?.websiteUrl ?? null);

	let pictureModalOpen = $state(false);
	let nameModalOpen = $state(false);
	let websiteModalOpen = $state(false);
	let sendingChangePasswordEmail = $state(false);

	let avatarUploadRef: AvatarUploadForm | undefined = $state();

	const nameForm = createForm(() => ({
		defaultValues: {
			fullName: ''
		},
		validators: {
			onChange: accountFullNameFormSchema
		},
		onSubmit: async ({ value }) => {
			const result = await onUpdateProfileDetails({ fullName: value.fullName });
			if (result.success) {
				nameModalOpen = false;
			} else {
				toast.error(result.message);
			}
		}
	}));

	const profileDetailsForm = createForm(() => ({
		defaultValues: {
			avatarUrl: ''
		},
		validators: {
			onChange: accountAvatarDetailsFormSchema
		},
		onSubmit: async ({ value }) => {
			let avatarUrl: string | null = value.avatarUrl === '' ? null : value.avatarUrl;
			if (avatarUploadRef?.uploadSelectedFile) {
				const uploaded = await avatarUploadRef.uploadSelectedFile();
				if (uploaded) {
					avatarUrl = uploaded;
				}
			}
			const result = await onUpdateProfileDetails({ avatarUrl });
			if (!result.success) {
				toast.error(result.message);
			} else {
				pictureModalOpen = false;
			}
		}
	}));

	const websiteForm = createForm(() => ({
		defaultValues: {
			websiteUrl: ''
		},
		validators: {
			onChange: accountWebsiteFormSchema
		},
		onSubmit: async ({ value }) => {
			const raw = value.websiteUrl?.trim() ?? '';
			const websiteUrl = raw === '' ? null : raw;
			const result = await onUpdateProfileDetails({ websiteUrl });
			if (result.success) {
				websiteModalOpen = false;
			} else {
				toast.error(result.message);
			}
		}
	}));

	/** Plain value: avoid re-running sync when only form state changes (setFieldValue must not loop the effect). */
	let lastProfileDetailsSyncKey: string | null = null;

	$effect(() => {
		const vm = profileVm;
		if (!vm) {
			lastProfileDetailsSyncKey = null;
			return;
		}
		const key = `${vm.id ?? ''}:${vm.avatarUrl ?? ''}:${vm.websiteUrl ?? ''}`;
		if (key === lastProfileDetailsSyncKey) return;
		lastProfileDetailsSyncKey = key;
		untrack(() => {
			profileDetailsForm.setFieldValue('avatarUrl', vm.avatarUrl ?? '');
		});
	});

	function openNameModal() {
		nameForm.setFieldValue('fullName', displayFullName ?? '');
		nameModalOpen = true;
	}

	function openPictureModal() {
		const path = profileVm?.avatarUrl?.trim() ?? '';
		if (!path) {
			avatarUploadPresenter.clearLoadedPreview();
		}
		profileDetailsForm.setFieldValue('avatarUrl', path);
		pictureModalOpen = true;
	}

	function openWebsiteModal() {
		websiteForm.setFieldValue('websiteUrl', displayWebsite ?? '');
		websiteModalOpen = true;
	}

	function handleWebsiteFormSubmit(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		if (websiteForm.state.errors && websiteForm.state.errors.length > 0 && websiteForm.state.errors[0]) {
			Object.entries(websiteForm.state.errors[0] as Record<string, Array<{ message?: string }>>).forEach(
				([, errors]) => {
					errors.forEach((err) => toast.error(err?.message ?? 'Invalid field'));
				}
			);
			return;
		}
		websiteForm.handleSubmit();
	}

	function handleNameFormSubmit(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		if (nameForm.state.errors && nameForm.state.errors.length > 0 && nameForm.state.errors[0]) {
			Object.entries(nameForm.state.errors[0] as Record<string, Array<{ message?: string }>>).forEach(
				([, errors]) => {
					errors.forEach((err) => toast.error(err?.message ?? 'Invalid field'));
				}
			);
			return;
		}
		nameForm.handleSubmit();
	}

	function handleProfileDetailsSubmit(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		const errs = profileDetailsForm.state.errors;
		if (errs && errs.length > 0 && errs[0]) {
			Object.entries(errs[0] as Record<string, Array<{ message?: string }>>).forEach(([, errors]) => {
				errors.forEach((err) => toast.error(err?.message ?? 'Invalid field'));
			});
			return;
		}
		profileDetailsForm.handleSubmit();
	}

	async function requestChangePasswordEmail() {
		sendingChangePasswordEmail = true;
		await onRequestChangePasswordEmail();
		sendingChangePasswordEmail = false;
	}

	const handleLoadAvatar = async (databaseName: DatabaseName, imageUrl: string) => {
		return avatarUploadPresenter.loadAvatar(databaseName, imageUrl);
	};

	const handleUploadAvatar = async (databaseName: DatabaseName, imageFile: File, uid: string) => {
		return avatarUploadPresenter.uploadAvatar(databaseName, imageFile, uid);
	};

	const handleDeleteAvatar = async (databaseName: DatabaseName, imagePath: string) => {
		await avatarDeletePresenter.delete(databaseName, imagePath);
	};

	async function persistAvatarRemoved() {
		await onUpdateProfileDetails({ avatarUrl: null });
	}
</script>

<section
	class="rounded-lg border border-base-300 bg-base-200 shadow-sm overflow-hidden"
	aria-labelledby="profile-heading"
>
	<p id="profile-description" class="sr-only">
		Manage your profile: full name, password, picture, website.
	</p>
	<div class="divide-y divide-base-300">
		<!-- Full name row -->
		<div
			class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6"
		>
			<div class="min-w-0">
				<h3 class="text-sm font-semibold text-base-content">
					Full name</h3>
				<p class="mt-1 text-sm text-base-content/70">
					{loadingProfile ? 'Loading…' : (displayFullName || '—')}
				</p>
			</div>
			<div class="shrink-0">
				<button
					type="button"
					class="rounded-full border border-base-300 bg-base-100 px-4 py-2 text-sm font-medium text-base-content shadow-sm hover:bg-base-content/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
					onclick={openNameModal}
					disabled={loadingProfile}
				>
					Update full name
				</button>
			</div>
		</div>
		<!-- Password row -->
		<div
			class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6"
		>
			<div class="min-w-0">
				<h3 class="text-sm font-semibold text-base-content">
					Password</h3>
				<p class="mt-1 text-sm text-base-content/70">
					We'll send you an email with a link to change your password.
				</p>
			</div>
			<div class="shrink-0">
				<button
					type="button"
					class="rounded-full border border-base-300 bg-base-100 px-4 py-2 text-sm font-medium text-base-content shadow-sm hover:bg-base-content/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
					onclick={requestChangePasswordEmail}
					disabled={sendingChangePasswordEmail}
				>
					{sendingChangePasswordEmail ? 'Sending…' : 'Change password'}
				</button>
			</div>
		</div>

		<!-- Profile picture row -->
		<div
			class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6"
		>
			<div class="min-w-0">
				<h3 class="text-sm font-semibold text-base-content">
					Avatar</h3>
				{#if loadingProfile}
					<p class="mt-1 text-sm text-base-content/70">
						Loading…</p>
				{:else}
					<div class="mt-1 flex items-center gap-3">
						<Avatar.Root class="size-12 shrink-0 rounded-full border border-base-300 bg-base-100">
							<SupabaseUserAvatar
								url={profileVm?.avatarUrl}
								size={48}
								alt={displayFullName ?? 'Profile picture'}
								imageOnly
							/>
							<Avatar.Fallback>O.O</Avatar.Fallback>
						</Avatar.Root>
						<p class="text-sm text-base-content/70">
							{profileVm?.avatarUrl?.trim() ? 'Custom picture — shown on blog posts.' : 'No picture — optional.'}
						</p>
					</div>
				{/if}
			</div>
			<div class="shrink-0">
				<button
					type="button"
					class="rounded-full border border-base-300 bg-base-100 px-4 py-2 text-sm font-medium text-base-content shadow-sm hover:bg-base-content/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
					onclick={openPictureModal}
					disabled={loadingProfile}
				>
					Update picture
				</button>
			</div>
		</div>

		<!-- Website row -->
		<div
			class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6"
		>
			<div class="min-w-0">
				<h3 class="text-sm font-semibold text-base-content">
					Website</h3>
				<p class="mt-1 text-sm text-base-content/70 break-all">
					{loadingProfile ? 'Loading…' : (displayWebsite?.trim() ? displayWebsite : '—')}
				</p>
			</div>
			<div class="shrink-0">
				<button
					type="button"
					class="rounded-full border border-base-300 bg-base-100 px-4 py-2 text-sm font-medium text-base-content shadow-sm hover:bg-base-content/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
					onclick={openWebsiteModal}
					disabled={loadingProfile}
				>
					Update website
				</button>
			</div>
		</div>
	</div>
</section>

<!-- Update profile picture modal -->
<Dialog.Root bind:open={pictureModalOpen}>
	<Dialog.Content class="max-w-lg">
		<form
			id="picture-form"
			method="dialog"
			onsubmit={handleProfileDetailsSubmit}
			class="space-y-4"
		>
			<Dialog.Header>
				<Dialog.Title>Update avatar</Dialog.Title>
			</Dialog.Header>
			<profileDetailsForm.Field name="avatarUrl">
				{#snippet children(field)}
					<div>
						<Field.Label field={field}>Your picture</Field.Label>
						<p class="mt-1 text-xs text-base-content/60">
							Optional — PNG, JPG, or WebP. Max 4 MB. Shown on blog posts.
						</p>
						<div class="mt-3">
							<input
								type="hidden"
								value={field.state.value}
								onblur={field.handleBlur}
								oninput={(e) => field.handleChange(e.currentTarget.value)}
							/>
							<AvatarUploadForm
								bind:this={avatarUploadRef}
								uid={profileVm?.id ?? ''}
								url={field.state.value}
								size={128}
								onFormTouch={(url) => {
									profileDetailsForm.setFieldValue('avatarUrl', url);
									profileDetailsForm.setFieldMeta('avatarUrl', (prev) => ({
										...prev,
										isValid: true,
										isDirty: true,
										isTouched: true
									}));
								}}
								databaseName="avatars"
								avatarVm={avatarUploadPresenter.avatarVm}
								onLoadAvatar={handleLoadAvatar}
								onUploadAvatar={handleUploadAvatar}
								onToastMessageChange={(show) => {
									avatarUploadPresenter.avatarVm.showToastMessage = show;
								}}
								onFileSelect={() => {
									profileDetailsForm.setFieldMeta('avatarUrl', (prev) => ({
										...prev,
										isValid: true,
										isDirty: true,
										isTouched: true
									}));
								}}
								onFileRemove={() => {
									profileDetailsForm.setFieldMeta('avatarUrl', (prev) => ({
										...prev,
										isValid: true,
										isDirty: true,
										isTouched: true
									}));
								}}
								onDeleteAvatar={handleDeleteAvatar}
								onFormSubmit={persistAvatarRemoved}
								onClearPreview={() => avatarUploadPresenter.clearLoadedPreview()}
							/>
						</div>
						<Field.Error
							errors={field.state.meta.errors as unknown as Array<{ message?: string }>}
						/>
					</div>
				{/snippet}
			</profileDetailsForm.Field>
			<Dialog.Footer>
				<Dialog.Close>
					<Button type="button" variant="ghost">Close</Button>
				</Dialog.Close>
				<profileDetailsForm.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting })}>
					{#snippet children(state)}
						<Button
							type="submit"
							form="picture-form"
							disabled={state.isSubmitting || loadingProfile || !profileVm?.id}
						>
							{state.isSubmitting ? 'Saving…' : 'Save'}
						</Button>
					{/snippet}
				</profileDetailsForm.Subscribe>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Update full name modal -->
<Dialog.Root bind:open={nameModalOpen}>
	<Dialog.Content>
		<form
			id="name-form"
			method="dialog"
			onsubmit={handleNameFormSubmit}
			class="space-y-4"
		>
			<Dialog.Header>
				<Dialog.Title>Update full name</Dialog.Title>
			</Dialog.Header>
			<nameForm.Field name="fullName">
				{#snippet children(field)}
					<div>
						<Field.Label field={field} for="profile-fullname">Full name</Field.Label>
						<input
							id="profile-fullname"
							type="text"
							value={field.state.value}
							onblur={field.handleBlur}
							oninput={(e) => field.handleChange(e.currentTarget.value)}
							class="input input-bordered w-full"
							placeholder="Your name"
							autocomplete="name"
						/>
						<Field.Error
							errors={field.state.meta.errors as unknown as Array<{ message?: string }>}
						/>
					</div>
				{/snippet}
			</nameForm.Field>
			<Dialog.Footer>
				<Dialog.Close>
					<Button type="button" variant="ghost">Close</Button>
				</Dialog.Close>
				<nameForm.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting })}>
					{#snippet children(state)}
						<Button type="submit" form="name-form" disabled={state.isSubmitting}>
							{state.isSubmitting ? 'Saving…' : 'Save'}
						</Button>
					{/snippet}
				</nameForm.Subscribe>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Update website modal -->
<Dialog.Root bind:open={websiteModalOpen}>
	<Dialog.Content>
		<form
			id="website-form"
			method="dialog"
			onsubmit={handleWebsiteFormSubmit}
			class="space-y-4"
		>
			<Dialog.Header>
				<Dialog.Title>Update website</Dialog.Title>
			</Dialog.Header>
			<websiteForm.Field name="websiteUrl">
				{#snippet children(field)}
					<div>
						<Field.Label field={field} for="profile-website-url">Website</Field.Label>
						<p class="mt-1 text-xs text-base-content/60">
							Optional — link shown as your author site on blog posts.
						</p>
						<input
							id="profile-website-url"
							type="url"
							inputmode="url"
							autocomplete="url"
							placeholder="https://example.com"
							value={field.state.value ?? ''}
							onblur={field.handleBlur}
							oninput={(e) => field.handleChange(e.currentTarget.value)}
							class="input input-bordered mt-2 w-full"
						/>
						<Field.Error
							errors={field.state.meta.errors as unknown as Array<{ message?: string }>}
						/>
					</div>
				{/snippet}
			</websiteForm.Field>
			<Dialog.Footer>
				<Dialog.Close>
					<Button type="button" variant="ghost">Close</Button>
				</Dialog.Close>
				<websiteForm.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting })}>
					{#snippet children(state)}
						<Button type="submit" form="website-form" disabled={state.isSubmitting}>
							{state.isSubmitting ? 'Saving…' : 'Save'}
						</Button>
					{/snippet}
				</websiteForm.Subscribe>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
