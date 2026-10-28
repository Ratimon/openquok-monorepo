function isHttpUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

function filenameFromMediaUrl(url: string): string {
	try {
		const segment = new URL(url).pathname.split('/').filter(Boolean).pop();
		if (segment) return decodeURIComponent(segment);
	} catch {
		// fall through
	}
	return 'media';
}

function extensionFromMime(mime: string): string | null {
	const normalized = mime.trim().toLowerCase();
	if (normalized.startsWith('image/')) {
		const sub = normalized.slice('image/'.length);
		if (sub && sub !== 'jpeg') return sub === 'jpg' ? 'jpg' : sub;
		return 'jpg';
	}
	if (normalized.startsWith('video/')) {
		const sub = normalized.slice('video/'.length);
		return sub || 'mp4';
	}
	return null;
}

function ensureFilenameWithExtension(filename: string, mime: string): string {
	const base = filename.trim() || 'media';
	if (base.includes('.')) return base;
	const ext = extensionFromMime(mime);
	return ext ? `${base}.${ext}` : base;
}

export type FetchComposerMediaFromUrlResult =
	| { ok: true; file: File }
	| { ok: false; error: string };

/** Downloads an http(s) asset in the extension context (no upload). */
export async function fetchComposerMediaFileFromUrl(
	url: string
): Promise<FetchComposerMediaFromUrlResult> {
	const trimmed = url.trim();
	if (!trimmed || !isHttpUrl(trimmed)) {
		return { ok: false, error: 'Only http(s) image URLs can be attached.' };
	}

	let response: Response;
	try {
		response = await fetch(trimmed);
	} catch {
		return { ok: false, error: 'Could not download the image from this page.' };
	}

	if (!response.ok) {
		return {
			ok: false,
			error: `Could not download the image (${response.status}).`,
		};
	}

	let blob: Blob;
	try {
		blob = await response.blob();
	} catch {
		return { ok: false, error: 'Could not read the downloaded image.' };
	}

	const mime = blob.type || response.headers.get('content-type') || 'application/octet-stream';
	const file = new File([blob], ensureFilenameWithExtension(filenameFromMediaUrl(trimmed), mime), {
		type: mime,
	});

	return { ok: true, file };
}

export type DownloadMediaFileFromUrlResult = { ok: true } | { ok: false; error: string };

/** Saves an http(s) asset to the user's downloads folder (side panel / extension page). */
export async function downloadMediaFileFromUrl(
	url: string
): Promise<DownloadMediaFileFromUrlResult> {
	const fetched = await fetchComposerMediaFileFromUrl(url);
	if (!fetched.ok) return fetched;

	const objectUrl = URL.createObjectURL(fetched.file);
	try {
		const anchor = document.createElement('a');
		anchor.href = objectUrl;
		anchor.download = fetched.file.name;
		anchor.rel = 'noopener';
		document.body.appendChild(anchor);
		anchor.click();
		anchor.remove();
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
	return { ok: true };
}
