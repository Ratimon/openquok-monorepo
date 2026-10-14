import type { HttpGateway } from '$lib/core/HttpGateway';
import { HttpMethod } from '$lib/core/HttpGateway';

import type { AutoLaunchConfig } from '$lib/auto-launch/constants/config';
import type {
	AutoLaunchAdminDestinationDto,
	AutoLaunchDestinationDto,
	AutoLaunchProductProfileDto,
	AutoLaunchSubmissionDto,
	AutoLaunchSubmissionIntentDto,
	AutoLaunchUpsertResult,
	BusinessProfileDto,
	DirectoryLaunchProviderSummary
} from '$lib/auto-launch/auto-launch.types';
import type { AutoLaunchExtensionConfig } from 'openquok-common';

type ListResponseDto<T> = { success: boolean; data: T };
type ProfileMutationResponseDto = { success: boolean; data: AutoLaunchProductProfileDto; message?: string };
type IntentResponseDto = { success: boolean; data: AutoLaunchSubmissionIntentDto };

export class AutoLaunchRepository {
	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: AutoLaunchConfig
	) {}

	async listDestinations(): Promise<AutoLaunchDestinationDto[]> {
		const { data: destinationsDto, ok } = await this.httpGateway.get<ListResponseDto<AutoLaunchDestinationDto[]>>(
			this.config.endpoints.destinations,
			undefined,
			{ withCredentials: true }
		);
		if (ok && destinationsDto?.data) {
			return destinationsDto.data;
		}
		return [];
	}

	async listBusinessProfiles(organizationId: string): Promise<BusinessProfileDto[]> {
		const { data: listDto, ok } = await this.httpGateway.get<ListResponseDto<BusinessProfileDto[]>>(
			this.config.endpoints.businessProfiles,
			{ organizationId },
			{ withCredentials: true }
		);
		if (ok && listDto?.data) {
			return listDto.data;
		}
		return [];
	}

	async listProfiles(
		organizationId: string,
		integrationCustomerId?: string
	): Promise<AutoLaunchProductProfileDto[]> {
		const { data: profilesDto, ok } = await this.httpGateway.get<
			ListResponseDto<AutoLaunchProductProfileDto[]>
		>(
			this.config.endpoints.profiles,
			{
				organizationId,
				...(integrationCustomerId ? { integrationCustomerId } : {})
			},
			{ withCredentials: true }
		);
		if (ok && profilesDto?.data) {
			return profilesDto.data;
		}
		return [];
	}

	async getProfileById(id: string): Promise<AutoLaunchProductProfileDto | null> {
		const { data: profileDto, ok } = await this.httpGateway.get<
			ListResponseDto<AutoLaunchProductProfileDto | null>
		>(this.config.endpoints.profileById(id), undefined, { withCredentials: true });
		if (ok && profileDto?.data) {
			return profileDto.data;
		}
		return null;
	}

	async createProfile(payload: {
		organizationId: string;
		name: string;
		tagline?: string | null;
		description?: string | null;
		websiteUrl?: string | null;
		logoUrl?: string | null;
		integrationCustomerId?: string | null;
		profileData?: Record<string, unknown>;
	}): Promise<{ ok: true; profile: AutoLaunchProductProfileDto } | { ok: false; error: string }> {
		const { data: createDto, ok } = await this.httpGateway.post<ProfileMutationResponseDto>(
			this.config.endpoints.profiles,
			payload,
			{ withCredentials: true }
		);
		if (ok && createDto?.data) {
			return { ok: true, profile: createDto.data };
		}
		return { ok: false, error: 'Could not create product profile.' };
	}

	async updateProfile(
		id: string,
		payload: {
			name?: string;
			tagline?: string | null;
			description?: string | null;
			websiteUrl?: string | null;
			logoUrl?: string | null;
			integrationCustomerId?: string | null;
			profileData?: Record<string, unknown>;
		}
	): Promise<{ ok: true; profile: AutoLaunchProductProfileDto } | { ok: false; error: string }> {
		const { data: updateDto, ok } = await this.httpGateway.request<ProfileMutationResponseDto>({
			method: HttpMethod.PATCH,
			url: this.config.endpoints.profileById(id),
			data: payload,
			withCredentials: true
		});
		if (ok && updateDto?.data) {
			return { ok: true, profile: updateDto.data };
		}
		return { ok: false, error: 'Could not update product profile.' };
	}

	async deleteProfile(id: string): Promise<{ ok: boolean; error?: string }> {
		const { ok } = await this.httpGateway.request<{ success: boolean }>({
			method: HttpMethod.DELETE,
			url: this.config.endpoints.profileById(id),
			withCredentials: true
		});
		return ok ? { ok: true } : { ok: false, error: 'Could not delete product profile.' };
	}

	async listSubmissions(
		organizationId: string,
		filters?: { productProfileId?: string; destinationId?: string }
	): Promise<AutoLaunchSubmissionDto[]> {
		const { data: submissionsDto, ok } = await this.httpGateway.get<
			ListResponseDto<AutoLaunchSubmissionDto[]>
		>(
			this.config.endpoints.submissions,
			{
				organizationId,
				...(filters?.productProfileId ? { productProfileId: filters.productProfileId } : {}),
				...(filters?.destinationId ? { destinationId: filters.destinationId } : {})
			},
			{ withCredentials: true }
		);
		if (ok && submissionsDto?.data) {
			return submissionsDto.data;
		}
		return [];
	}

	async createSubmissionIntent(payload: {
		organizationId: string;
		productProfileId: string;
		destinationId?: string;
		providerSlug?: string;
	}): Promise<{ ok: true; intent: AutoLaunchSubmissionIntentDto } | { ok: false; error: string }> {
		const { data: intentDto, ok } = await this.httpGateway.post<IntentResponseDto>(
			this.config.endpoints.submissionIntent,
			payload,
			{ withCredentials: true }
		);
		if (ok && intentDto?.data) {
			return { ok: true, intent: intentDto.data };
		}
		return { ok: false, error: 'Could not start directory launch.' };
	}

	async recordManualSubmissionComplete(payload: {
		organizationId: string;
		productProfileId: string;
		destinationId: string;
		listingUrl?: string;
	}): Promise<{ ok: true; submission: AutoLaunchSubmissionDto } | { ok: false; error: string }> {
		const { data: recordDto, ok } = await this.httpGateway.post<
			ListResponseDto<AutoLaunchSubmissionDto>
		>(this.config.endpoints.submissionRecordComplete, payload, { withCredentials: true });
		if (ok && recordDto?.data) {
			return { ok: true, submission: recordDto.data };
		}
		return { ok: false, error: 'Could not mark this launch as complete.' };
	}

	private adminOpts(fetch?: typeof globalThis.fetch) {
		return { withCredentials: true, fetch };
	}

	async listAdminProviderCatalog(
		fetch?: typeof globalThis.fetch
	): Promise<DirectoryLaunchProviderSummary[]> {
		const { data: catalogDto, ok } = await this.httpGateway.get<
			ListResponseDto<DirectoryLaunchProviderSummary[]>
		>(this.config.endpoints.adminProviderCatalog, undefined, this.adminOpts(fetch));
		if (ok && catalogDto?.data) {
			return catalogDto.data;
		}
		return [];
	}

	async getAdminDestinationByProviderSlug(
		providerSlug: string,
		fetch?: typeof globalThis.fetch
	): Promise<AutoLaunchAdminDestinationDto | null> {
		const { data: destinationDto, ok } = await this.httpGateway.get<
			ListResponseDto<AutoLaunchAdminDestinationDto | null>
		>(
			this.config.endpoints.adminDestinationByProviderSlug(providerSlug),
			undefined,
			this.adminOpts(fetch)
		);
		if (ok && destinationDto?.data) {
			return destinationDto.data;
		}
		return null;
	}

	async createAdminDestination(
		payload: {
			providerSlug: string;
			linkDirectoryOpportunityId?: string | null;
			name: string;
			shortDescription?: string | null;
			startUrl: string;
			extensionConfig?: AutoLaunchExtensionConfig;
			isPublished?: boolean;
			sortOrder?: number;
			pickerGroupKey?: string | null;
			pickerGroupTitle?: string | null;
		},
		fetch?: typeof globalThis.fetch
	): Promise<AutoLaunchUpsertResult> {
		try {
			const { data: createDto, ok } = await this.httpGateway.post<
				ListResponseDto<AutoLaunchAdminDestinationDto>
			>(this.config.endpoints.adminDestinations, payload, this.adminOpts(fetch));
			if (ok && createDto?.data) {
				return { ok: true, data: createDto.data };
			}
			return { ok: false, error: 'Failed to create auto-launch destination.' };
		} catch (err) {
			return { ok: false, error: this.extractErrorMessage(err) };
		}
	}

	async updateAdminDestination(
		destinationId: string,
		payload: {
			providerSlug?: string;
			linkDirectoryOpportunityId?: string | null;
			name?: string;
			shortDescription?: string | null;
			startUrl?: string;
			extensionConfig?: AutoLaunchExtensionConfig;
			isPublished?: boolean;
			sortOrder?: number;
			pickerGroupKey?: string | null;
			pickerGroupTitle?: string | null;
		},
		fetch?: typeof globalThis.fetch
	): Promise<AutoLaunchUpsertResult> {
		try {
			const { data: updateDto, ok } = await this.httpGateway.patch<
				ListResponseDto<AutoLaunchAdminDestinationDto>
			>(
				this.config.endpoints.adminDestinationById(destinationId),
				payload,
				this.adminOpts(fetch)
			);
			if (ok && updateDto?.data) {
				return { ok: true, data: updateDto.data };
			}
			return { ok: false, error: 'Failed to update auto-launch destination.' };
		} catch (err) {
			return { ok: false, error: this.extractErrorMessage(err) };
		}
	}

	private extractErrorMessage(err: unknown): string {
		if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
			return err.message;
		}
		return 'Request failed.';
	}
}
