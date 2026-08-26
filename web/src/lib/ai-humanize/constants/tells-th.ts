import type { HumanizeTellEntry, HumanizeSmokingGunEntry } from '$lib/ai-humanize/constants/writingGuide.types';

/**
 * Thai tells — รูปแบบการเขียนที่เผยว่า "นี่ AI เขียน" ในภาษาไทย
 * ภาษาไทยไม่มี spaces/capitalization → จับด้วย phrase-based matching
 */

/** Pep-talk endings — ประโยคปิดให้กำลังใจแบบ AI */
export const HUMANIZE_PEP_TALK_PHRASES_TH = [
	'อีกไม่ไกลคุณจะทำได้',
	'มาสร้างมันขึ้นมาด้วยกัน',
	'อนาคตเป็นของคุณ',
	'พร้อมหรือยังไปกันเถอะ',
	'การเดินทางเพิ่งเริ่มต้น',
	'ไปกันเถอะ',
	'ขอให้โชคดีในการเดินทาง',
	'เริ่มต้นวันนี้เลย'
] as const;

/** Conclusion phrases — ประโยคสรุปแบบ signposted */
export const HUMANIZE_CONCLUSION_PHRASES_TH = [
	'โดยสรุป',
	'บทสรุปคือ',
	'กล่าวโดยสรุป',
	'สรุปได้ว่า',
	'สรุปแล้ว',
	'เพื่อสรุปสั้นๆ',
	'แก่นแท้ก็คือ'
] as const;

/** Prompt echo — เปิดกระดาษเหมือนตอบ essay prompt */
export const HUMANIZE_PROMPT_ECHO_PHRASES_TH = [
	'ในบทความนี้เราจะพูดถึง',
	'ในเนื้อหานี้เราจะสำรวจ',
	'เรื่องนี้จะพาคุณไปรู้จักกับ',
	'มาทำความเข้าใจเกี่ยวกับ'
] as const;

/** Fractal summary openers — recap ซ้ำทุก heading */
export const HUMANIZE_FRACTAL_SUMMARY_PHRASES_TH = [
	'ในส่วนนี้เราจะ',
	'ในหัวข้อนี้เราจะ',
	'ก่อนจะไปต่อมารีวิวกันสั้นๆ ว่า',
	'สรุปส่วนนี้'
] as const;

/**
 * Negative parallelism ไทย: "ไม่ใช่ X แต่คือ Y"
 * Bounded to one sentence.
 */
export const HUMANIZE_NEGATIVE_PARALLELISM_TH_RE =
	/ไม่ใช่[^.!?\n]{1,60}?(?:แต่|หากแต่)คือ/g;

/** "X คือ A X คือ B X คือ C" uniform staccato — จับ "คือ" 3 ช่วงใน 1 ประโยค */
export const HUMANIZE_STACCATO_COPULA_TH_RE =
	/(?:\S+\s?คือ\s[^.!?\n]{2,30}[,.]?\s){3,}/g;

/** Participial tail ไทย: ", ทำให้... / โดย... / เพื่อ..." trailing ยาว */
export const HUMANIZE_PARTICIPIAL_TAIL_TH_RE =
	/,\s*(?:ทำให้|โดยการ|เพื่อให้|ส่งผลให้|อีกทั้ง)[^.!?\n]{0,80}/g;

/** Rule of three ไทย — 3 คำคุณศัพท์/คำนามต่อกัน */
export const HUMANIZE_RULE_OF_THREE_TH_RE =
	/(?:[\u0E00-\u0E7F]{4,}\s*,\s*[\u0E00-\u0E7F]{4,}\s*,\s*และ\s*[\u0E00-\u0E7F]{4,}){1}/g;

/** Em dash ไทย (AI ไทยเริ่มเลียนแบบ em dash ด้วย) */
export const HUMANIZE_EM_DASH_TH_RE = /—|\s–\s/g;

