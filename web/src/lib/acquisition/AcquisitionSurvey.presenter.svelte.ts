import type {
	AcquisitionSurveyRepository,
	AcquisitionSurveyStatusProgrammerModel
} from '$lib/acquisition/AcquisitionSurvey.repository.svelte';
import type { AcquisitionSurveySourceSlug } from '$lib/acquisition/acquisition.types';
import {
	persistAcquisitionSurveyDone,
	readAcquisitionSurveyDone
} from '$lib/acquisition/acquisitionSurveyStorage';
import {
	readStoredLandingUrl,
	readStoredReferrer,
	readStoredUtm
} from '$lib/product-analytics/utm';

export type AcquisitionSurveyGateContext = {
	isPlatformAdmin: boolean;
	gateResolved: boolean;
	restrictFreeUser: boolean;
	workspaceId: string | null;
	userId: string | null;
};

export class AcquisitionSurveyPresenter {
	acquisitionOpen = $state(false);
	isSubmitting = $state(false);
	status = $state<AcquisitionSurveyStatusProgrammerModel | null>(null);
	statusLoading = $state(false);

	private evaluateInflight: Promise<void> | null = null;
	private lastEvaluatedUserKey = $state<string | null>(null);

	constructor(private readonly acquisitionSurveyRepository: AcquisitionSurveyRepository) {}

	shouldShowModal(context: AcquisitionSurveyGateContext): boolean {
		if (context.isPlatformAdmin) return false;
		if (!context.gateResolved || context.restrictFreeUser) return false;
		if (!context.userId) return false;
		if (readAcquisitionSurveyDone(context.userId)) return false;
		if (!this.status) return false;
		return this.status.eligible && !this.status.submitted;
	}

	async evaluateEligibility(context: AcquisitionSurveyGateContext, options?: { force?: boolean }): Promise<void> {
		if (context.isPlatformAdmin) {
			this.acquisitionOpen = false;
			return;
		}

		if (!context.gateResolved || context.restrictFreeUser || !context.userId) {
			this.acquisitionOpen = false;
			return;
		}

		if (readAcquisitionSurveyDone(context.userId)) {
			this.acquisitionOpen = false;
			return;
		}

		const userKey = context.userId.trim();
		if (
			!options?.force &&
			this.status &&
			this.lastEvaluatedUserKey === userKey &&
			!this.statusLoading
		) {
			this.acquisitionOpen = this.shouldShowModal(context);
			return;
		}

		if (this.evaluateInflight) {
			return this.evaluateInflight;
		}

		this.evaluateInflight = this.evaluateInternal(context, userKey).finally(() => {
			this.evaluateInflight = null;
		});
		return this.evaluateInflight;
	}

	private async evaluateInternal(context: AcquisitionSurveyGateContext, userKey: string): Promise<void> {
		this.statusLoading = true;
		try {
			const nextStatus = await this.acquisitionSurveyRepository.getStatus();
			this.lastEvaluatedUserKey = userKey;
			this.status = nextStatus;
			this.acquisitionOpen = nextStatus ? this.shouldShowModal(context) : false;
		} finally {
			this.statusLoading = false;
		}
	}

	async submit(
		context: AcquisitionSurveyGateContext,
		source: AcquisitionSurveySourceSlug,
		otherDetail?: string
	): Promise<boolean> {
		if (!context.userId || this.isSubmitting) return false;

		this.isSubmitting = true;
		try {
			const result = await this.acquisitionSurveyRepository.submit({
				source,
				otherDetail: otherDetail?.trim() || undefined,
				organizationId: context.workspaceId ?? undefined,
				utm: readStoredUtm() || undefined,
				landingUrl: readStoredLandingUrl() || undefined,
				referrer: readStoredReferrer() || undefined
			});

			if (!result.success) {
				return false;
			}

			this.markDone(context.userId, { submitted: true, skipped: false, eligible: false, source });
			return true;
		} finally {
			this.isSubmitting = false;
		}
	}

	closeModal(): void {
		this.acquisitionOpen = false;
	}

	private markDone(userId: string, status: AcquisitionSurveyStatusProgrammerModel): void {
		persistAcquisitionSurveyDone(userId);
		this.status = status;
		this.acquisitionOpen = false;
	}
}
