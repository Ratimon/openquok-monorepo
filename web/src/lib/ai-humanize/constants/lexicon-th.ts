import type { HumanizeLexiconEntry, HumanizeTier2LexiconEntry } from '$lib/ai-humanize/constants/writingGuide.types';

/**
 * Thai wordbank — คำสำเร็จรูป/ศัพท์ฟุ้งเฟ้อที่ AI เขียนไทยชอบใช้
 * Pair each tier-1 term with a plainer stand-in used by the local rewrite.
 * หมายเหตุ: ภาษาไทยไม่มีการผันคำ — match แบบ substring ตรงตัว
 */
export const HUMANIZE_TIER1_VERBS_TH: readonly HumanizeLexiconEntry[] = [
	{ term: 'ปฏิวัติ', simpler: 'เปลี่ยน', group: 'verbs' },
	{ term: 'ปฏิวัติวงการ', simpler: 'เปลี่ยนวงการ', group: 'verbs' },
	{ term: 'ขับเคลื่อน', simpler: 'ผลักดัน', group: 'verbs' },
	{ term: 'ยกระดับ', simpler: 'ทำให้ดีขึ้น', group: 'verbs' },
	{ term: 'ปลดล็อกศักยภาพ', simpler: 'เปิดโอกาส', group: 'verbs' },
	{ term: 'ปลดล็อก', simpler: 'เปิด', group: 'verbs' },
	{ term: 'เสริมพลัง', simpler: 'ช่วย', group: 'verbs' },
	{ term: 'ปรับใช้อย่างเต็มศักยภาพ', simpler: 'ใช้', group: 'verbs' },
	{ term: 'นำทาง', simpler: 'ทำงานผ่าน', group: 'verbs' },
	{ term: 'เจาะลึก', simpler: 'ดูรายละเอียด', group: 'verbs' },
	{ term: 'ถอดรหัส', simpler: 'อธิบาย', group: 'verbs' },
	{ term: 'ปลดปล่อย', simpler: 'ปล่อย', group: 'verbs' },
	{ term: 'จุดประกาย', simpler: 'เริ่ม', group: 'verbs' },
	{ term: 'เป็นจุดเริ่มต้นของการ', simpler: 'เริ่ม', group: 'verbs' },
	{ term: 'ฉีกกฎ', simpler: 'เปลี่ยน', group: 'verbs' },
	{ term: 'สร้างนวัตกรรม', simpler: 'สร้างของใหม่', group: 'verbs' },
	{ term: 'เป็นเบื้องหลัง', simpler: 'ช่วย', group: 'verbs' },
	{ term: 'ตอกย้ำ', simpler: 'ยืนยัน', group: 'verbs' },
	{ term: 'เผยถึง', simpler: 'แสดง', group: 'verbs' },
	{ term: 'ส่องแสงให้เห็น', simpler: 'ชี้ให้เห็น', group: 'verbs' },
	{ term: 'เป็นแสงสว่างนำทาง', simpler: 'ช่วยชี้ทาง', group: 'verbs' }
];

export const HUMANIZE_TIER1_NOUNS_TH: readonly HumanizeLexiconEntry[] = [
	{ term: 'ภูมิทัศน์', simpler: 'สภาพ', group: 'nouns' },
	{ term: 'โลกของ', simpler: 'วงการ', group: 'nouns' },
	{ term: 'ระบบนิเวศ', simpler: 'กลุ่ม', group: 'nouns' },
	{ term: 'พาราไดม์', simpler: 'แบบแผน', group: 'nouns' },
	{ term: 'ความเป็นอันหนึ่งอันเดียวกัน', simpler: 'ความสามัคคี', group: 'nouns' },
	{ term: 'เครื่องพิสูจน์', simpler: 'หลักฐาน', group: 'nouns' },
	{ term: 'แสงสว่าง', simpler: 'ที่พึ่ง', group: 'nouns' },
	{ term: 'การเดินทาง', simpler: 'ช่วงเวลา', group: 'nouns' },
	{ term: 'เส้นทางการเติบโต', simpler: 'การเติบโต', group: 'nouns' },
	{ term: 'นวัตกรรมที่ล้ำสมัย', simpler: 'ของใหม่', group: 'nouns' },
	{ term: 'ศักยภาพอันไม่จำกัด', simpler: 'ศักยภาพ', group: 'nouns' },
	{ term: 'คุณค่าที่ไม่อาจประเมิน', simpler: 'คุณค่า', group: 'nouns' }
];

export const HUMANIZE_TIER1_ADJECTIVES_TH: readonly HumanizeLexiconEntry[] = [
	{ term: 'สำคัญอย่างยิ่ง', simpler: 'สำคัญ', group: 'adjectives' },
	{ term: 'ราบรื่นอย่างไร้รอยต่อ', simpler: 'ง่าย', group: 'adjectives' },
	{ term: 'ไร้รอยต่อ', simpler: 'ง่าย', group: 'adjectives' },
	{ term: 'แข็งแกร่ง', simpler: 'ทนทาน', group: 'adjectives' },
	{ term: 'ล้ำสมัย', simpler: 'ทันสมัย', group: 'adjectives' },
	{ term: 'ก้าวล้ำ', simpler: 'ใหม่', group: 'adjectives' },
	{ term: 'เปลี่ยนเกม', simpler: 'สำคัญ', group: 'adjectives' },
	{ term: 'ปฏิวัติวงการ', simpler: 'ใหม่', group: 'adjectives' },
	{ term: 'ไร้เทียมทาน', simpler: 'ดีที่สุด', group: 'adjectives' },
	{ term: 'ปราณีต', simpler: 'ละเอียด', group: 'adjectives' },
	{ term: 'ซับซ้อนอย่างมีนัยยะ', simpler: 'ซับซ้อน', group: 'adjectives' },
	{ term: 'ทุ่มเทไม่รู้จักเหน็ดเหนื่อย', simpler: 'ทุ่มเท', group: 'adjectives' },
	{ term: 'ไม่สั่นคลอน', simpler: 'มั่นคง', group: 'adjectives' },
	{ term: 'เหนือกาลเวลา', simpler: 'ยั่งยืน', group: 'adjectives' },
	{ term: 'ทันต่อเวลา', simpler: 'ทันสมัย', group: 'adjectives' },
	{ term: 'ที่เปลี่ยนแปลงตลอดเวลา', simpler: '', group: 'adjectives' },
	{ term: 'จังหวะรวดเร็ว', simpler: 'เร็ว', group: 'adjectives' }
];

