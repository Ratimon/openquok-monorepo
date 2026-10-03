import type { LinkDirectoryRepository } from '$lib/link-directory/LinkDirectory.repository';
import type { LinkDirectorySavedSiteDto } from '$lib/link-directory/link-directory.types';

import {
	clearBuildBacklinksLocalBookmarks,
	readBuildBacklinksLocalBookmarks,
	writeBuildBacklinksLocalBookmarks
} from '$lib/link-directory/utils/buildBacklinksBookmarksLocalStorage';
import { mergeBuildBacklinksBookmarkSlugs } from '$lib/link-directory/utils/mergeBuildBacklinksBookmarkSlugs';

export type BuildBacklinksBookmarkToggleResult =
	| { ok: true; bookmarked: boolean }
	| { ok: false; error: string };

export class PublicBuildBacklinksBookmarksPresenter {
	public orderedSlugs = $state<string[]>([]);
	public siteTitleBySlug = $state<Record<string, string>>({});
	public outreachCompletedAtBySlug = $state<Record<string, string | null>>({});
	public isLoggedIn = $state(false);
	public hydrating = $state(false);
	public canReorder = $state(false);
	public canMarkComplete = $state(false);
	public savingOrder = $state(false);

	private siteIdBySlug = new Map<string, string>();
	private persistedOrderSlugs: string[] = [];

	constructor(private readonly linkDirectoryRepository: LinkDirectoryRepository) {}

	isBookmarked(siteSlug: string): boolean {
		return this.orderedSlugs.includes(siteSlug);
	}

	isCompleted(siteSlug: string): boolean {
		return Boolean(this.outreachCompletedAtBySlug[siteSlug]);
	}

	hasUnsavedOrderChanges(): boolean {
		if (!this.isLoggedIn) return false;
		const current = this.orderedSlugs;
		const persisted = this.persistedOrderSlugs;
		if (current.length !== persisted.length) return true;
		return current.some((slug, index) => slug !== persisted[index]);
	}

	getSiteIdForSlug(siteSlug: string): string | undefined {
		return this.siteIdBySlug.get(siteSlug);
	}

	async hydrate(isLoggedIn: boolean, fetch?: typeof globalThis.fetch): Promise<void> {
		this.isLoggedIn = isLoggedIn;
		this.canReorder = isLoggedIn;
		this.canMarkComplete = isLoggedIn;
		this.hydrating = true;
		try {
			if (isLoggedIn) {
				await this.hydrateAuthenticated(fetch);
			} else {
				this.applyLocalState(readBuildBacklinksLocalBookmarks());
			}
		} finally {
			this.hydrating = false;
		}
	}

	getSiteTitle(siteSlug: string): string {
		return this.siteTitleBySlug[siteSlug] ?? siteSlug;
	}

	buildSitesBySlugLookup(
		visibleSites: Array<{ slug: string; title: string }>
	): Map<string, { slug: string; title: string }> {
		const map = new Map<string, { slug: string; title: string }>();
		for (const slug of this.orderedSlugs) {
			const visible = visibleSites.find((site) => site.slug === slug);
			map.set(slug, {
				slug,
				title: visible?.title ?? this.getSiteTitle(slug)
			});
		}
		return map;
	}

	async toggleBookmark(
		params: { siteId: string; siteSlug: string; title?: string },
		fetch?: typeof globalThis.fetch
	): Promise<BuildBacklinksBookmarkToggleResult> {
		const { siteId, siteSlug, title } = params;
		this.rememberSite({ siteId, siteSlug, title });

		const nextBookmarked = !this.isBookmarked(siteSlug);
		if (nextBookmarked) {
			this.orderedSlugs = [...this.orderedSlugs, siteSlug];
		} else {
			this.orderedSlugs = this.orderedSlugs.filter((slug) => slug !== siteSlug);
		}

		if (this.isLoggedIn) {
			const siteIds = this.orderedSlugs
				.map((slug) => this.siteIdBySlug.get(slug))
				.filter((id): id is string => Boolean(id));
			const result = await this.linkDirectoryRepository.replaceMySavedSites(siteIds, fetch);
			if (!result.ok) {
				await this.hydrateAuthenticated(fetch);
				return { ok: false, error: result.error ?? 'Failed to save bookmark.' };
			}
			this.applyServerSavedSites(result.savedSites);
			return { ok: true, bookmarked: this.isBookmarked(siteSlug) };
		}

		const entries = this.orderedSlugs.map((slug) => ({
			slug,
			siteId: this.siteIdBySlug.get(slug) ?? siteId
		}));
		writeBuildBacklinksLocalBookmarks(entries);
		return { ok: true, bookmarked: nextBookmarked };
	}

	moveBookmark(
		siteSlug: string,
		direction: 'up' | 'down'
	): { ok: boolean; error?: string } {
		if (!this.isLoggedIn) {
			return { ok: false, error: 'Sign in to reorder saved sites.' };
		}

		const index = this.orderedSlugs.indexOf(siteSlug);
		if (index < 0) return { ok: false, error: 'Site is not bookmarked.' };

		const targetIndex = direction === 'up' ? index - 1 : index + 1;
		if (targetIndex < 0 || targetIndex >= this.orderedSlugs.length) {
			return { ok: true };
		}

		const next = [...this.orderedSlugs];
		const [removed] = next.splice(index, 1);
		next.splice(targetIndex, 0, removed);
		this.orderedSlugs = next;
		return { ok: true };
	}

