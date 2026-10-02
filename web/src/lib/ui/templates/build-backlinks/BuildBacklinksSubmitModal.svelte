<script lang="ts">
	import {
		linkDirectorySubmissionFormSchema,
		publicBuildBacklinksPagePresenter
	} from '$lib/link-directory/index';

	import { normalizeHttpUrlInputIfLikely } from '$lib/utils/normalizeHttpUrlInput';
	import { toast } from '$lib/ui/sonner';

	import * as Dialog from '$lib/ui/dialog/index.js';
	import Button from '$lib/ui/buttons/Button.svelte';
	import ProviderHttpUrlInput from '$lib/ui/components/posts/providers/ProviderHttpUrlInput.svelte';

	type Props = {
		open: boolean;
		onOpenChange: (open: boolean) => void;
	};

	let { open = $bindable(false), onOpenChange }: Props = $props();

	let email = $state('');
	let siteUrl = $state('');
	let proposedTitle = $state('');
	let notes = $state('');
	let submitting = $state(false);

	function normalizeSiteUrlOnBlur() {
		const trimmed = siteUrl.trim();
		if (!trimmed) return;
		const normalized = normalizeHttpUrlInputIfLikely(trimmed);
		if (normalized !== siteUrl) siteUrl = normalized;
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		const normalizedSiteUrl = normalizeHttpUrlInputIfLikely(siteUrl.trim());
		if (normalizedSiteUrl !== siteUrl) siteUrl = normalizedSiteUrl;
		const result = linkDirectorySubmissionFormSchema.safeParse({
			email,
			site_url: normalizedSiteUrl,
			proposed_title: proposedTitle,
			notes
		});
		if (!result.success) {
			toast.error(result.error.issues.map((issue) => issue.message).join(' '));
			return;
		}

		submitting = true;
		const response = await publicBuildBacklinksPagePresenter.submitSiteProposal(result.data);
		submitting = false;

		if (!response.ok) {
			toast.error(response.message ?? 'Could not send submission.');
			return;
		}

		toast.success('Thanks — we will review your suggestion.');
		email = '';
		siteUrl = '';
		proposedTitle = '';
		notes = '';
		onOpenChange(false);
	}
</script>

<Dialog.Root {open} onOpenChange={(next) => onOpenChange(next)}>
	<Dialog.Content class="max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Suggest a site</Dialog.Title>
			<Dialog.Description>
				Share a platform where builders can earn links. We review submissions before publishing.
			</Dialog.Description>
		</Dialog.Header>

		<form class="space-y-4" onsubmit={handleSubmit}>
			<div class="form-control w-full">
				<label class="label" for="bb-submit-email">
					<span class="label-text">Email</span>
				</label>
				<input
					id="bb-submit-email"
					type="email"
					class="input input-bordered w-full"
					autocomplete="email"
					bind:value={email}
					required
				/>
			</div>
			<div class="form-control w-full">
				<label class="label" for="bb-submit-url">
					<span class="label-text">Site URL</span>
				</label>
				<ProviderHttpUrlInput
					id="bb-submit-url"
					bind:value={siteUrl}
					placeholder="example.com or https://example.com"
					required
					onblur={normalizeSiteUrlOnBlur}
				/>
			</div>
			<div class="form-control w-full">
				<label class="label" for="bb-submit-title">
					<span class="label-text">Suggested title (optional)</span>
				</label>
				<input id="bb-submit-title" type="text" class="input input-bordered w-full" bind:value={proposedTitle} />
			</div>
			<div class="form-control w-full">
				<label class="label" for="bb-submit-notes">
					<span class="label-text">Notes (optional)</span>
				</label>
				<textarea
					id="bb-submit-notes"
					class="textarea textarea-bordered w-full"
					rows="3"
					bind:value={notes}
				></textarea>
			</div>

			<Dialog.Footer class="gap-2 sm:justify-end">
				<Button type="button" variant="ghost" onclick={() => onOpenChange(false)}>Cancel</Button>
				<Button type="submit" disabled={submitting}>
					{submitting ? 'Sending…' : 'Submit'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
