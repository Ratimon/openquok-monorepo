import type {
	ContentTypeId,
	PostingCadenceId,
	TimingTestPlanSlotViewModel,
	TimingTestPlanViewModel
} from '$lib/best-time-to-post/best-time-to-post.types';
import {
	cadenceLabel,
	contentTypeLabel,
	DEFAULT_AUDIENCE_TIMEZONE
} from '$lib/best-time-to-post/best-time-to-post.types';
import { getBenchmarkSlotTemplates } from '$lib/best-time-to-post/constants/benchmarkSlots';
import { newDayjs } from '$lib/utils/postingSchedulePreferences';

export type BuildTimingTestPlanInput = {
	platformSlug: string;
	platformLabel: string;
	/** Audience IANA timezone (benchmark windows). */
	timezone: string;
	/** Display IANA timezone for output labels and calendar preview. */
	shownTimezone?: string;
	contentTypeId: ContentTypeId;
	cadenceId: PostingCadenceId;
	/** Override "now" for deterministic tests. */
	now?: Date;
};

/** Validate an IANA timezone; fall back to America/New_York when invalid or empty. */
export function resolveAudienceTimezone(raw: string): string {
	const trimmed = raw.trim();
	if (!trimmed) return DEFAULT_AUDIENCE_TIMEZONE;
	try {
		Intl.DateTimeFormat('en-US', { timeZone: trimmed });
		return trimmed;
	} catch {
		return DEFAULT_AUDIENCE_TIMEZONE;
	}
}

/** Validate shown timezone; fall back to audience zone when invalid or empty. */
export function resolveShownTimezone(raw: string | undefined, audienceTimezone: string): string {
	const trimmed = raw?.trim() ?? '';
	if (trimmed) {
		try {
			Intl.DateTimeFormat('en-US', { timeZone: trimmed });
			return trimmed;
		} catch {
			return audienceTimezone;
		}
	}
	return audienceTimezone;
}

/** ISO weekday 1–7 → dayjs `day()` (0 = Sunday … 6 = Saturday). */
function isoWeekdayToDayjs(weekdayIso: number): number {
	return weekdayIso === 7 ? 0 : weekdayIso;
}

/**
 * Next local occurrence of weekday + clock time strictly after `from` in `timeZone`.
 */
function nextLocalOccurrence(
	weekdayIso: number,
	hour: number,
	minute: number,
	timeZone: string,
	from: Date
) {
	const now = newDayjs(from).tz(timeZone);
	const targetDow = isoWeekdayToDayjs(weekdayIso);

	for (let add = 0; add <= 14; add++) {
		const candidate = now
			.startOf('day')
			.add(add, 'day')
			.hour(hour)
			.minute(minute)
			.second(0)
			.millisecond(0);
		if (candidate.day() === targetDow && candidate.valueOf() > now.valueOf()) {
			return candidate;
		}
	}

	return now
		.startOf('day')
		.add(7, 'day')
		.hour(hour)
		.minute(minute)
		.second(0)
		.millisecond(0);
}

function formatLocalDateTimeLabel(iso: string, timeZone: string): string {
	const d = newDayjs(iso).tz(timeZone);
	return `${d.format('ddd, MMM D YYYY [at] h:mm A')} (${timeZone})`;
}

function formatSlotLine(
	slot: TimingTestPlanSlotViewModel,
	audienceTimezone: string,
	shownTimezone: string
): string {
	if (audienceTimezone === shownTimezone) {
		return `${slot.index}. ${slot.shownDateTimeLabel} — ${slot.contentTypeLabel}`;
	}
	return `${slot.index}. ${slot.shownDateTimeLabel} — audience: ${slot.audienceDateTimeLabel} — ${slot.contentTypeLabel}`;
}

function buildFooterLines(params: {
	platformLabel: string;
	timezone: string;
	contentTypeLabel: string;
	cadenceLabel: string;
}): string[] {
	return [
		'',
		'How to use this timing test plan',
		`1. Treat these as controlled ${params.platformLabel} test slots — not guaranteed peak hours.`,
		`2. Keep content type (${params.contentTypeLabel}) and cadence (${params.cadenceLabel}) consistent while you measure.`,
		`3. Schedule the slots in your OpenQuok calendar (audience timezone: ${params.timezone}).`,
		'4. After 1–2 weeks, replace these benchmarks with what your account analytics show.'
	];
}

/**
 * Build a plain-text timing test plan from platform / timezone / content / cadence inputs.
 * Pure: no network; invalid timezones fall back to America/New_York.
 */
export function buildTimingTestPlan(input: BuildTimingTestPlanInput): TimingTestPlanViewModel {
	const timezone = resolveAudienceTimezone(input.timezone);
	const shownTimezone = resolveShownTimezone(input.shownTimezone, timezone);
	const now = input.now ?? new Date();
	const cTypeLabel = contentTypeLabel(input.contentTypeId);
	const cLabel = cadenceLabel(input.cadenceId);
	const platformSlug = input.platformSlug.trim().toLowerCase();
	const platformLabel = input.platformLabel.trim() || platformSlug;

	const templates = getBenchmarkSlotTemplates({
		platformSlug,
		contentTypeId: input.contentTypeId,
		cadenceId: input.cadenceId
	});

	const dated = templates
		.map((template) => {
			const local = nextLocalOccurrence(
				template.weekday,
				template.hour,
				template.minute,
				timezone,
				now
			);
			return { template, local };
		})
		.sort((a, b) => a.local.valueOf() - b.local.valueOf());

	const slots: TimingTestPlanSlotViewModel[] = dated.map(({ template, local }, i) => {
		const publishDateIso = local.utc().toISOString();
		return {
			index: i + 1,
			weekday: template.weekday,
			localHour: local.hour(),
			localMinute: local.minute(),
			audienceDateTimeLabel: formatLocalDateTimeLabel(publishDateIso, timezone),
			shownDateTimeLabel: formatLocalDateTimeLabel(publishDateIso, shownTimezone),
			publishDateIso,
			contentTypeId: input.contentTypeId,
			contentTypeLabel: cTypeLabel,
			platformSlug,
			platformLabel
		};
	});

	const headerLines = [
		`Timing test plan — ${platformLabel}`,
		`Audience timezone: ${timezone}`,
		...(timezone === shownTimezone
			? []
			: [`Shown timezone: ${shownTimezone}`]),
		`Content type: ${cTypeLabel}`,
		`Cadence: ${cLabel}`,
		'',
		'Suggested test slots'
	];

	const slotLines =
		slots.length > 0
			? slots.map((s) => formatSlotLine(s, timezone, shownTimezone))
			: ['(No slots generated for this combination.)'];

	const lines = [...headerLines, ...slotLines, ...buildFooterLines({
		platformLabel,
		timezone,
		contentTypeLabel: cTypeLabel,
		cadenceLabel: cLabel
	})];

	return {
		plainText: lines.join('\n'),
		lines,
		slots,
		timezone,
		shownTimezone,
		platformSlug,
		platformLabel,
		contentTypeId: input.contentTypeId,
		contentTypeLabel: cTypeLabel,
		cadenceId: input.cadenceId,
		cadenceLabel: cLabel
	};
}
