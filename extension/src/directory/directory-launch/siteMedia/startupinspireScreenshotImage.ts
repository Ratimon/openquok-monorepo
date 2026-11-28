/** StartupInspire screenshot uploads reject square icons; normalize to landscape 16:9. */
const MIN_WIDTH = 1200;
const MIN_HEIGHT = 675;
const TARGET_ASPECT = 16 / 9;

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
	return new Promise((resolve) => {
		canvas.toBlob((blob) => resolve(blob), type, quality);
	});
}

async function loadImageSource(
	file: File
): Promise<{
	draw: CanvasImageSource;
	width: number;
	height: number;
	dispose: () => void;
}> {
	if (typeof createImageBitmap === 'function') {
		try {
			const bitmap = await createImageBitmap(file);
			return {
				draw: bitmap,
				width: bitmap.width,
				height: bitmap.height,
				dispose: () => bitmap.close(),
			};
		} catch {
			/* fall through */
		}
	}
	const url = URL.createObjectURL(file);
	const img = new Image();
	await new Promise<void>((resolve, reject) => {
		img.onload = () => resolve();
		img.onerror = () => reject(new Error('image load failed'));
		img.src = url;
	});
	return {
		draw: img,
		width: img.naturalWidth,
		height: img.naturalHeight,
		dispose: () => URL.revokeObjectURL(url),
	};
}

/**
 * Crops to 16:9 and scales up when the profile asset is square (favicon) or below minimum size.
 */
export async function normalizeStartupinspireScreenshotFile(file: File): Promise<File> {
	if (!file.type.startsWith('image/')) return file;
	let source: Awaited<ReturnType<typeof loadImageSource>>;
	try {
		source = await loadImageSource(file);
	} catch {
		return file;
	}

	const { width, height } = source;
	if (width <= 0 || height <= 0) {
		source.dispose();
		return file;
	}

	const aspect = width / height;
	let cropX = 0;
	let cropY = 0;
	let cropW = width;
	let cropH = height;

	if (aspect > TARGET_ASPECT) {
		cropW = height * TARGET_ASPECT;
		cropX = (width - cropW) / 2;
	} else if (aspect < TARGET_ASPECT) {
		cropH = width / TARGET_ASPECT;
		cropY = (height - cropH) / 2;
	}

	const needsResize =
		cropW < MIN_WIDTH ||
		cropH < MIN_HEIGHT ||
		Math.abs(aspect - TARGET_ASPECT) > 0.08 ||
		Math.abs(aspect - 1) < 0.08;

	if (!needsResize) {
		source.dispose();
		return file;
	}

	const scale = Math.max(MIN_WIDTH / cropW, MIN_HEIGHT / cropH, 1);
	const outW = Math.round(cropW * scale);
	const outH = Math.round(cropH * scale);

	const canvas = document.createElement('canvas');
	canvas.width = outW;
	canvas.height = outH;
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		source.dispose();
		return file;
	}
	ctx.drawImage(source.draw, cropX, cropY, cropW, cropH, 0, 0, outW, outH);
	source.dispose();

	const blob = await canvasToBlob(canvas, 'image/jpeg', 0.9);
	if (!blob) return file;
	const base = file.name.replace(/\.[^.]+$/i, '') || 'screenshot';
	return new File([blob], `${base}.jpg`, { type: 'image/jpeg' });
}