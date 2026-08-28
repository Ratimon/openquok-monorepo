import type { HttpGateway } from '$lib/core/HttpGateway';
import { ApiError } from '$lib/core/HttpGateway';
import type { AcquisitionSurveySourceSlug } from '$lib/acquisition/acquisition.types';

export interface AcquisitionSurveyStatusProgrammerModel {
	eligible: boolean;
	submitted: boolean;
	skipped: boolean;
	source?: string;
}

export interface AcquisitionSurveyStatusDto {
	eligible: boolean;
	submitted: boolean;
	skipped: boolean;
	source?: string;
}

export interface GetAcquisitionSurveyStatusResponseDto {
	success: boolean;
	data: AcquisitionSurveyStatusDto;
	message?: string;
}

export interface SubmitAcquisitionSurveyBodyDto {
	source?: AcquisitionSurveySourceSlug;
	skipped?: boolean;
	otherDetail?: string;
	organizationId?: string;
	utm?: string;
	landingUrl?: string;
	referrer?: string;
}

export interface SubmitAcquisitionSurveyResponseDto {
	success: boolean;
	data: { id: string };
	message?: string;
}

export interface SubmitAcquisitionSurveyProgrammerModel {
	success: boolean;
	message: string;
	id?: string;
}

export interface AcquisitionSurveyConfig {
	endpoints: {
		status: string;
		submit: string;
	};
}

export class AcquisitionSurveyRepository {
	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: AcquisitionSurveyConfig
	) {}

	async getStatus(): Promise<AcquisitionSurveyStatusProgrammerModel | null> {
		const { data: statusDto, ok } =
			await this.httpGateway.get<GetAcquisitionSurveyStatusResponseDto>(
				this.config.endpoints.status,
				undefined,
				{ withCredentials: true }
			);

		if (ok && statusDto?.success && statusDto.data) {
			return {
				eligible: statusDto.data.eligible,
				submitted: statusDto.data.submitted,
				skipped: statusDto.data.skipped,
				source: statusDto.data.source
			};
		}

		return null;
	}

	async submit(body: SubmitAcquisitionSurveyBodyDto): Promise<SubmitAcquisitionSurveyProgrammerModel> {
		try {
			const { data: submitDto, ok } =
				await this.httpGateway.post<SubmitAcquisitionSurveyResponseDto>(
					this.config.endpoints.submit,
					body,
					{ withCredentials: true }
				);

			if (ok && submitDto?.success && submitDto.data?.id) {
				return {
					success: true,
					message: submitDto.message ?? 'Thanks for sharing.',
					id: submitDto.data.id
				};
			}

			return {
				success: false,
				message: submitDto?.message ?? 'Could not save your response.'
			};
		} catch (error) {
			if (error instanceof ApiError) {
				const { message } = (error.data as { message?: string }) ?? {};
				return {
					success: false,
					message: message ?? 'Could not save your response.'
				};
			}
			return {
				success: false,
				message: 'Could not save your response.'
			};
		}
	}
}
