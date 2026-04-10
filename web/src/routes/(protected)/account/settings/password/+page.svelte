<script lang="ts">
	import { goto } from '$app/navigation';
	import { createForm } from '@tanstack/svelte-form';
	import { toast } from '$lib/ui/sonner';
	import {
		accountChangePasswordFormSchema,
		editorAccountSettingsPresenter,
		UpdateProfileStatus
	} from '$lib/account';
	import { getRootPathAccount } from '$lib/area-protected/getRootPathProtectedArea';
	import { absoluteUrl } from '$lib/utils/path';
	import * as Field from '$lib/ui/field';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent,
		CardFooter
	} from '$lib/ui/card';
	import Button from '$lib/ui/buttons/Button.svelte';

	const isPresenterSubmitting = $derived(editorAccountSettingsPresenter.status === UpdateProfileStatus.UPDATING);

	const accountSettingsUrl = absoluteUrl(`${getRootPathAccount()}/settings`);

	const form = createForm(() => ({
		defaultValues: {
			newPassword: '',
			confirmPassword: ''
		},
		validators: {
			onChange: accountChangePasswordFormSchema
		},
		onSubmit: async ({ value }) => {
			const result = await editorAccountSettingsPresenter.updatePassword(value.newPassword);
			if (result.success) {
				goto(accountSettingsUrl, { replaceState: true });
			}
		}
	}));

	$effect(() => {
		if (editorAccountSettingsPresenter.showToastMessage) {
			const isUpdated = editorAccountSettingsPresenter.status === UpdateProfileStatus.UPDATED;
			if (isUpdated) {
				toast.success(editorAccountSettingsPresenter.toastMessage);
			} else {
				toast.error(editorAccountSettingsPresenter.toastMessage);
			}
			editorAccountSettingsPresenter.showToastMessage = false;
		}
	});

	function handleFormSubmit(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		if (form.state.errors && form.state.errors.length > 0 && form.state.errors[0]) {
			Object.entries(form.state.errors[0] as Record<string, Array<{ message?: string }>>).forEach(
				([, errors]) => {
					errors.forEach((err) => toast.error(err?.message ?? 'Invalid field'));
				}
			);
			return;
		}
		form.handleSubmit();
	}
</script>

<svelte:head>
	<title>
		Change password</title>
</svelte:head>

<div class="mx-auto max-w-xl space-y-6 py-8">
	<h1 class="text-2xl font-bold text-base-content">
		Change password</h1>

	<Card class="border-base-300 bg-base-100">
		<form onsubmit={handleFormSubmit}>
			<CardHeader>
				<CardTitle class="text-base-content">Update password</CardTitle>
				<CardDescription class="text-base-content/70">
					Enter your new password. You must be signed in to change it.
				</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<form.Field name="newPassword">
					{#snippet children(field)}
						<div>
							<Field.Label field={field} for="new-password">New password</Field.Label>
							<input
								id="new-password"
								type="password"
								value={field.state.value}
								onblur={field.handleBlur}
								oninput={(e) => field.handleChange(e.currentTarget.value)}
								class="input input-bordered w-full"
								placeholder="At least 8 characters"
								disabled={isPresenterSubmitting}
								autocomplete="new-password"
								minlength={8}
							/>
							<Field.Error
								errors={field.state.meta.errors as unknown as Array<{ message?: string }>}
							/>
						</div>
					{/snippet}
				</form.Field>
				<form.Field name="confirmPassword">
					{#snippet children(field)}
						<div>
							<Field.Label field={field} for="confirm-password">Confirm new password</Field.Label>
							<input
								id="confirm-password"
								type="password"
								value={field.state.value}
								onblur={field.handleBlur}
								oninput={(e) => field.handleChange(e.currentTarget.value)}
								class="input input-bordered w-full"
								placeholder="Confirm new password"
								disabled={isPresenterSubmitting}
								autocomplete="new-password"
							/>
							<Field.Error
								errors={field.state.meta.errors as unknown as Array<{ message?: string }>}
							/>
						</div>
					{/snippet}
				</form.Field>
			</CardContent>
			<CardFooter class="flex flex-col gap-3 sm:flex-row sm:justify-end">
				<Button href={accountSettingsUrl} variant="ghost" class="order-2 sm:order-1">
					Cancel
				</Button>
				<form.Subscribe
					selector={(state) => ({ isSubmitting: state.isSubmitting })}
				>
					{#snippet children(state)}
						<Button
							type="submit"
							class="order-1 sm:order-2"
							disabled={state.isSubmitting || isPresenterSubmitting}
						>
							{state.isSubmitting || isPresenterSubmitting ? 'Updating…' : 'Change password'}
						</Button>
					{/snippet}
				</form.Subscribe>
			</CardFooter>
		</form>
	</Card>
</div>