/** Stock openers/closers — ประโยคเปิด-ปิดสำเร็จรูป */
export const HUMANIZE_TIER1_STOCK_PHRASES_TH: readonly HumanizeLexiconEntry[] = [
	{ term: 'ในยุคที่เทคโนโลยีก้าวไกล', simpler: '', group: 'stockPhrases' },
	{ term: 'ในโลกยุคปัจจุบันที่เปลี่ยนแปลงรวดเร็ว', simpler: '', group: 'stockPhrases' },
	{ term: 'ในยุคดิจิทัล', simpler: '', group: 'stockPhrases' },
	{ term: 'สิ่งสำคัญคือต้องสังเกตว่า', simpler: '', group: 'stockPhrases' },
	{ term: 'มีบทบาทสำคัญ', simpler: 'สำคัญ', group: 'stockPhrases' },
	{ term: 'เป็นเครื่องพิสูจน์ถึง', simpler: 'แสดงว่า', group: 'stockPhrases' },
	{ term: 'การนำทางผ่านความซับซ้อนของ', simpler: 'จัดการกับ', group: 'stockPhrases' },
	{ term: 'โดยสรุป', simpler: '', group: 'stockPhrases' },
	{ term: 'ในบทสรุป', simpler: '', group: 'stockPhrases' },
	{ term: 'แก่นแท้ของเรื่องนี้คือ', simpler: 'ที่จริงคือ', group: 'stockPhrases' },
	{ term: 'อย่างไรก็ตาม', simpler: 'แต่', group: 'stockPhrases' },
	{ term: 'ปูทางไปสู่', simpler: 'นำไปสู่', group: 'stockPhrases' },
	{ term: 'ข้อมูลเชิงลึกอันมีค่า', simpler: 'ข้อคิด', group: 'stockPhrases' },
	{ term: 'มาดำดิ่งสู่', simpler: 'ดู', group: 'stockPhrases' },
	{ term: 'มาแกะรอย', simpler: 'ดู', group: 'stockPhrases' },
	{ term: 'ยิ่งไปกว่านั้น', simpler: '', group: 'stockPhrases' },
	{ term: 'นอกจากนี้', simpler: '', group: 'stockPhrases' },
	{ term: 'นอกเหนือจากนี้', simpler: '', group: 'stockPhrases' }
];

/** Narrative clichés — สำนวนเล่าเรื่องเชยๆ */
export const HUMANIZE_NARRATIVE_CLICHES_TH: readonly HumanizeLexiconEntry[] = [
	{ term: 'ไม่อาจฝืนความรู้สึกได้', simpler: '', group: 'narrativeCliches' },
	{ term: 'หัวใจเต้นแรง', simpler: '', group: 'narrativeCliches' },
	{ term: 'ความรู้สึกXซึ่งไหลบ่ายมา', simpler: '', group: 'narrativeCliches' },
	{ term: 'พบความปลอบใจ', simpler: '', group: 'narrativeCliches' },
	{ term: 'จิตวิญญาณมนุษย์', simpler: '', group: 'narrativeCliches' },
	{ term: 'ใครจะไปรู้เล่า', simpler: '', group: 'narrativeCliches' },
	{ term: 'เป็นเรื่องเตือนใจอย่างชัดเจน', simpler: '', group: 'narrativeCliches' },
	{ term: 'ซ่อนตัวอยู่ระหว่าง', simpler: 'อยู่ระหว่าง', group: 'narrativeCliches' },
	{ term: 'คึกคัก', simpler: 'คนเยอะ', group: 'narrativeCliches' },
	{ term: 'ลึกลับน่าค้นหา', simpler: '', group: 'narrativeCliches' },
	{ term: 'น่าดึงดูดใจ', simpler: 'น่าสนใจ', group: 'narrativeCliches' }
];

export const HUMANIZE_TIER2_TH: readonly HumanizeTier2LexiconEntry[] = [
	{ term: 'ครอบคลุม' },
	{ term: 'มีนัยสำคัญ' },
	{ term: 'จำเป็น' },
	{ term: 'วิกฤต' },
	{ term: 'นวัตกรรม' },
	{ term: 'กรอบการทำงาน' },
	{ term: 'ความท้าทาย' },
	{ term: 'โอกาส' }
];

export const HUMANIZE_TIER1_LEXICON_TH: readonly HumanizeLexiconEntry[] = [
	...HUMANIZE_TIER1_VERBS_TH,
	...HUMANIZE_TIER1_NOUNS_TH,
	...HUMANIZE_TIER1_ADJECTIVES_TH,
	...HUMANIZE_TIER1_STOCK_PHRASES_TH,
	...HUMANIZE_NARRATIVE_CLICHES_TH
];
