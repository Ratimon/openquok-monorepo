<script lang="ts">
	import type { PageData } from './$types';
	import type {
		PostCommentViewModel,
		PublicPreviewPostViewModel
	} from '$lib/posts/GetScheduledPost.presenter.svelte';

	import { toast } from '$lib/ui/sonner';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { url } from '$lib/utils/path';
	import { publicPreviewPostByIdPagePresenter } from '$lib/area-public';
	import { getRootPathSignin } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { authenticationRepository } from '$lib/user-auth';
	import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';

	import Comments from '$lib/ui/components/preview/Comments.svelte';
	import CopyClient from '$lib/ui/components/preview/CopyClient.svelte';
	import RenderPreviewDate from '$lib/ui/components/preview/RenderPreviewDate.svelte';
	import ShowAllProviders from '$lib/ui/components/posts/providers/ShowAllProviders.svelte';

	let { data }: { data: PageData } = $props();

	$effect(() => {
		if (!browser) return;
		if (!publicPreviewPostByIdPagePresenter.showCommentSubmitToast) return;
		const msg = publicPreviewPostByIdPagePresenter.commentSubmitToastMessage;
		if (publicPreviewPostByIdPagePresenter.commentSubmitToastIsError) {
			toast.error(msg);
		} else {
			toast.success(msg);
		}
		publicPreviewPostByIdPagePresenter.showCommentSubmitToast = false;
	});

	const showShare = $derived(page.url.searchParams.get('share') === 'true');

	const previewMetaLabel = $derived.by(() => {
		const iso = previewPostVm?.publishDateIso;
		if (!iso) return null;
		const ms = Date.parse(iso);
		if (!Number.isFinite(ms)) return null;
		return new Date(ms).toLocaleDateString(undefined, {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});
	});

	// Prefer SSR data; fall back to presenter state (client-side refreshes).
	const previewPostVm = $derived(
		(data.postVm ?? publicPreviewPostByIdPagePresenter.currentPreviewPostVm) as
			| PublicPreviewPostViewModel
			| null
	);

	const previewChannelVm = $derived(
		data.previewChannelVm ?? publicPreviewPostByIdPagePresenter.currentPreviewChannelVm
	);

	const previewMediaUrlsVm = $derived(
		data.previewMediaUrlsVm ?? publicPreviewPostByIdPagePresenter.currentPreviewMediaUrlsVm
	);

	const signInHref = $derived(
		url(
			`/${getRootPathSignin()}?redirectURL=${encodeURIComponent(`${page.url.pathname}${page.url.search}`)}`
		)
	);
	const currentUserLabel = $derived(
		authenticationRepository.currentUser?.fullName ?? authenticationRepository.currentUser?.email ?? null
	);
	const isLoggedIn = $derived(authenticationRepository.isAuthenticated());
	let schemaData = $derived(data.schemaData);
	const commentsVm = $derived(
		(data.commentsVm ?? publicPreviewPostByIdPagePresenter.currentCommentsVm) as PostCommentViewModel[]
	);

	$effect(() => {
		if (data.postVm) {
			publicPreviewPostByIdPagePresenter.currentPreviewPostVm = data.postVm;
		}
	});
	$effect(() => {
		// Seed presenter state so subsequent client-side comment posts update the displayed list.
		if (Array.isArray(data.commentsVm)) {
			publicPreviewPostByIdPagePresenter.currentCommentsVm = data.commentsVm;
		}
	});

	const handleSubmitComment = async (params: {
		postId: string;
		organizationId: string;
		comment: string;
	}) => {
		return publicPreviewPostByIdPagePresenter.createComment(params);
	};

	const submittingComment = $derived(publicPreviewPostByIdPagePresenter.submittingComment);
</script>

<svelte:head>
	{#if schemaData}
		<script type="application/ld+json">
			{JSON.stringify(schemaData)}</script>
	{/if}
</svelte:head>

<div class="min-h-screen bg-base-200 text-base-content">
	{#if previewPostVm}
		<div class="border-b border-base-300 bg-base-100/80 backdrop-blur">
			<div class="mx-auto flex w-full max-w-[1346px] items-center justify-between gap-3 px-4 py-3">
				<a href="/" class="flex items-center gap-3 text-base-content">
					<img
						src={url('/icon.svg')}
						alt="Logo"
						width="55"
						height="55"
						class="h-10 w-10 shrink-0"
					/>
					<div class="text-2xl font-semibold tracking-tight">
						Openquok
					</div>
				</a>
				<div class="flex items-center gap-4 text-sm text-base-content/70">
					{#if showShare}
						<CopyClient />
					{/if}
					<div class="whitespace-nowrap">
						Publication Date: <RenderPreviewDate date={previewPostVm.publishDateIso} />
					</div>
				</div>
			</div>
		</div>

		<div class="mx-auto flex w-full max-w-[1346px] flex-col gap-6 px-4 py-6 lg:flex-row lg:items-start">
			<div class="min-w-0 flex-1">
				<div class="rounded-lg border border-base-300 bg-base-100 p-4 text-base-content">
					<ShowAllProviders
						channel={previewChannelVm}
						previewText={stripHtmlToPlainText(previewPostVm.content ?? '')}
						mediaUrls={previewMediaUrlsVm}
						threadReplies={previewPostVm.threadReplies}
						threadFinisher={previewPostVm.threadFinisher}
						previewMetaLabel={previewMetaLabel}
					/>
				</div>
			</div>
			<div class="w-full lg:w-96 lg:shrink-0">
				<Comments
					postId={previewPostVm.id}
					organizationId={previewPostVm.organizationId}
					isLoggedIn={isLoggedIn}
					currentUserLabel={currentUserLabel}
					signInHref={signInHref}
					comments={commentsVm}
					submitComment={handleSubmitComment}
					{submittingComment}
				/>
			</div>
		</div>
	{:else}
		<div class="fixed inset-0 flex items-center justify-center p-6 text-[20px] text-base-content">
			Could not load preview.
		</div>
	{/if}
</div>

