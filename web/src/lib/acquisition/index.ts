import { httpGateway } from '$lib/core/index';
import type { AcquisitionSurveyConfig } from '$lib/acquisition/AcquisitionSurvey.repository.svelte';
import { AcquisitionSurveyRepository } from '$lib/acquisition/AcquisitionSurvey.repository.svelte';
import { AcquisitionSurveyPresenter } from '$lib/acquisition/AcquisitionSurvey.presenter.svelte';

const acquisitionSurveyConfig: AcquisitionSurveyConfig = {
	endpoints: {
		status: '/api/v1/users/me/acquisition-survey',
		submit: '/api/v1/users/me/acquisition-survey'
	}
};

export const acquisitionSurveyRepository = new AcquisitionSurveyRepository(
	httpGateway,
	acquisitionSurveyConfig
);

export const acquisitionSurveyPresenter = new AcquisitionSurveyPresenter(acquisitionSurveyRepository);

export { ACQUISITION_SURVEY_SOURCE_OPTIONS } from '$lib/acquisition/acquisitionSurveySources';
export {
	acquisitionSurveyDoneStorageKey,
	readAcquisitionSurveyDone,
	persistAcquisitionSurveyDone
} from '$lib/acquisition/acquisitionSurveyStorage';
export {
	ACQUISITION_SURVEY_SOURCE_SLUGS,
	acquisitionSurveyOtherDetailSchema,
	acquisitionSurveyOtherFormSchema,
	acquisitionSurveySourceSchema
} from '$lib/acquisition/acquisition.types';
export type { AcquisitionSurveySourceSlug } from '$lib/acquisition/acquisition.types';
export type {
	AcquisitionSurveyStatusProgrammerModel,
	SubmitAcquisitionSurveyBodyDto
} from '$lib/acquisition/AcquisitionSurvey.repository.svelte';
export type {
	AcquisitionSurveyGateContext
} from '$lib/acquisition/AcquisitionSurvey.presenter.svelte';
