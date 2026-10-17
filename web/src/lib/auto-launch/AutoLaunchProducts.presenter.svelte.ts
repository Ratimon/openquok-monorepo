import type { AutoLaunchRepository } from '$lib/auto-launch/AutoLaunch.repository';
import type {
	AutoLaunchDestinationDto,
	AutoLaunchProductProfileDto,
	AutoLaunchSubmissionDto,
	BusinessProfileDataFormValues
} from '$lib/auto-launch/auto-launch.types';
import { groupDirectoryLaunchSiteSummaryRows } from '$lib/auto-launch/groupDirectoryLaunchSiteSummaryRows';
import {
	buildProfileLaunchCardVm,
	destinationsToReadinessInputs,
	type BusinessProfileLaunchCardVm
} from '$lib/auto-launch/utils/buildProfileLaunchCardVm';
import type { DirectoryLaunchSiteSummaryRow } from '$lib/auto-launch/groupDirectoryLaunchSiteSummaryRows';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';
export type AutoLaunchProductsComposerTab = 'general' | 'discovery';

export type AutoLaunchProfileSavePayload = {
	name: string;
	tagline: string | null;
	description: string | null;
	websiteUrl: string | null;
	logoUrl: string | null;
	profileData: BusinessProfileDataFormValues;
	integrationCustomerId?: string | null;
};

export type AutoLaunchProfileMediaPatch = {
	logoUrl?: string | null;
	galleryUrls?: string[];
};

export type AutoLaunchProfileMutationResultViewModel =
	| { ok: true; created: boolean; shouldRefreshChannelGroups: boolean }
	| { ok: false; error: string };

export type AutoLaunchProductLaunchCardRowViewModel = {
	profileId: string;
	cardVm: BusinessProfileLaunchCardVm;
	directorySiteRows: DirectoryLaunchSiteSummaryRow[];
	submissionsByDestinationId: Map<string, AutoLaunchSubmissionDto>;
};

/** Products tab: workspace profiles, launch progress, and composer state for directory launches. */
export class AutoLaunchProductsPresenter {
	profilesVm = $state<AutoLaunchProductProfileDto[]>([]);
	loading = $state(false);
	publishedDestinationsVm = $state<AutoLaunchDestinationDto[]>([]);
	submissionsByProfileIdVm = $state<Record<string, AutoLaunchSubmissionDto[]>>({});

	composerOpen = $state(false);
	composerSubmitting = $state(false);
	editingProfileId = $state<string | null>(null);
	composerInitialTab = $state<AutoLaunchProductsComposerTab | null>(null);

	constructor(
		private readonly autoLaunchRepository: AutoLaunchRepository,
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter
	) {}

	get organizationId(): string {
		return this.workspaceSettingsPresenter.currentWorkspaceId ?? '';
	}

	editingProfileVm = $derived.by((): AutoLaunchProductProfileDto | null => {
		if (!this.editingProfileId) return null;
		return this.profilesVm.find((profile) => profile.id === this.editingProfileId) ?? null;
	});

	profileLaunchCardRowsVm = $derived.by((): AutoLaunchProductLaunchCardRowViewModel[] => {
		const readinessDestinations = destinationsToReadinessInputs(this.publishedDestinationsVm);
		return this.profilesVm.map((profile) => {
			const profileSubmissions = this.submissionsByProfileIdVm[profile.id] ?? [];
			const cardVm = buildProfileLaunchCardVm({
				profile,
				destinations: readinessDestinations,
				submissions: profileSubmissions
			});
			const submissionsByDestinationId = new Map(
				profileSubmissions.map((submission) => [submission.destinationId, submission])
			);
			return {
				profileId: profile.id,
				cardVm,
				directorySiteRows: groupDirectoryLaunchSiteSummaryRows(cardVm.summary.destinations),
				submissionsByDestinationId
			};
		});
	});

	async loadProfiles(): Promise<void> {
		const organizationId = this.organizationId;
		if (!organizationId) {
			this.profilesVm = [];
			return;
		}
		this.loading = true;
		try {
			this.profilesVm = await this.autoLaunchRepository.listProfiles(organizationId);
		} finally {
			this.loading = false;
		}
	}

	async loadLaunchProgress(): Promise<void> {
		const organizationId = this.organizationId;
		if (!organizationId) {
			this.publishedDestinationsVm = [];
			this.submissionsByProfileIdVm = {};
			return;
		}
		const profiles = this.profilesVm;
		const [destinations, ...submissionLists] = await Promise.all([
			this.autoLaunchRepository.listDestinations(),
			...profiles.map((profile) =>
				this.autoLaunchRepository.listSubmissions(organizationId, { productProfileId: profile.id })
			)
		]);
		this.publishedDestinationsVm = destinations;
		const byProfile: Record<string, AutoLaunchSubmissionDto[]> = {};
		profiles.forEach((profile, index) => {
			byProfile[profile.id] = submissionLists[index] ?? [];
		});
		this.submissionsByProfileIdVm = byProfile;
	}

