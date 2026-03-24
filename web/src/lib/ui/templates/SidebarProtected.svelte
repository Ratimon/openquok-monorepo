<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SidebarLinkItem } from '$lib/ui/sidebar-expandable/types';
	import type { DockItem } from '$lib/ui/floating-dock/types';
	import { page } from '$app/state';
	import { route, isParentRoute, isSameRoute, url } from '$lib/utils/path';

	import SidebarBody from '$lib/ui/sidebar-expandable/SidebarBody.svelte';
	import SidebarLink from '$lib/ui/sidebar-expandable/SidebarLink.svelte';
	import HeaderProtected from '$lib/ui/templates/HeaderProtected.svelte';

	type Props = {
		children: Snippet;
		companyName?: string;
		showEditorAreaButton?: boolean;
		editorAreaHref?: string;
		showAdminAreaButton?: boolean;
		adminAreaHref?: string;
		showSecretAdminAreaButton?: boolean;
		secretAdminAreaHref?: string;
		dockItems: DockItem[];
		mainLinks: SidebarLinkItem[];
		feedbackDescription?: string;
		feedbackOpen?: boolean;
		feedbackIsSubmitting: boolean;
		feedbackIsSuccess: boolean;
		feedbackSuccessMessage: string;
		onFeedbackSubmit: (description: string) => void | Promise<void>;
	};

	let {
		children,
		companyName = 'Content OS',
		showEditorAreaButton = false,
		editorAreaHref = '/editor/feedback-manager',
		showAdminAreaButton = false,
		adminAreaHref = '/admin',
		showSecretAdminAreaButton = false,
		secretAdminAreaHref = '/secret-admin',
		dockItems,
		mainLinks = [],
		feedbackDescription = $bindable(''),
		feedbackOpen = $bindable(false),
		feedbackIsSubmitting,
		feedbackIsSuccess,
		feedbackSuccessMessage,
		onFeedbackSubmit
	}: Props = $props();

	const pathname = $derived(page.url.pathname);

	function toPathname(href: string): string {
		if (!href) return '/';
		if (href.startsWith('http')) {
			try {
				return route(new URL(href).pathname);
			} catch {
				return '/';
			}
		}
		return route(href);
	}

	function matchesPath(currentPathname: string, hrefPath: string): boolean {
		if (hrefPath === '/') return isSameRoute(currentPathname, hrefPath);
		const p = route(currentPathname);
		return p === hrefPath || p.startsWith(`${hrefPath}/`) || isParentRoute(p, hrefPath);
	}

	const activeHrefPath = $derived((() => {
		const p = route(pathname);
		let best: { hrefPath: string; score: number } | null = null;

		for (const link of mainLinks ?? []) {
			const hrefPath = toPathname(link.href);
			if (!matchesPath(p, hrefPath)) continue;

			// Prefer the most specific (longest) matching path.
			const score = hrefPath.length;
			if (!best || score > best.score) best = { hrefPath, score };
		}

		return best?.hrefPath ?? null;
	})());

	function isActive(href: string): boolean {
		const hrefPath = toPathname(href);
		return activeHrefPath != null && hrefPath === activeHrefPath;
	}
</script>

<div
	class="flex flex-row bg-base-200 w-full min-h-screen border border-base-300 overflow-hidden"
>
	<SidebarBody class="flex-shrink-0 h-full">
		<div class="flex flex-col justify-between h-full">
			<div class="flex flex-col flex-1 overflow-y-auto overflow-x-hidden min-h-0">
				<a
					href="/"
					title="{companyName} homepage"
					class="flex items-center gap-2 shrink-0 font-normal text-sm text-base-content py-1 relative z-20"
				>
					<img
						class="w-8 h-8 shrink-0"
						alt={companyName}
						src={url('/icon.svg')}
						width={32}
						height={32}
					/>
					<span class="font-extrabold text-lg whitespace-pre hidden md:inline">
						{companyName}
					</span>
				</a>
				<div class="mt-6 flex flex-col gap-1">
					{#each mainLinks as link}
						<SidebarLink
							link={{ label: link.label, href: link.href, iconName: link.iconName }}
							active={isActive(link.href)}
						/>
					{/each}
				</div>
				<div class="flex-1 min-h-[1.5rem]" aria-hidden="true"></div>
			</div>
		</div>
	</SidebarBody>

	<main class="flex-1 flex flex-col min-w-0 min-h-0">
		<HeaderProtected
			{dockItems}
			{showEditorAreaButton}
			{editorAreaHref}
			{showAdminAreaButton}
			{adminAreaHref}
			{showSecretAdminAreaButton}
			{secretAdminAreaHref}
			bind:feedbackDescription
			bind:feedbackOpen
			{feedbackIsSubmitting}
			{feedbackIsSuccess}
			{feedbackSuccessMessage}
			onFeedbackSubmit={onFeedbackSubmit}
		/>
		<div
			class="border-l border-t border-base-300 bg-base-100 flex flex-col gap-4 flex-1 w-full min-h-0 overflow-auto p-0"
		>
			{@render children?.()}
		</div>
	</main>
</div>