	async saveOrder(
		fetch?: typeof globalThis.fetch
	): Promise<{ ok: boolean; error?: string }> {
		if (!this.isLoggedIn) {
			return { ok: false, error: 'Sign in to save order.' };
		}
		if (!this.hasUnsavedOrderChanges()) {
			return { ok: true };
		}

		const siteIds = this.orderedSlugs
			.map((slug) => this.siteIdBySlug.get(slug))
			.filter((id): id is string => Boolean(id));

		this.savingOrder = true;
		try {
			const result = await this.linkDirectoryRepository.reorderMySavedSites(siteIds, fetch);
			if (!result.ok) {
				await this.hydrateAuthenticated(fetch);
				return { ok: false, error: result.error };
			}
			this.applyServerSavedSites(result.savedSites);
			return { ok: true };
		} finally {
			this.savingOrder = false;
		}
	}

	async toggleCompleted(
		siteSlug: string,
		fetch?: typeof globalThis.fetch
	): Promise<{ ok: boolean; error?: string }> {
		if (!this.isLoggedIn) {
			return { ok: false, error: 'Sign in to track progress.' };
		}

		const siteId = this.siteIdBySlug.get(siteSlug);
		if (!siteId) {
			return { ok: false, error: 'Site is not bookmarked.' };
		}

		const nextCompleted = !this.isCompleted(siteSlug);
		this.outreachCompletedAtBySlug = {
			...this.outreachCompletedAtBySlug,
			[siteSlug]: nextCompleted ? new Date().toISOString() : null
		};

		const result = await this.linkDirectoryRepository.setSavedSiteOutreachCompletion(
			siteId,
			nextCompleted,
			fetch
		);
		if (!result.ok) {
			await this.hydrateAuthenticated(fetch);
			return { ok: false, error: result.error };
		}
		this.applyServerSavedSites(result.savedSites);
		return { ok: true };
	}

	private async hydrateAuthenticated(fetch?: typeof globalThis.fetch): Promise<void> {
		const localEntries = readBuildBacklinksLocalBookmarks();
		let serverSavedSites = await this.linkDirectoryRepository.getMySavedSites(fetch);

		if (localEntries.length > 0) {
			const serverSlugs = this.savedSiteSlugsFromRows(serverSavedSites);
			const localSlugs = localEntries.map((entry) => entry.slug);
			const mergedSlugs = mergeBuildBacklinksBookmarkSlugs(serverSlugs, localSlugs);

			for (const entry of localEntries) {
				this.siteIdBySlug.set(entry.slug, entry.siteId);
			}
			for (const row of serverSavedSites) {
				const slug = row.site?.slug;
				if (slug) this.siteIdBySlug.set(slug, row.siteId);
			}

			const mergedIds = await this.resolveSiteIdsForSlugs(mergedSlugs, fetch);
			if (mergedIds.length > 0) {
				const replaceResult = await this.linkDirectoryRepository.replaceMySavedSites(
					mergedIds,
					fetch
				);
				if (replaceResult.ok) {
					serverSavedSites = replaceResult.savedSites;
				}
			}
			clearBuildBacklinksLocalBookmarks();
		}

		this.applyServerSavedSites(serverSavedSites);
	}

	private applyServerSavedSites(savedSites: LinkDirectorySavedSiteDto[]): void {
		const slugs: string[] = [];
		const outreachCompletedAtBySlug: Record<string, string | null> = {};
		for (const row of savedSites) {
			const slug = row.site?.slug;
			if (!slug) continue;
			slugs.push(slug);
			outreachCompletedAtBySlug[slug] = row.outreachCompletedAt ?? null;
			this.rememberSite({
				siteId: row.siteId,
				siteSlug: slug,
				title: row.site?.title
			});
		}
		this.orderedSlugs = slugs;
		this.persistedOrderSlugs = [...slugs];
		this.outreachCompletedAtBySlug = outreachCompletedAtBySlug;
	}

	private applyLocalState(
		entries: ReturnType<typeof readBuildBacklinksLocalBookmarks>
	): void {
		this.siteIdBySlug.clear();
		for (const entry of entries) {
			this.rememberSite({ siteId: entry.siteId, siteSlug: entry.slug });
		}
		this.orderedSlugs = entries.map((entry) => entry.slug);
		this.persistedOrderSlugs = [];
		this.outreachCompletedAtBySlug = {};
	}

	private rememberSite(params: {
		siteId: string;
		siteSlug: string;
		title?: string | null;
	}): void {
		const { siteId, siteSlug, title } = params;
		this.siteIdBySlug.set(siteSlug, siteId);
		const trimmedTitle = title?.trim();
		if (trimmedTitle) {
			this.siteTitleBySlug = { ...this.siteTitleBySlug, [siteSlug]: trimmedTitle };
		}
	}

	private savedSiteSlugsFromRows(savedSites: LinkDirectorySavedSiteDto[]): string[] {
		return savedSites
			.map((row) => row.site?.slug)
			.filter((slug): slug is string => Boolean(slug?.trim()));
	}

	private async resolveSiteIdsForSlugs(
		slugs: string[],
		fetch?: typeof globalThis.fetch
	): Promise<string[]> {
		const ids: string[] = [];
		for (const slug of slugs) {
			const cached = this.siteIdBySlug.get(slug);
			if (cached) {
				ids.push(cached);
				continue;
			}
			const site = await this.linkDirectoryRepository.getPublishedSiteBySlug(slug, fetch);
			if (site?.id) {
				this.siteIdBySlug.set(slug, site.id);
				ids.push(site.id);
			}
		}
		return ids;
	}
}