	async loadProductsTab(): Promise<void> {
		await this.loadProfiles();
		await this.loadLaunchProgress();
	}

	/** After listing-details save or manual complete — updates grid/cards without a full tab reload. */
	applySubmission(submission: AutoLaunchSubmissionDto): void {
		const profileId = submission.productProfileId;
		if (!profileId) return;
		const current = this.submissionsByProfileIdVm[profileId] ?? [];
		const index = current.findIndex(
			(row) => row.id === submission.id || row.destinationId === submission.destinationId
		);
		const nextList =
			index >= 0
				? current.map((row, i) => (i === index ? submission : row))
				: [...current, submission];
		this.submissionsByProfileIdVm = {
			...this.submissionsByProfileIdVm,
			[profileId]: nextList
		};
	}

	/** After removing a completed directory opportunity — drops submission from card/grid VMs. */
	removeSubmission(productProfileId: string, submissionId: string): void {
		const current = this.submissionsByProfileIdVm[productProfileId] ?? [];
		const nextList = current.filter((row) => row.id !== submissionId);
		this.submissionsByProfileIdVm = {
			...this.submissionsByProfileIdVm,
			[productProfileId]: nextList
		};
	}

	openCreateComposer(): void {
		this.editingProfileId = null;
		this.composerInitialTab = null;
		this.composerOpen = true;
	}

	openEditComposer(profileId: string, tab?: AutoLaunchProductsComposerTab): void {
		this.editingProfileId = profileId;
		this.composerInitialTab = tab ?? null;
		this.composerOpen = true;
	}

	closeComposer(): void {
		this.editingProfileId = null;
		this.composerInitialTab = null;
	}

	syncComposerFromUrl(editId: string | null, tabParam: string | null): void {
		if (!editId || !this.profilesVm.some((profile) => profile.id === editId)) return;
		this.editingProfileId = editId;
		this.composerInitialTab =
			tabParam === 'discovery' || tabParam === 'general' ? tabParam : null;
		this.composerOpen = true;
	}

	private withUploadedMedia(
		values: AutoLaunchProfileSavePayload,
		media: AutoLaunchProfileMediaPatch
	): AutoLaunchProfileSavePayload {
		return {
			...values,
			logoUrl: media.logoUrl !== undefined ? media.logoUrl : values.logoUrl,
			profileData: {
				...values.profileData,
				gallery_urls: media.galleryUrls ?? values.profileData.gallery_urls
			}
		};
	}

	async saveProfile(
		values: AutoLaunchProfileSavePayload,
		uploadMediaForProfile?: (profileId: string) => Promise<AutoLaunchProfileMediaPatch | undefined>
	): Promise<AutoLaunchProfileMutationResultViewModel> {
		const organizationId = this.organizationId;
		if (!organizationId) {
			return { ok: false, error: 'Select a workspace first.' };
		}

		this.composerSubmitting = true;
		try {
			if (this.editingProfileId) {
				const media = uploadMediaForProfile
					? await uploadMediaForProfile(this.editingProfileId)
					: undefined;
				const payload = this.withUploadedMedia(values, media ?? {});
				const resultPm = await this.autoLaunchRepository.updateProfile(this.editingProfileId, payload);
				if (!resultPm.ok) {
					return { ok: false, error: resultPm.error };
				}
				this.composerOpen = false;
				this.closeComposer();
				await this.loadProductsTab();
				return { ok: true, created: false, shouldRefreshChannelGroups: true };
			}

			const resultPm = await this.autoLaunchRepository.createProfile({
				organizationId,
				...values,
				integrationCustomerId: values.integrationCustomerId ?? null
			});
			if (!resultPm.ok) {
				return { ok: false, error: resultPm.error };
			}
			const newId = resultPm.profile.id;
			const media = uploadMediaForProfile ? await uploadMediaForProfile(newId) : undefined;
			const hasMediaPatch =
				media &&
				(media.logoUrl !== undefined ||
					(media.galleryUrls !== undefined && media.galleryUrls.length > 0));
			if (hasMediaPatch) {
				const patch = this.withUploadedMedia(values, media);
				const patchPm = await this.autoLaunchRepository.updateProfile(newId, patch);
				if (!patchPm.ok) {
					return { ok: false, error: patchPm.error };
				}
			}
			this.composerOpen = false;
			this.closeComposer();
			await this.loadProductsTab();
			return { ok: true, created: true, shouldRefreshChannelGroups: true };
		} finally {
			this.composerSubmitting = false;
		}
	}

	async deleteProfile(profileId: string): Promise<AutoLaunchProfileMutationResultViewModel> {
		const resultPm = await this.autoLaunchRepository.deleteProfile(profileId);
		if (!resultPm.ok) {
			return { ok: false, error: resultPm.error ?? 'Could not delete profile.' };
		}
		await this.loadProductsTab();
		return { ok: true, created: false, shouldRefreshChannelGroups: false };
	}
}
