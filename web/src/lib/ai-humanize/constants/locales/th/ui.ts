import type { HumanizeModeOption, HumanizeUiCopy } from '$lib/ai-humanize/constants/config';

/** Mode toggle labels and short helper copy for the Humanize modal (Thai UI). */
export const HUMANIZE_MODE_OPTIONS = [
	{
		id: 'human' as const,
		label: 'ให้เป็นธรรมชาติ',
		description: 'ปรับข้อความให้อ่านเป็นธรรมชาติ ไม่ดูเหมือน AI เขียน'
	},
	{
		id: 'roughen' as const,
		label: 'แบบพูดคุย',
		description: 'หยาบกว่า เป็นกันเองแบบพิมพ์สด ตรวจรายละเอียดที่ถูกเติมใหม่ก่อนโพสต์'
	}
] as const satisfies readonly HumanizeModeOption[];

/** Stable alias for consumers that still import `HUMANIZE_MODE_OPTIONS_TH`. */
export const HUMANIZE_MODE_OPTIONS_TH = HUMANIZE_MODE_OPTIONS;

/** Short UI strings shown around the Humanize modal sections (Thai UI). */
export const HUMANIZE_UI_COPY: HumanizeUiCopy = {
	modeSection: 'โหมด',
	draftSection: 'โพสต์ต้นฉบับ',
	rewriteSection: 'ฉบับเขียนใหม่',
	localCleanupChip: 'ปรับข้อความในเครื่อง',
	charactersSuffix: 'ตัวอักษร',
	tellsSuffix: 'จุดสังเกต'
};
