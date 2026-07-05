<script lang="ts">
	import type { PageData } from './$types';
	import type { StackDetailViewModel } from '$lib/listings/GetListing.presenter.svelte';
	import type { StackBlueprintWorkflowStepProgrammerModel } from '$lib/listings/listing.types';

	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	import { isPaidSubscriptionTier, planLimitsForTier } from 'openquok-common';

	import { publicExtensionBySlugPagePresenter } from '$lib/area-public';
	import { getRootPathPublicBuildingBlocks } from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
	import { getRootPathPublicPlaybooks } from '$lib/area-public/constants/getRootPathPublicPlaybooks';
	import { getRootPathPublicSkillBuilder } from '$lib/area-public/constants/getRootPathPublicTools';
	import { resolvePublicBuildingBlockPath } from '$lib/area-public/utils/resolvePublicListingPaths';
	import { getRootPathAccount } from '$lib/area-protected';
	import { getBillingPresenter } from '$lib/billing';
	import { showListingBookmarkToast } from '$lib/listings';
	import { authenticationRepository } from '$lib/user-auth';
	import { route, url } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';

	import Button from '$lib/ui/buttons/Button.svelte';
	import CommunityFeaturesLimitUpgradeModal from '$lib/ui/components/blog-post/CommunityFeaturesLimitUpgradeModal.svelte';
	import ListingComments from '$lib/ui/components/extensions/ListingComments.svelte';
	import ListingHubBreadcrumb from '$lib/ui/components/extensions/ListingHubBreadcrumb.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';
	import StackListingContentTabs from '$lib/ui/templates/stacks/StackListingContentTabs.svelte';
	import StackListingDetailHeader from '$lib/ui/templates/stacks/StackListingDetailHeader.svelte';
	import StackModelBindingsSection from '$lib/ui/templates/stacks/StackModelBindingsSection.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let stackVm = $derived(data.stackVm);
	let commentsVm = $derived(data.commentsVm);
	let schemaData = $derived(data.schemaData);
	let isLoggedIn = $derived(authenticationRepository.isAuthenticated() || data.isLoggedIn === true);
	let skillBuilderHref = $derived(url(`${route(getRootPathPublicSkillBuilder())}?stack=${stackVm.slug}`));

	const descriptionMarkdown = $derived(stackVm.content?.trim() ? stackVm.content : null);
	const workflowSteps = $derived(stackVm.stackBlueprint?.workflow_steps ?? []);
	const referenceAssets = $derived(stackVm.stackBlueprint?.reference_assets ?? []);
	const modelBindings = $derived(stackVm.stackBlueprint?.model_bindings ?? []);

	// /account/billing
	const rootPathAccount = getRootPathAccount();
	const accountBillingHref = url(`${route(rootPathAccount)}/billing`);

	// /playbooks
	const rootPathPublicPlaybooks = getRootPathPublicPlaybooks();
	const playbooksHubHref = url(route(rootPathPublicPlaybooks));

	let viewerCommunityFeaturesEnabled = $state<boolean | null>(null);
	let bookmarksPaidEnabled = $state<boolean | null>(null);
	let isBookmarked = $state(false);
	let showUpgradeModal = $state(false);
	let extraLikes = $state(0);

	const communityEnabled = $derived(viewerCommunityFeaturesEnabled ?? true);
	let displayLikes = $derived(stackVm.likes + extraLikes);

	$effect(() => {
		if (!browser || !isLoggedIn) {
			viewerCommunityFeaturesEnabled = null;
			bookmarksPaidEnabled = null;
			return;
		}
		let cancelled = false;
		void getBillingPresenter.loadOwnedAccountBillingVmStateless().then((vm) => {
			if (cancelled) return;
			viewerCommunityFeaturesEnabled = vm ? planLimitsForTier(vm.tier).community_features : false;
			bookmarksPaidEnabled = vm ? isPaidSubscriptionTier(vm.tier) : false;
		});
		return () => {
			cancelled = true;
		};
	});

	onMount(() => {
		if (!browser || !stackVm?.id) return;
		void publicExtensionBySlugPagePresenter.trackExtensionView(stackVm.id);
	});

	async function handleToggleBookmark(listingId: string, nextBookmarked: boolean) {
		const result = await publicExtensionBySlugPagePresenter.toggleBookmark(listingId, nextBookmarked);
		if (!result.ok) {
			toast.error(result.error);
			return result;
		}
		if (listingId === stackVm?.id) {
			isBookmarked = nextBookmarked;
		}
		showListingBookmarkToast(nextBookmarked, 'stack');
		return { ok: true as const, bookmarked: nextBookmarked };
	}

	async function handleLike() {
		const result = await publicExtensionBySlugPagePresenter.trackExtensionLike(stackVm.id);
		if (result.ok) {
			extraLikes += 1;
			toast.success('Thanks for the like!');
			return;
		}
		toast.error(result.error);
	}

	function memberTypeBadges(extensionType: string | null | undefined): string[] {
		switch (extensionType) {
			case 'skills':
				return ['Skills'];
			case 'mcp':
				return ['MCP'];
			case 'both':
				return ['MCP', 'Skills'];
			default:
				return ['Building block'];
		}
	}

	function memberInstallCommand(stackMember: StackDetailViewModel['stackMembers'][number]) {
		if (!stackMember.member) return null;
		if (stackMember.memberRole === 'mcp' || stackMember.member.extensionType === 'mcp') {
			return stackMember.member.installCommandMcp;
		}
		return stackMember.member.installCommandSkills;
	}

	function memberDetailHref(stackMember: StackDetailViewModel['stackMembers'][number]) {
		if (!stackMember.member) return null;
		const path = resolvePublicBuildingBlockPath(stackVm.owner, stackMember.member.slug);
		return path ? url(`/${path}`) : url(`/${getRootPathPublicBuildingBlocks()}`);
	}

	function memberSetupDocButtons(
		stackMember: StackDetailViewModel['stackMembers'][number]
	): Array<{ label: string; href: string }> {
		if (!stackMember.member) return [];
		const { extensionType, clickUrlSkills, clickUrlMcp } = stackMember.member;
		const buttons: Array<{ label: string; href: string }> = [];
		if (extensionType === 'skills' || extensionType === 'both') {
			const href = clickUrlSkills?.trim();
			if (href) buttons.push({ label: 'Skill Setup Doc', href });
		}
		if (extensionType === 'mcp' || extensionType === 'both') {
			const href = clickUrlMcp?.trim();
			if (href) buttons.push({ label: 'MCP Setup Doc', href });
		}
		return buttons;
	}

	function stepTitle(step: StackBlueprintWorkflowStepProgrammerModel, index: number) {
		if (step.type === 'text') return `Step ${index + 1}`;
		const slug = step.listing_slug ?? 'extension';
		const command = step.command_name ?? 'command';
		return `${slug} · ${command}`;
	}
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-14">
	<article class="container mx-auto max-w-4xl px-4">
		<ListingHubBreadcrumb
			hubHref={playbooksHubHref}
			hubLabel="Playbooks"
			owner={stackVm.owner}
			pageTitle={stackVm.title}
			class="mb-4"
		/>
		<StackListingDetailHeader
			{stackVm}
			{displayLikes}
			{skillBuilderHref}
			onLike={handleLike}
			likeDisabled={publicExtensionBySlugPagePresenter.submittingLike}
			{isBookmarked}
			{isLoggedIn}
			{bookmarksPaidEnabled}
			upgradeHref={accountBillingHref}
			onToggleBookmark={handleToggleBookmark}
			communityEnabled={communityEnabled}
			submitRating={(listingId, rating) =>
				publicExtensionBySlugPagePresenter.submitListingRating(listingId, rating)}
			submittingRating={publicExtensionBySlugPagePresenter.submittingRating}
			onRatingSignInRequired={() => {
				toast.error('Sign in to use community features.');
			}}
			onRatingUpgradeRequired={() => {
				showUpgradeModal = true;
			}}
		/>

		<section class="py-8">
			<StackListingContentTabs content={descriptionMarkdown}>
				{#snippet members()}
					<StackModelBindingsSection bindings={modelBindings} />
					<div>
						<h2 class="mb-2 text-xl font-bold text-base-content">Building blocks</h2>
						<p class="mb-4 text-sm text-base-content/70">
							Skills and MCP extensions to install before you run this playbook.
						</p>
						{#if stackVm.stackMembers.length === 0}
							<p class="text-base-content/70">This playbook does not include any building blocks yet.</p>
						{:else}
							<ul class="space-y-3">
								{#each stackVm.stackMembers as member (member.id)}
									<li class="rounded-xl border border-base-content/10 p-4">
										<div class="flex flex-wrap items-start justify-between gap-3">
											<div class="min-w-0 flex-1">
												{#if member.member}
													<div class="mb-2 flex flex-wrap gap-2">
														{#each memberTypeBadges(member.member.extensionType) as badge (badge)}
															<span class="badge badge-outline badge-sm">{badge}</span>
														{/each}
													</div>
													<h3 class="font-semibold text-base-content">
														{#if memberDetailHref(member)}
															<a class="link link-hover" href={memberDetailHref(member)}>
																{member.member.title}
															</a>
														{:else}
															{member.member.title}
														{/if}
													</h3>
													{#if member.member.excerpt}
														<p class="mt-1 text-sm text-base-content/70">{member.member.excerpt}</p>
													{/if}
													{@const installCommand = memberInstallCommand(member)}
													{@const detailHref = memberDetailHref(member)}
													{@const setupDocButtons = memberSetupDocButtons(member)}
													{#if installCommand}
														<div class="mt-4 space-y-2">
															<p class="text-sm font-medium text-base-content">Install</p>
															<TerminalCommandMock
																code={installCommand}
																ariaLabel={`Install command for ${member.member.title}`}
															/>
														</div>
													{/if}
													{#if detailHref}
														<div class="mt-4 flex flex-wrap gap-2">
															<Button href={detailHref} variant="primary" size="sm">View details</Button>
															{#each setupDocButtons as docButton (docButton.label)}
																<Button
																	href={docButton.href}
																	variant="outline"
																	size="sm"
																	target="_blank"
																	rel="noopener noreferrer"
																>
																	{docButton.label}
																</Button>
															{/each}
														</div>
													{/if}
												{:else}
													<p class="text-sm text-base-content/60">Building block unavailable</p>
												{/if}
											</div>
										</div>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				{/snippet}

				{#snippet readmeExtras()}
					{#if workflowSteps.length > 0}
						<div>
							<h2 class="mb-4 text-xl font-bold">Workflow</h2>
							<ol class="space-y-4">
								{#each workflowSteps as step, index (index)}
									<li class="rounded-xl border border-base-content/10 p-4">
										<p class="text-xs font-semibold tracking-wide text-primary uppercase">
											{stepTitle(step, index)}
										</p>
										{#if step.type === 'text'}
											<p class="mt-2 text-base-content/80">{step.content}</p>
										{:else}
											{#if step.prompt}
												<p class="mt-2 text-base-content/80">{step.prompt}</p>
											{/if}
											{#if step.example_payload}
												<pre
													class="mt-3 overflow-x-auto rounded-lg bg-base-200/80 p-3 font-mono text-xs text-base-content/80"
												>{JSON.stringify(step.example_payload, null, 2)}</pre>
											{/if}
										{/if}
									</li>
								{/each}
							</ol>
						</div>
					{/if}

					{#if referenceAssets.length > 0}
						<div>
							<h2 class="mb-4 text-xl font-bold">Reference assets</h2>
							<ul class="space-y-3">
								{#each referenceAssets as asset, index (index)}
									<li class="rounded-xl border border-base-content/10 p-4">
										<p class="font-semibold text-base-content">{asset.label}</p>
										<p class="mt-1 text-sm text-base-content/60 uppercase">{asset.type}</p>
										{#if asset.payload}
											<pre
												class="mt-3 overflow-x-auto rounded-lg bg-base-200/80 p-3 font-mono text-xs text-base-content/80"
											>{asset.payload}</pre>
										{/if}
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				{/snippet}
			</StackListingContentTabs>
		</section>

		<section class="border-t border-base-content/10 py-10">
			<ListingComments
				{commentsVm}
				listingId={stackVm.id}
				{isLoggedIn}
				submitListingComment={(params) => publicExtensionBySlugPagePresenter.submitListingComment(params)}
				submittingComment={publicExtensionBySlugPagePresenter.submittingComment}
				communityCommentsEnabled={communityEnabled}
				onUpgradeRequired={() => {
					showUpgradeModal = true;
				}}
			/>
		</section>
	</article>
</SectionOuterContainer>

<CommunityFeaturesLimitUpgradeModal
	bind:open={showUpgradeModal}
	upgradeHref={accountBillingHref}
/>
