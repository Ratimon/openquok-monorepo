import { isoToDatetimeLocalValue } from '$lib/utils/postingSchedulePreferences';

/** Default schedule picker value for the public Payload Wizard (tomorrow 10:00 local). */
export function defaultPayloadWizardScheduledLocal(): string {
	const next = new Date();
	next.setDate(next.getDate() + 1);
	next.setHours(10, 0, 0, 0);
	return isoToDatetimeLocalValue(next.toISOString());
}
