/**
 * Local file helpers (parity with OpenPolotno `utils/file` / `localFileToURL`).
 */
export function localFileToDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
	});
}
