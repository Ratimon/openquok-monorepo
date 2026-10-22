<script lang="ts">
	import {
		hasDirectoryListingDetailsFieldErrors,
		validateDirectoryListingDetailsForComplete,
		type DirectoryListingDetailsFieldErrors
	} from '$lib/auto-launch/directoryListingDetailsValidation';

	import * as Dialog from '$lib/ui/dialog';
	import Button from '$lib/ui/buttons/Button.svelte';

	export type DirectoryLaunchVariantOption = {
		destinationId: string;
		label: string;
	};

	export type DirectoryListingDetailsFormValues = {
		destinationId: string;
		listingUrl: string;
		listingDofollow: boolean;
		authEmail: string;
	};

	type Props = {
		open?: boolean;
		mode: 'complete' | 'edit';
		siteLabel: string;
		variantOptions: DirectoryLaunchVariantOption[];
		initialDestinationId: string;
		initialListingUrl: string;
		initialListingDofollow: boolean;
		initialAuthEmail: string;
		suggestedAuthEmail: string | null;
		submitting?: boolean;
		submissionId?: string | null;
		onSubmit: (values: DirectoryListingDetailsFormValues) => void | Promise<void>;
		onCancel: () => void;
		onMarkIncomplete?: () => void;
	};

	let {
		open = $bindable(false),
		mode,
		siteLabel,
		variantOptions,
		initialDestinationId,
		initialListingUrl,
		initialListingDofollow,
		initialAuthEmail,
		suggestedAuthEmail,
		submitting = false,
		submissionId = null,
		onSubmit,
		onCancel,
		onMarkIncomplete
	}: Props = $props();

	const showMarkIncomplete = $derived(
		mode === 'edit' && Boolean(submissionId?.trim()) && Boolean(onMarkIncomplete)
	);

	let destinationId = $state('');
	let listingUrl = $state('');
	let listingDofollow = $state(false);
	let authEmail = $state('');
	let fieldErrors = $state<DirectoryListingDetailsFieldErrors>({});

	const requireAllFields = $derived(mode === 'complete');

	$effect(() => {
		if (!open) return;
		destinationId = initialDestinationId;
		listingUrl = initialListingUrl;
		listingDofollow = initialListingDofollow;
		authEmail = initialAuthEmail || suggestedAuthEmail || '';
		fieldErrors = {};
	});

	const title = $derived(
		mode === 'complete' ? `Mark ${siteLabel} launch complete` : `Edit ${siteLabel} listing`
	);

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const trimmedUrl = listingUrl.trim();
		const trimmedEmail = authEmail.trim();

		if (requireAllFields) {
			const errors = validateDirectoryListingDetailsForComplete({
				listingUrl: trimmedUrl,
				authEmail: trimmedEmail
			});
			if (hasDirectoryListingDetailsFieldErrors(errors)) {
				fieldErrors = errors;
				return;
			}
		}

		fieldErrors = {};
		void onSubmit({
			destinationId,
			listingUrl: trimmedUrl,
			listingDofollow,
			authEmail: trimmedEmail
		});
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description>
				{#if requireAllFields}
					Enter the listing URL, whether the link is dofollow, and the email you used on the directory.
					All three are required to mark this launch complete.
				{:else}
					Update listing details from the directory after you submit your product.
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		<form class="mt-4 space-y-4" onsubmit={handleSubmit}>
			{#if variantOptions.length > 1}
				<label class="form-control w-full gap-1">
					<span class="label-text text-sm">Launch path</span>
					<select class="select select-bordered w-full" bind:value={destinationId} required>
						{#each variantOptions as option (option.destinationId)}
							<option value={option.destinationId}>{option.label}</option>
						{/each}
					</select>
				</label>
			{/if}

			<label class="form-control w-full gap-1">
				<span class="label-text text-sm">
					List URL{#if requireAllFields}<span class="text-error"> *</span>{/if}
				</span>
				<input
					class="input input-bordered w-full {fieldErrors.listingUrl ? 'input-error' : ''}"
					type="url"
					placeholder="https://…"
					bind:value={listingUrl}
					autocomplete="url"
					required={requireAllFields}
				/>
				{#if fieldErrors.listingUrl}
					<span class="text-xs text-error">{fieldErrors.listingUrl}</span>
				{/if}
			</label>

			<label class="flex cursor-pointer items-center gap-2">
				<input class="checkbox checkbox-sm" type="checkbox" bind:checked={listingDofollow} />
				<span class="text-sm text-base-content/85">
					Listing link is dofollow{#if requireAllFields}<span class="text-error"> *</span>{/if}
				</span>
			</label>
			<p class="text-xs text-base-content/55 -mt-2">
				{#if requireAllFields}
					Confirm dofollow or leave unchecked for nofollow.
				{:else}
					When unchecked, the listing is treated as nofollow.
				{/if}
			</p>

			<label class="form-control w-full gap-1">
				<span class="label-text text-sm">
					Auth email{#if requireAllFields}<span class="text-error"> *</span>{/if}
				</span>
				<input
					class="input input-bordered w-full {fieldErrors.authEmail ? 'input-error' : ''}"
					type="email"
					placeholder={suggestedAuthEmail ?? 'you@example.com'}
					bind:value={authEmail}
					autocomplete="email"
					required={requireAllFields}
				/>
				{#if fieldErrors.authEmail}
					<span class="text-xs text-error">{fieldErrors.authEmail}</span>
				{:else if suggestedAuthEmail}
					<span class="text-xs text-base-content/55">
						Tip: use the same email you signed up to OpenQuok with ({suggestedAuthEmail}).
					</span>
				{/if}
			</label>

			<Dialog.Footer class="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
				{#if showMarkIncomplete}
					<Button
						type="button"
						variant="red"
						disabled={submitting}
						onclick={() => onMarkIncomplete?.()}
					>
						Mark as incomplete
					</Button>
				{:else}
					<span class="hidden sm:block" aria-hidden="true"></span>
				{/if}
				<div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
					<Button type="button" variant="ghost" onclick={onCancel} disabled={submitting}>
						Cancel
					</Button>
					<Button type="submit" variant="primary" disabled={submitting}>
						{mode === 'complete' ? 'Mark complete' : 'Save'}
					</Button>
				</div>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
