<script lang="ts">
	import type { AutoLaunchProductProfileDto } from '$lib/auto-launch/auto-launch.types';

	import { autoLaunchProductProfileFormSchema } from '$lib/auto-launch';
	import { icons } from '$data/icons';
	import { toast } from '$lib/ui/sonner';

	import * as Dialog from '$lib/ui/dialog';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		open?: boolean;
		initial?: Partial<AutoLaunchProductProfileDto> | null;
		submitting?: boolean;
		title?: string;
		onSubmit: (values: {
			name: string;
			tagline: string | null;
			description: string | null;
			websiteUrl: string | null;
			logoUrl: string | null;
			integrationCustomerId?: string | null;
		}) => void | Promise<void>;
		onCancel?: () => void;
	};

	let {
		open = $bindable(false),
		initial = null,
		submitting = false,
		title = 'Product profile',
		onSubmit,
		onCancel
	}: Props = $props();

	let name = $state('');
	let tagline = $state('');
	let description = $state('');
	let websiteUrl = $state('');
	let logoUrl = $state('');

	$effect(() => {
		if (!open) return;
		name = initial?.name ?? '';
		tagline = initial?.tagline ?? '';
		description = initial?.description ?? '';
		websiteUrl = initial?.websiteUrl ?? '';
		logoUrl = initial?.logoUrl ?? '';
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		const result = autoLaunchProductProfileFormSchema.safeParse({
			name,
			tagline,
			description,
			websiteUrl,
			logoUrl,
			integrationCustomerId: initial?.integrationCustomerId ?? null
		});
		if (!result.success) {
			toast.error(result.error.issues.map((i) => i.message).join(' '));
			return;
		}
		await onSubmit({
			name: result.data.name,
			tagline: result.data.tagline,
			description: result.data.description,
			websiteUrl: result.data.websiteUrl,
			logoUrl: result.data.logoUrl,
			integrationCustomerId: result.data.integrationCustomerId ?? null
		});
	}

	function handleCancel() {
		if (submitting) return;
		open = false;
		onCancel?.();
	}
</script>

<Dialog.Root
	bind:open
	onOpenChange={(next) => {
		if (!next && submitting) {
			open = true;
			return;
		}
		if (!next) onCancel?.();
	}}
>
	<Dialog.Content class="max-w-lg gap-4" showCloseButton={!submitting}>
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description class="text-sm text-base-content/70">
				These fields are used when the extension fills directory submission forms.
			</Dialog.Description>
		</Dialog.Header>

		<form class="space-y-3" onsubmit={(e) => void handleSubmit(e)}>
			<label class="form-control w-full gap-1">
				<span class="text-sm font-medium text-base-content">Product name</span>
				<input
					class="input input-bordered w-full"
					type="text"
					bind:value={name}
					required
					maxlength={200}
					disabled={submitting}
				/>
			</label>
			<label class="form-control w-full gap-1">
				<span class="text-sm font-medium text-base-content">Tagline</span>
				<input
					class="input input-bordered w-full"
					type="text"
					bind:value={tagline}
					maxlength={500}
					disabled={submitting}
				/>
			</label>
			<label class="form-control w-full gap-1">
				<span class="text-sm font-medium text-base-content">Description</span>
				<textarea
					class={cn('textarea textarea-bordered w-full min-h-24')}
					bind:value={description}
					disabled={submitting}
				></textarea>
			</label>
			<label class="form-control w-full gap-1">
				<span class="text-sm font-medium text-base-content">Website URL</span>
				<input
					class="input input-bordered w-full"
					type="url"
					bind:value={websiteUrl}
					placeholder="https://"
					disabled={submitting}
				/>
			</label>
			<label class="form-control w-full gap-1">
				<span class="text-sm font-medium text-base-content">Logo URL</span>
				<input
					class="input input-bordered w-full"
					type="url"
					bind:value={logoUrl}
					placeholder="https://"
					disabled={submitting}
				/>
			</label>

			<Dialog.Footer class="gap-2 pt-2 sm:gap-2">
				<Button type="button" variant="outline" disabled={submitting} onclick={handleCancel}>
					Cancel
				</Button>
				<Button type="submit" disabled={submitting}>
					{#if submitting}
						<AbstractIcon
							name={icons.LoaderCircle.name}
							class="mr-2 h-4 w-4 animate-spin"
							width="16"
							height="16"
						/>
						Saving…
					{:else}
						Save profile
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
