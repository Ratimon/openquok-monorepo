import { ACQUISITION_SURVEY_DONE_STORAGE_PREFIX } from '$lib/onboarding/productTourStorage';

const STORAGE_PREFIX = ACQUISITION_SURVEY_DONE_STORAGE_PREFIX;

export function acquisitionSurveyDoneStorageKey(userId: string): string {
	return `${STORAGE_PREFIX}:${userId}`;
}

export function readAcquisitionSurveyDone(userId: string | null | undefined): boolean {
	if (typeof localStorage === 'undefined' || !userId) return false;
	try {
		return localStorage.getItem(acquisitionSurveyDoneStorageKey(userId)) === 'true';
	} catch {
		return false;
	}
}

export function persistAcquisitionSurveyDone(userId: string): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(acquisitionSurveyDoneStorageKey(userId), 'true');
	} catch {
		// ignore
	}
}
