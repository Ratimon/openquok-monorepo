<script lang="ts">
	import {
		accountUsernameFormSchema,
		profileRepository,
		type AccountUsernameFormSchemaType
	} from '$lib/account';
	import { getRootPathPublicCreator } from '$lib/area-public/constants/getRootPathPublicCreators';
	import { createForm } from '@tanstack/svelte-form';
	import { onMount } from 'svelte';
	import { toast } from '$lib/ui/sonner';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Field from '$lib/ui/field';

	type Props = {
		suggestedUsername?: string;
		submitLabel?: string;
		onSuccess?: (username: string) => void | Promise<void>;
	};

	let { suggestedUsername = '', submitLabel = 'Continue', onSuccess }: Props = $props();

	/** Captured once at mount — parent only renders this form after the suggestion is loaded. */
	const initialUsername = suggestedUsername;

	let checkingAvailability = $state(false);
	let availabilityHint = $state<string | null>(null);
	let availabilityOk = $state<boolean | null>(null);
	let availabilityTimer: ReturnType<typeof setTimeout> | null = null;

	const form = createForm(() => ({
		defaultValues: {
			username: initialUsername
		} satisfies AccountUsernameFormSchemaType,
		validators: {
			onChange: accountUsernameFormSchema
		},
		onSubmit: async ({ value }) => {
			const result = await profileRepository.updateProfile({ username: value.username });
			if (!result.success) {
				toast.error(result.message);
				return;
			}
			await onSuccess?.(value.username);
		}
	}));

	function previewPathForUsername(username: string | undefined): string | null {
		const value = username?.trim() ?? '';
		if (!value || !accountUsernameFormSchema.shape.username.safeParse(value).success) {
			return null;
		}
		return `/${getRootPathPublicCreator(value)}`;
	}

	async function runAvailabilityCheck(username: string): Promise<void> {
		const parsed = accountUsernameFormSchema.shape.username.safeParse(username);
		if (!parsed.success) {
			availabilityHint = null;
			availabilityOk = null;
			return;
		}
		checkingAvailability = true;
		const result = await profileRepository.checkUsernameAvailable(parsed.data);
		checkingAvailability = false;
		if (!result) {
			availabilityHint = 'Could not check availability. Try again.';
			availabilityOk = false;
			return;
		}
		availabilityOk = result.available;
		availabilityHint = result.available
			? 'Username is available.'
			: (result.message ?? 'Username is not available.');
	}

	function scheduleAvailabilityCheck(username: string): void {
		if (availabilityTimer) clearTimeout(availabilityTimer);
		availabilityTimer = setTimeout(() => {
			void runAvailabilityCheck(username);
		}, 350);
	}

	onMount(() => {
		if (initialUsername.trim()) {
			scheduleAvailabilityCheck(initialUsername);
		}
	});
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		e.stopPropagation();
		void form.handleSubmit();
	}}
	class="space-y-4"
>
	<p class="text-sm text-base-content/80">
		Pick a public username for your creator profile and listing URLs — only lowercase letters, numbers, and hyphens.
	</p>

	<form.Field name="username">
		{#snippet children(field)}
			{@const previewPath = previewPathForUsername(field.state.value)}
			<div>
				<Field.Label field={field} for="claim-username">Username</Field.Label>
				<input
					id="claim-username"
					type="text"
					value={field.state.value}
					onblur={field.handleBlur}
					oninput={(e) => {
						const next = e.currentTarget.value;
						field.handleChange(next);
						scheduleAvailabilityCheck(next);
					}}
					class="input input-bordered w-full"
					placeholder="your-name"
					autocomplete="username"
					spellcheck="false"
				/>
				<Field.Error errors={field.state.meta.errors as unknown as Array<{ message?: string }>} />
				{#if checkingAvailability}
					<p class="mt-1 text-xs text-base-content/60">Checking availability…</p>
				{:else if availabilityHint}
					<p
						class="mt-1 text-xs {availabilityOk ? 'text-success' : 'text-error'}"
					>
						{availabilityHint}
					</p>
				{/if}
				{#if previewPath}
					<p class="mt-2 text-xs text-base-content/70">
						Your profile: <span class="font-mono text-primary">{previewPath}</span>
					</p>
				{/if}
			</div>
		{/snippet}
	</form.Field>

	<form.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting, canSubmit: state.canSubmit })}>
		{#snippet children(state)}
			<Button type="submit" class="w-full" disabled={state.isSubmitting || !state.canSubmit}>
				{state.isSubmitting ? 'Saving…' : submitLabel}
			</Button>
		{/snippet}
	</form.Subscribe>
</form>
