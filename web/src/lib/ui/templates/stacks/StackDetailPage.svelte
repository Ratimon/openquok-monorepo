<script lang="ts">
	import type { StackDetailViewModel } from '$lib/listings/GetListing.presenter.svelte';
	import type { StackBlueprintWorkflowStepProgrammerModel } from '$lib/listings/listing.types';

	import { getRootPathPublicExtension } from '$lib/area-public/constants/getRootPathPublicExtensions';
	import { url } from '$lib/utils/path';

	import Button from '$lib/ui/buttons/Button.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import ListingComments from '$lib/ui/components/extensions/ListingComments.svelte';
	import ListingRating from '$lib/ui/components/extensions/ListingRating.svelte';
	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';
	import StackListingContentTabs from '$lib/ui/templates/stacks/StackListingContentTabs.svelte';

	type MutationResult = { ok: true } | { ok: false; error: string };

	type Props = {
		stack: StackDetailViewModel;
		isLoggedIn?: boolean;
		commentsVm: import('$lib/listings/GetListing.presenter.svelte').ListingCommentViewModel[];
		communityCommentsEnabled?: boolean;
		onClone?: () => void | Promise<void>;
		cloning?: boolean;
		submitListingComment: (params: {
			listingId: string;
			content: string;
			parentId: string | null;
		}) => Promise<MutationResult>;
		submitListingRating: (listingId: string, rating: number) => Promise<MutationResult>;
		submittingComment?: boolean;
		submittingRating?: boolean;
		onUpgradeRequired?: () => void;
		onSignInRequired?: () => void;
	};

	let {
		stack,
		isLoggedIn = false,
		commentsVm,
		communityCommentsEnabled = true,
		onClone,
		cloning = false,
		submitListingComment,
		submitListingRating,
		submittingComment = false,
		submittingRating = false,
		onUpgradeRequired,
		onSignInRequired
	}: Props = $props();

	const descriptionMarkdown = $derived(stack.content?.trim() ? stack.content : null);
	const workflowSteps = $derived(stack.stackBlueprint?.workflow_steps ?? []);
	const referenceAssets = $derived(stack.stackBlueprint?.reference_assets ?? []);

	function memberTypeBadges(extensionType: string | null | undefined): string[] {
		switch (extensionType) {
			case 'skills':
				return ['Skills'];
			case 'mcp':
				return ['MCP'];
			case 'both':
				return ['MCP', 'Skills'];
			default:
				return ['Extension'];
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
		return url(getRootPathPublicExtension(stackMember.member.slug));
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

<SectionOuterContainer class="py-10 md:py-14">
	<article class="container mx-auto max-w-4xl px-4">
		<header class="space-y-4 border-b border-base-content/10 pb-8">
			<p class="text-xs font-bold tracking-wider text-primary uppercase">Extension stack</p>
			<h1 class="text-3xl font-black tracking-tight text-base-content">{stack.title}</h1>
			{#if stack.excerpt}
				<p class="text-lg text-base-content/70">{stack.excerpt}</p>
			{/if}
			<div class="flex flex-wrap items-center gap-4 text-sm text-base-content/60">
				<span>{stack.stackMembers.length} members</span>
				<span>{stack.views} views</span>
				<span>{stack.likes} likes</span>
			</div>
			<ListingRating
				listingId={stack.id}
				averageRating={stack.averageRating}
				ratingsCount={stack.ratingsCount}
				{isLoggedIn}
				communityEnabled={communityCommentsEnabled}
				submitRating={submitListingRating}
				submitting={submittingRating}
				{onSignInRequired}
				{onUpgradeRequired}
			/>
			{#if onClone}
				<Button variant="primary" onclick={() => void onClone?.()} disabled={cloning}>
					{cloning ? 'Cloning…' : 'Clone stack'}
				</Button>
			{/if}
		</header>

		<section class="border-t border-base-content/10 py-8">
			<StackListingContentTabs content={descriptionMarkdown}>
				{#snippet members()}
					{#if stack.stackMembers.length === 0}
						<p class="text-base-content/70">This stack has no members yet.</p>
					{:else}
						<ul class="space-y-3">
							{#each stack.stackMembers as member (member.id)}
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
													<a
														class="link link-hover"
														href={url(getRootPathPublicExtension(member.member.slug))}
													>
														{member.member.title}
													</a>
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
												<p class="text-sm text-base-content/60">Member unavailable</p>
											{/if}
										</div>
									</div>
								</li>
							{/each}
						</ul>
					{/if}
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
				listingId={stack.id}
				{isLoggedIn}
				{submitListingComment}
				{submittingComment}
				communityCommentsEnabled={communityCommentsEnabled}
				{onUpgradeRequired}
			/>
		</section>
	</article>
</SectionOuterContainer>
