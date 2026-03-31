<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from '$lib/ui/sonner';
	import { adminEmailManagerPagePresenter } from '$lib/area-admin';
	import { createPagination } from '$lib/ui/helpers/createPagination.svelte';
    
    import Button from '$lib/ui/buttons/Button.svelte';
	import { Pagination } from '$lib/ui/pagination';
	import { CardContent, CardFooter } from '$lib/ui/card';

	type Props = { data: { isSuperAdmin?: boolean } };

	let { data }: Props = $props();
	let isSuperAdmin = $derived(data.isSuperAdmin ?? false);

	let receivedEmails = $derived(adminEmailManagerPagePresenter.receivedEmails);

	/** Rows with a single lowercase field for client-side search (subject + from). */
	let inboxRowsForPagination = $derived(
		receivedEmails.map((e) => ({
			...e,
			searchText: `${e.subject ?? ''} ${e.from ?? ''}`.toLowerCase()
		}))
	);

	let pagination = $derived(
		createPagination({
			initialItemsPerPage: 10,
			initialData: inboxRowsForPagination,
			searchField: 'searchText'
		})
	);

	let {
		currentData,
		currentPage,
		totalPages,
		totalFilteredItems,
		itemsPerPage,
		paginateFrontFF,
		paginateBackFF,
		setItemsPerPage,
		setCurrentPage
	} = $derived(pagination);
	let hasMore = $derived(adminEmailManagerPagePresenter.hasMore);
	let listLoading = $derived(adminEmailManagerPagePresenter.listLoading);
	let listLoadingMore = $derived(adminEmailManagerPagePresenter.listLoadingMore);
	let listError = $derived(adminEmailManagerPagePresenter.listError);

	let selectedId = $derived(adminEmailManagerPagePresenter.selectedId);
	let detail = $derived(adminEmailManagerPagePresenter.detail);
	let detailLoading = $derived(adminEmailManagerPagePresenter.detailLoading);
	let detailError = $derived(adminEmailManagerPagePresenter.detailError);

	let composeFrom = $derived(adminEmailManagerPagePresenter.composeFrom);
	let composeTo = $derived(adminEmailManagerPagePresenter.composeTo);
	let composeSubject = $derived(adminEmailManagerPagePresenter.composeSubject);
	let composeText = $derived(adminEmailManagerPagePresenter.composeText);
	let sendInProgress = $derived(adminEmailManagerPagePresenter.sendInProgress);

	let showToastMessage = $derived(adminEmailManagerPagePresenter.showToastMessage);
	let toastMessage = $derived(adminEmailManagerPagePresenter.toastMessage);

	onMount(() => {
		adminEmailManagerPagePresenter.loadInitial();
	});

	$effect(() => {
		if (showToastMessage) {
			const msg = toastMessage;
			if (msg && (msg.includes('Error') || msg.includes('Failed') || msg.includes('required'))) {
				toast.error(msg);
			} else {
				toast.success(msg || 'Done');
			}
			adminEmailManagerPagePresenter.showToastMessage = false;
		}
	});

	function formatCreatedAt(iso: string): string {
		if (!iso) return '';
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return iso;
		return d.toLocaleString();
	}

	async function onSelectEmail(id: string) {
		await adminEmailManagerPagePresenter.selectEmail(id);
	}

	async function onSend() {
		await adminEmailManagerPagePresenter.sendReply();
	}

	function bindComposeTo(v: string) {
		adminEmailManagerPagePresenter.composeTo = v;
	}
	function bindComposeSubject(v: string) {
		adminEmailManagerPagePresenter.composeSubject = v;
	}
	function bindComposeText(v: string) {
		adminEmailManagerPagePresenter.composeText = v;
	}
</script>

