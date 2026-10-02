<script lang="ts">
	import type { LinkDirectorySubmissionDto } from '$lib/link-directory/link-directory-admin.types';
	import { linkDirectoryRepository } from '$lib/link-directory/index';

	import { toast } from '$lib/ui/sonner';

	import Button from '$lib/ui/buttons/Button.svelte';
	import {
		Root as Table,
		Body as TableBody,
		Cell as TableCell,
		Head as TableHead,
		Header as TableHeader,
		Row as TableRow
	} from '$lib/ui/table';

	type Props = {
		submissionsVm: LinkDirectorySubmissionDto[];
		onReviewed: (submissionId: string, status: string) => void | Promise<void>;
	};

	let { submissionsVm, onReviewed }: Props = $props();

	let reviewingId = $state<string | null>(null);

	async function review(submissionId: string, status: 'approved' | 'rejected') {
		reviewingId = submissionId;
		const result = await linkDirectoryRepository.reviewSubmission(submissionId, status);
		reviewingId = null;
		if (!result.ok) {
			toast.error(result.error ?? 'Failed to update submission.');
			return;
		}
		toast.success(`Submission marked ${status}.`);
		await onReviewed(submissionId, status);
	}
</script>

<Table containerClass="mt-6 w-full border border-base-300 rounded-xl bg-base-100">
	<TableHeader>
		<TableRow>
			<TableHead>Status</TableHead>
			<TableHead>Email</TableHead>
			<TableHead>Site URL</TableHead>
			<TableHead>Title</TableHead>
			<TableHead>Submitted</TableHead>
			<TableHead class="w-48">Review</TableHead>
		</TableRow>
	</TableHeader>
	<TableBody>
		{#each submissionsVm as row (row.id)}
			<TableRow>
				<TableCell>
					<span class="badge badge-sm capitalize">{row.status}</span>
				</TableCell>
				<TableCell class="text-sm">{row.email}</TableCell>
				<TableCell class="text-sm max-w-xs truncate">
					<a href={row.siteUrl} class="link" target="_blank" rel="noopener noreferrer">{row.siteUrl}</a>
				</TableCell>
				<TableCell class="text-sm">{row.proposedTitle ?? '—'}</TableCell>
				<TableCell class="text-xs text-base-content/70">{new Date(row.createdAt).toLocaleString()}</TableCell>
				<TableCell>
					{#if row.status === 'pending'}
						<div class="flex gap-2">
							<Button
								size="sm"
								variant="primary"
								disabled={reviewingId === row.id}
								onclick={() => review(row.id, 'approved')}>Approve</Button
							>
							<Button
								size="sm"
								variant="outline"
								disabled={reviewingId === row.id}
								onclick={() => review(row.id, 'rejected')}>Reject</Button
							>
						</div>
					{:else}
						<span class="text-xs text-base-content/60">—</span>
					{/if}
				</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</Table>
