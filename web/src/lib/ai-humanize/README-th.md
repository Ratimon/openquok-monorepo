# OpenQuok Humanizer — คู่มือรองรับภาษาไทย (Thai support)

> **Developed by SoloCorp OS 2.4**

เอกสารนี้อธิบายชั้น locale ภาษาไทยของ AI Humanizer: สถาปัตยกรรม, กฎการ rewrite,
วิธีทดสอบ และขอบเขตปัจจุบัน โครงสร้างหลักคือ **locale layer** — ไม่มีไฟล์ EN เดิม
ถูก override; เอนจินอ่าน draft ก่อนแล้วจึงเลือก catalogs ให้เหมาะกับภาษา

## ภาพรวมสถาปัตยกรรม

```
applyLocalHumanizeRewrite(text, mode)
        │
        ├── detectHumanizeLocale(text)   # utils/localeDetect.ts
        │       สัดส่วนตัวอักษร \u0E00-\u0E7F > 20% ของ non-whitespace chars → 'th'
        │
        ├── 'th' → Thai pipeline (catalogs: lexicon-th / tells-th / swapTable-th)
        └── 'en' → EN pipeline เดิมทุกอย่าง (lexicon / tells / swapTable ฉบับ EN)
```

- `utils/localeDetect.ts` — `thaiCharRatio`, `isThaiText`, `detectHumanizeLocale`,
  threshold ที่ `HUMANIZE_THAI_DETECT_THRESHOLD = 0.2` (มากกว่า 20% แบบเข้มงวด)
- `constants/lexicon-th.ts` — Tier-1 wordbank ~70 คำ (กริยา/นาม/คุณศัพท์/สำนวนสำเร็จรูป)
- `constants/tells-th.ts` — 8 tells + regex ไทย + smoking guns (AI self-talk,
  performative helpfulness, email sign-off, bracket placeholders)
- `constants/swapTable-th.ts` — 21 แถว flagged → instead (string ว่าง = ลบทิ้ง)

## กฎ rewrite สำหรับภาษาไทย (local fallback path)

| กฎ | พฤติกรรม |
| --- | --- |
| Em dash | `—` / spaced en dash → จุลภาค `, ` (ไทยไม่มี capitalization ให้ใช้ heuristic "ตัวใหญ่ = ประโยคใหม่") |
| Negative parallelism | `ไม่ใช่ X แต่คือ Y` → `…คือ Y` (statement เรียบๆ) |
| Pep talk | ประโยคสุดท้ายที่เป็น rally cry (`ไปกันเถอะ`, `อนาคตเป็นของคุณ`) ถูกลบ; ถ้าเป็นประโยคเดียว จะลบเฉพาะวลี |
| Conclusion / prompt echo / fractal summary | `โดยสรุป`, `ในบทความนี้เราจะพูดถึง`, `ในส่วนนี้เราจะ` ฯลฯ → ลบ inline |
| Swap table + lexicon | substring replace ตรงตัว (ภาษาไทยไม่มี word boundary), เรียง longest-first, ไม่ใช้ `\b` และไม่ต้อง preserveCase |

ข้อจำกัดที่ตั้งใจ: local cleanup ฝั่ง th เหมือนกันทั้งโหมด `human`/`roughen`
(contraction แบบ EN ไม่มีในไทย); `mode` ยังคงมีผลกับ Rewriter session upstream

## Chrome Rewriter path (buildCreateOptions)

`buildComposerHumanizeCreateOptions` รับ `text` (auto-detect) หรือ `locale`
(explicit override) เพิ่ม:

- locale `th` → `expectedInputLanguages: ['th','en']`,
  `expectedContextLanguages: ['th','en']`, `outputLanguage: 'th'`
- `sharedContext` ได้ instruction block `COMPOSER_HUMANIZE_TH_LANGUAGE_CONTEXT`
  (สั่งให้ output เป็นภาษาไทยธรรมชาติ ไม่แปลแข็ง ไม่ใช้ cliché AI ไทย)
- session cache key เปลี่ยนตาม sharedContext → session ไทยไม่ชนกับอังกฤษ

## UI labels

- `constants/config.ts` — `HUMANIZE_MODE_OPTIONS_TH` (id เดิม label ไทย),
  `HUMANIZE_UI_COPY` (`en`/`th`: หัวข้อ section, chip "ปรับข้อความในเครื่อง", suffix ตัวอักษร/จุดสังเกต)
- `utils/uiLocale.ts` — อ่าน `navigator.languages` แบบ ordered list:
  tag แรกที่รู้จัก (`th*` → ไทย, `en*` → อังกฤษ) ชนะ; default `en`
- Modal (`AiHumanizeModal.svelte`) เลือก rows/copy ผ่าน helper เหล่านี้ —
  behavior การ rewrite ยังตัดสินจากเนื้อความ draft ไม่ใช่ browser locale

## ทดสอบ

```bash
cd common && pnpm build          # build openquok-common ก่อน
cd ../web && npx vitest run src/lib/ai-humanize
npx tsc --noEmit                 # 0 error จากไฟล์ชุด Thai support
```

ชุดทดสอบเฉพาะไทย:

- `utils/localeDetect.test.ts` — threshold, mixed-script routing, empty input
- `utils/localRewrite.th.test.ts` — em dash, swap คำไทย, negative parallelism,
  pep talk (multi/single sentence), conclusion/prompt echo/fractal summary,
  smoking guns, brand name EN คงเดิม, parity ระหว่างโหมด
- `utils/buildCreateOptions.test.ts` — section "Thai locale layer": language
  options, explicit override, en default ไม่ถูกแตะ, cache key
- `utils/uiLocale.test.ts` — detection, TH rows, copy map

Fixtures เป็นประโยคจริงที่ AI ไทยมักเขียน เช่น "ในยุคดิจิทัล...", "ปฏิวัติวงการ...",
"โดยสรุป...", "ไม่ใช่ X แต่คือ Y"

## ขอบเขตปัจจุบัน

- `auditTells` (ตัวนับ tell ฝั่ง UI) ยังใช้ EN patterns — การ audit ภาษาไทย
  แบบ countable จะตามมาใน PR ถัดไป
- ปุ่ม/ข้อความ secondary ของ modal (Close/Rewrite/Copy ฯลฯ) ยังเป็น EN —
  ครอบคลุมเฉพาะ mode toggle, descriptions, หัวข้อ section และ chips

---

Developed by SoloCorp OS 2.4
