import type { HumanizeSmokingGunEntry } from '$lib/ai-humanize/constants/writingGuide.types';

/** Thai smoking guns — ร่องรอยจาก chat window ที่ไม่ควรหลุดลง post */
export const HUMANIZE_SMOKING_GUNS: readonly HumanizeSmokingGunEntry[] = [
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