<div class="p-4 md:p-6 max-w-7xl mx-auto w-full">
	<div class="min-w-0">
		<h1 class="text-xl font-semibold text-base-content">Email manager</h1>
		<p class="text-sm text-base-content/70 mt-1">
			List received mail via Resend, open a message, and send a plain-text reply. Requires
			<code class="text-xs bg-base-300 px-1 rounded">RESEND_SECRET_KEY</code> on the API. Super admin
			only.
		</p>
	</div>

	{#if !isSuperAdmin}
		<div class="alert alert-warning mt-4 text-sm">
			You need super admin access to use this tool. Requests will be denied by the API.
		</div>
	{/if}

	{#if listError}
		<div class="alert alert-error mt-4 text-sm whitespace-pre-wrap">{listError}</div>
	{/if}

	<div class="mt-6 flex flex-col lg:flex-row gap-6 min-h-[min(70vh,720px)]">
		<div class="w-full lg:w-80 flex-shrink-0 flex flex-col min-h-0 border border-base-300 rounded-lg bg-base-100">
			<div class="px-3 py-2 border-b border-base-300 text-sm font-medium text-base-content/80">
				Inbox
			</div>
			{#if !listLoading && receivedEmails.length > 0}
				<div class="px-3 pt-2 pb-1">
					<input
						type="text"
						class="border-input bg-transparent focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
						placeholder="Search subject or sender…"
						bind:value={pagination.searchTerm}
					/>
				</div>
			{/if}
			<CardContent class="flex-1 overflow-y-auto min-h-0 p-0">
				{#if listLoading}
					<div class="p-4 text-sm text-base-content/60">Loading…</div>
				{:else if receivedEmails.length === 0}
					<div class="p-4 text-sm text-base-content/60">No messages.</div>
				{:else if totalFilteredItems === 0}
					<div class="p-4 text-sm text-base-content/60">No messages match your search.</div>
				{:else}
					<ul class="divide-y divide-base-300">
						{#each currentData as row (row.id)}
							<li>
								<button
									type="button"
									class="w-full text-left px-3 py-2.5 text-sm hover:bg-base-200 transition-colors {selectedId ===
									row.id
										? 'bg-base-200'
										: ''}"
									onclick={() => onSelectEmail(row.id)}
								>
									<div class="font-medium line-clamp-2 text-base-content">{row.subject || '(no subject)'}</div>
									<div class="text-xs text-base-content/60 mt-0.5 truncate">{row.from}</div>
									<div class="text-xs text-base-content/50 mt-0.5">{formatCreatedAt(row.createdAt)}</div>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</CardContent>
			{#if !listLoading && receivedEmails.length > 0}
				<CardFooter class="flex-col gap-2 border-t border-base-300 p-3 mt-0">
					<Pagination
						class="!mt-0 w-full"
						itemsPerPage={itemsPerPage}
						totalItems={totalFilteredItems}
						currentPage={currentPage}
						totalPages={totalPages}
						setItemsPerPage={setItemsPerPage}
						setCurrentPage={setCurrentPage}
						paginateFrontFF={paginateFrontFF}
						paginateBackFF={paginateBackFF}
						nameOfItems="messages"
						pageSizeOptions={[5, 10, 25, 50]}
					/>
					{#if hasMore}
						<Button
							type="button"
							variant="outline"
							size="sm"
							class="w-full"
							disabled={listLoadingMore}
							onclick={() => adminEmailManagerPagePresenter.loadMore()}
						>
							{listLoadingMore ? 'Loading…' : 'Load more from server'}
						</Button>
					{/if}
				</CardFooter>
			{/if}
		</div>

		<div class="flex-1 min-w-0 flex flex-col gap-4">
			<div class="border border-base-300 rounded-lg bg-base-100 flex-1 flex flex-col min-h-0">
				<div class="px-3 py-2 border-b border-base-300 text-sm font-medium text-base-content/80">
					Message
				</div>
				<div class="flex-1 overflow-y-auto p-4 min-h-0">
					{#if !selectedId}
						<p class="text-sm text-base-content/60">Select a message from the list.</p>
					{:else if detailLoading}
						<p class="text-sm text-base-content/60">Loading message…</p>
					{:else if detailError}
						<p class="text-sm text-error">{detailError}</p>
					{:else if detail}
						<div class="space-y-2 text-sm">
							<div><span class="text-base-content/60">From:</span> {detail.from}</div>
							<div><span class="text-base-content/60">To:</span> {detail.to.join(', ')}</div>
							<div><span class="text-base-content/60">Date:</span> {formatCreatedAt(detail.createdAt)}</div>
							<div><span class="text-base-content/60">Subject:</span> {detail.subject}</div>
							{#if detail.messageId}
								<div class="text-xs break-all text-base-content/50">
									<span class="text-base-content/60">Message-ID:</span>
									{detail.messageId}
								</div>
							{/if}
						</div>
						<div class="mt-4 border-t border-base-300 pt-4 prose prose-sm max-w-none">
							{#if detail.text}
								<pre class="whitespace-pre-wrap font-sans text-sm bg-base-200 p-3 rounded-md">{detail.text}</pre>
							{:else if detail.html}
								<div class="email-html-preview text-sm">{@html detail.html}</div>
							{:else}
								<p class="text-base-content/60">(No body)</p>
							{/if}
						</div>
					{/if}
				</div>
			</div>

			<div class="border border-base-300 rounded-lg bg-base-100 p-4">
				<h2 class="text-sm font-medium text-base-content/80 mb-3">Reply (plain text)</h2>
				<div class="space-y-3">
					<label class="form-control w-full">
						<span class="label-text text-xs">From</span>
						<input type="text" class="input input-bordered input-sm w-full" value={composeFrom} disabled />
					</label>
					<label class="form-control w-full">
						<span class="label-text text-xs">To</span>
						<input
							type="text"
							class="input input-bordered input-sm w-full"
							value={composeTo}
							oninput={(e) => bindComposeTo(e.currentTarget.value)}
							disabled={sendInProgress}
						/>
					</label>
					<label class="form-control w-full">
						<span class="label-text text-xs">Subject</span>
						<input
							type="text"
							class="input input-bordered input-sm w-full"
							value={composeSubject}
							oninput={(e) => bindComposeSubject(e.currentTarget.value)}
							disabled={sendInProgress}
						/>
					</label>
					<label class="form-control w-full">
						<span class="label-text text-xs">Message</span>
						<textarea
							class="textarea textarea-bordered textarea-sm w-full min-h-[120px]"
							placeholder="Write your reply…"
							value={composeText}
							oninput={(e) => bindComposeText(e.currentTarget.value)}
							disabled={sendInProgress}
						></textarea>
					</label>
					<div class="flex justify-end">
						<Button
							type="button"
							variant="primary"
							size="sm"
							disabled={sendInProgress}
							onclick={onSend}
						>
							{sendInProgress ? 'Sending…' : 'Send reply'}
						</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
