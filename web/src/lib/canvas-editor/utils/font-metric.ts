const CHARS = {
	capHeight: 'S',
	baseline: 'n',
	xHeight: 'x',
	descent: 'p',
	ascent: 'h',
	tittle: 'i'
} as const;

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let halfSize = 0;

function ensureCanvas(fontFamily: string, fontSize: number, fontWeight: string) {
	if (!canvas) {
		canvas = document.createElement('canvas');
		ctx = canvas.getContext('2d');
	}
	if (!canvas || !ctx) return;
	halfSize = 0.5 * fontSize;
	canvas.width = 2 * fontSize;
	canvas.height = 2 * fontSize + halfSize;
	ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
	ctx.textBaseline = 'top';
	ctx.textAlign = 'center';
}

function setBaseline(baseline: 'top' | 'bottom') {
	if (!canvas || !ctx) return;
	const offset = baseline === 'bottom' ? canvas.height : 0;
	ctx.setTransform(1, 0, 0, 1, 0, offset);
	ctx.textBaseline = baseline;
}

function getPixels(char: string): Uint8ClampedArray {
	if (!canvas || !ctx) return new Uint8ClampedArray();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillText(char, canvas.width / 2, halfSize, canvas.width);
	return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
}

function firstRow(data: Uint8ClampedArray): number {
	if (!canvas) return data.length;
	for (let i = 3; i < data.length; i += 4) {
		if (data[i] > 0) return Math.round((i - 3) / 4 / canvas.width) - halfSize;
	}
	return data.length;
}

function lastRow(data: Uint8ClampedArray): number {
	if (!canvas) return 0;
	for (let i = data.length - 1; i >= 3; i -= 4) {
		if (data[i] > 0) return Math.round(i / 4 / canvas.width) - halfSize;
	}
	return 0;
}

function measureTop(char: string): number {
	setBaseline('top');
	return firstRow(getPixels(char));
}

function measureBottom(char: string): number {
	setBaseline('top');
	return lastRow(getPixels(char));
}

function measureBottom2(): number {
	if (!canvas) return 0;
	setBaseline('bottom');
	const b = canvas.height - lastRow(getPixels('A'));
	setBaseline('top');
	return lastRow(getPixels('A')) + b;
}

export interface FontMetrics {
	capHeight: number;
	baseline: number;
	xHeight: number;
	descent: number;
	bottom: number;
	ascent: number;
	tittle: number;
	top: number;
	fontFamily: string;
	fontWeight: string;
	fontSize: number;
}

export function measureFont(options: {
	fontFamily?: string;
	fontWeight?: string;
	fontSize?: number;
} = {}): FontMetrics {
	const { fontFamily = 'Times', fontWeight = 'normal', fontSize = 200 } = options;
	ensureCanvas(fontFamily, fontSize, fontWeight);

	return {
		capHeight: measureTop(CHARS.capHeight),
		baseline: measureBottom(CHARS.baseline),
		xHeight: measureTop(CHARS.xHeight),
		descent: measureBottom(CHARS.descent),
		bottom: measureBottom2(),
		ascent: measureTop(CHARS.ascent),
		tittle: measureTop(CHARS.tittle),
		top: 0,
		fontFamily,
		fontWeight,
		fontSize
	};
}

