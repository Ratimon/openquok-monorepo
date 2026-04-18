const TEST_TEXT = 'Some test text;?#D-ПРИВЕТ!1230o9u8i7y6t5r4e3w2q1';

export type GlobalFont = {
	fontFamily: string;
	/** URL to font file (ttf/otf/woff/woff2). */
	url?: string;
};

// Small curated list (keeps UX snappy; can be expanded later).
const DEFAULT_GOOGLE_FONTS = [
	'Roboto',
	'Inter',
	'Montserrat',
	'Poppins',
	'Playfair Display',
	'Oswald',
	'Raleway',
	'Lora',
	'Roboto Mono',
	'Nunito'
] as const;

let googleFonts: string[] = [...DEFAULT_GOOGLE_FONTS];
let googleFontsChanged = false;

export function isGoogleFontChanged(): boolean {
	return googleFontsChanged;
}

export function setGoogleFonts(fonts: string[] | 'default') {
	if (fonts === 'default') {
		googleFonts = [...DEFAULT_GOOGLE_FONTS];
		googleFontsChanged = false;
		return;
	}
	googleFonts = [...fonts];
	googleFontsChanged = true;
}

export function getFontsList(): string[] {
	return googleFonts;
}

export const globalFonts: GlobalFont[] = [];

export function addGlobalFont(font: GlobalFont) {
	globalFonts.push(font);
}

export function removeGlobalFont(fontFamily: string) {
	const idx = globalFonts.findIndex((f) => f.fontFamily === fontFamily);
	if (idx !== -1) globalFonts.splice(idx, 1);
}

let googleVariants = '400,400italic,700,700italic';
export function setGoogleFontsVariants(variants: string) {
	googleVariants = variants;
}
export function getGoogleFontsVariants(): string {
	return googleVariants;
}

export function getGoogleFontsUrl(family: string): string {
	return `https://fonts.googleapis.com/css?family=${encodeURIComponent(
		family.replace(/ /g, '+')
	)}:${googleVariants}`;
}

const injectedGoogle: Record<string, boolean> = {};
export function injectGoogleFont(family: string) {
	if (typeof document === 'undefined') return;
	if (injectedGoogle[family]) return;
	const link = document.createElement('link');
	link.type = 'text/css';
	link.rel = 'stylesheet';
	link.href = getGoogleFontsUrl(family);
	document.head.appendChild(link);
	injectedGoogle[family] = true;
}

let measureCanvas: HTMLCanvasElement | null = null;
function measureText(
	family: string,
	fallback: string,
	style = 'normal',
	weight = 'normal'
): number {
	if (!measureCanvas) measureCanvas = document.createElement('canvas');
	const ctx = measureCanvas.getContext('2d');
	if (!ctx) return 0;
	ctx.font = `${style} ${weight} 40px '${family}', ${fallback}`;
	return ctx.measureText(TEST_TEXT).width;
}

function measureSans(style = 'normal', weight = 'normal') {
	if (!measureCanvas) measureCanvas = document.createElement('canvas');
	const ctx = measureCanvas.getContext('2d');
	if (!ctx) return 0;
	ctx.font = `${style} ${weight} 40px sans-serif`;
	return ctx.measureText(TEST_TEXT).width;
}

function measureSerif(style = 'normal', weight = 'normal') {
	if (!measureCanvas) measureCanvas = document.createElement('canvas');
	const ctx = measureCanvas.getContext('2d');
	if (!ctx) return 0;
	ctx.font = `${style} ${weight} 40px serif`;
	return ctx.measureText(TEST_TEXT).width;
}

const loadedFonts: Record<string, boolean> = { Arial: true };

export function isFontLoaded(family: string): boolean {
	return Object.keys(loadedFonts).some((k) => k.startsWith(family + '_')) || !!loadedFonts[family];
}

export async function loadFont(
	family: string,
	style = 'normal',
	weight = 'normal'
): Promise<void> {
	if (typeof document === 'undefined') return;
	const key = `${family}_${style}_${weight}`;
	if (loadedFonts[key]) return;

	// Inject Google CSS if it looks like a Google font.
	if (getFontsList().includes(family)) injectGoogleFont(family);

	const baselineSans = measureSans(style, weight);

	// Fast path: Font Loading API.
	if (document.fonts?.load) {
		try {
			await document.fonts.load(`${style} ${weight} 16px '${family}'`);
			if (baselineSans !== measureText(family, 'sans-serif', style, weight)) {
				loadedFonts[key] = true;
				return;
			}
		} catch {
			// fallback to polling
		}
	}

	// Polling fallback (detect width changes from baseline).
	const baselineSerif = measureSerif(style, weight);
	const initialWidth = measureText(family, 'sans-serif', style, weight);
	const maxIterations = 120; // ~7s at 60ms
	for (let i = 0; i < maxIterations; i++) {
		const sansMeasure = measureText(family, 'sans-serif', style, weight);
		const serifMeasure = measureText(family, 'serif', style, weight);
		if (
			sansMeasure !== initialWidth ||
			sansMeasure !== baselineSans ||
			serifMeasure !== baselineSerif
		) {
			await new Promise((r) => setTimeout(r, 100));
			loadedFonts[key] = true;
			return;
		}
		await new Promise((r) => setTimeout(r, 60));
	}
}

