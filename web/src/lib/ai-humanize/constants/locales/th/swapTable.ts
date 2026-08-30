import type { HumanizeSwapRow } from '$lib/ai-humanize/constants/writingGuide.types';

/**
 * Thai swap table — แม็ปวลีที่ flag → คำธรรมดา หรือลบทิ้ง (string ว่าง)
 * ใช้โดย localRewrite เมื่อ locale = th
 */
export const HUMANIZE_SWAP_TABLE: readonly HumanizeSwapRow[] = [
	{ flagged: 'ปฏิวัติวงการ', instead: 'เปลี่ยนวงการ' },
	{ flagged: 'นำพาไปสู่', instead: 'นำไปสู่' },
	{ flagged: 'ทำหน้าที่เป็น', instead: 'เป็น' },
	{ flagged: 'กล่าวได้ว่า', instead: '' },
	{ flagged: 'เป็นที่ยอมรับกันว่า', instead: '' },
	{ flagged: 'อันที่จริงแล้ว', instead: 'จริงๆ แล้ว' },
	{ flagged: 'ด้วยเหตุนี้', instead: 'ดังนั้น' },
	{ flagged: 'ในฐานะที่เป็น', instead: 'ในฐานะ' },
	{ flagged: 'มีความสำคัญอย่างมากต่อ', instead: 'สำคัญต่อ' },
	{ flagged: 'มีบทบาทอย่างมากในการ', instead: 'ช่วย' },
	{ flagged: 'เป็นกุญแจสำคัญของ', instead: 'จำเป็นสำหรับ' },
	{ flagged: 'เปิดประตูสู่', instead: 'เปิดทางให้' },
	{ flagged: 'เป็นรากฐานที่มั่นคงของ', instead: 'รองรับ' },
	{ flagged: 'สะท้อนให้เห็นถึง', instead: 'สะท้อน' },
	{ flagged: 'สร้างความแตกต่างอย่างมาก', instead: 'ช่วยได้จริง' },
	{ flagged: 'อย่างไรก็ดี', instead: 'แต่' },
	{ flagged: 'ทั้งนี้ทั้งนั้น', instead: '' },
	{ flagged: 'กล่าวคือ', instead: 'คือ' },
	{ flagged: 'ในทำนองเดียวกัน', instead: 'เช่นเดียวกับ' },
	{ flagged: 'โดยพื้นฐานแล้ว', instead: '' },
	{ flagged: 'ในแง่มุมหนึ่ง', instead: '' }
];