/** Thai tells registry — local-detectable entries */
export const HUMANIZE_TELLS_TH: readonly HumanizeTellEntry[] = [
	{
		id: 'th-pep-talk-ending',
		category: 'structure',
		detect: 'local',
		spot: 'ประโยคปิดให้กำลังใจแบบ AI ("ไปกันเถอะ", "อนาคตเป็นของคุณ")',
		fix: 'ลบทิ้ง หรือจบด้วยประเด็นจริงประเด็นสุดท้าย',
		phrases: HUMANIZE_PEP_TALK_PHRASES_TH
	},
	{
		id: 'th-conclusion-signpost',
		category: 'structure',
		detect: 'local',
		spot: '"โดยสรุป", "สรุปได้ว่า" + restatement',
		fix: 'ลบ signpost จบด้วยประเด็นจริง',
		phrases: HUMANIZE_CONCLUSION_PHRASES_TH
	},
	{
		id: 'th-prompt-echo',
		category: 'construction',
		detect: 'local',
		spot: '"ในบทความนี้เราจะพูดถึง..."',
		fix: 'ลบ เริ่มที่ประเด็นจริงเลย',
		phrases: HUMANIZE_PROMPT_ECHO_PHRASES_TH
	},
	{
		id: 'th-fractal-summary',
		category: 'structure',
		detect: 'local',
		spot: 'recap ซ้ำทุกหัวข้อ ("ในส่วนนี้เราจะ...")',
		fix: 'ลบทิ้ง',
		phrases: HUMANIZE_FRACTAL_SUMMARY_PHRASES_TH
	},
	{
		id: 'th-negative-parallelism',
		category: 'construction',
		detect: 'local',
		spot: '"ไม่ใช่ X แต่คือ Y"',
		fix: 'เรียบเป็น statement ตรงๆ',
		pattern: HUMANIZE_NEGATIVE_PARALLELISM_TH_RE
	},
	{
		id: 'th-staccato-copula',
		category: 'construction',
		detect: 'local',
		spot: '"X คือ A. Y คือ B. Z คือ C." ต่อเนื่อง',
		fix: 'รวมหรือสลับโครงสร้างประโยค',
		pattern: HUMANIZE_STACCATO_COPULA_TH_RE
	},
	{
		id: 'th-participial-tail',
		category: 'construction',
		detect: 'local',
		spot: '", ทำให้... / , ส่งผลให้..." ท้ายประโยคยาว',
		fix: 'แยกเป็นประโยคใหม่หรือตัด',
		pattern: HUMANIZE_PARTICIPIAL_TAIL_TH_RE
	},
	{
		id: 'th-rule-of-three',
		category: 'construction',
		detect: 'local',
		spot: '3 คำต่อกัน "A, B, และ C" ที่เป็นคำฟุ้ง',
		fix: 'เหลือ 1-2 คำที่จำเป็นจริง',
		pattern: HUMANIZE_RULE_OF_THREE_TH_RE
	}
];

/** Thai smoking guns — ร่องรอยจาก chat window ที่ไม่ควรหลุดลง post */
export const HUMANIZE_SMOKING_GUNS_TH: readonly HumanizeSmokingGunEntry[] = [
	{
		id: 'th-ai-self-talk',
		label: 'AI self-talk',
		phrases: [
			'ในฐานะ AI',
			'ฉันเป็นโมเดลภาษา',
			'ผมเป็นผู้ช่วย AI',
			'ในความรู้ของฉันถึง',
			'ข้อมูลของฉันมีถึง'
		]
	},
	{
		id: 'th-performative-helpful',
		label: 'Performative helpfulness',
		phrases: [
			'หวังว่าจะเป็นประโยชน์',
			'หากมีคำถามเพิ่มเติมสอบถามได้เลย',
			'ขอให้สนุกกับการอ่าน',
			'นี่คือสิ่งที่ช่วยได้'
		]
	},
	{
		id: 'th-email-signoff',
		label: 'Email sign-off on a social post',
		phrases: ['ด้วยความเคารพ', 'ขอแสดงความนับถือ', 'จาก...ด้วยความปรารถนาดี']
	},
	{
		id: 'th-bracket-placeholder',
		label: 'Bracket placeholders',
		phrases: ['[ชื่อบริษัท]', '[แทรกตัวอย่าง]', '[ชื่อ]', '[วันที่]', '(แทรกตัวเลข)']
	}
];
