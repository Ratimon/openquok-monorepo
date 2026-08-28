import type { PostMediaProgrammerModel } from '$lib/posts/Post.repository.svelte';
import type { MediaUploadProgress } from '$lib/medias/utils/mediaUpload';

import { publicUrlForMediaStorageKey } from '$lib/medias/utils/mediaUrls';
import { uploadSocialPostComposerMediaFiles } from '$lib/posts/Post.repository.svelte';

/** Preview `src` for composer media: local blob URLs first, then public storage URLs. */
export function postMediaPreviewUrls(items: readonly PostMediaProgrammerModel[]): string[] {
	return items.map((m) => {
		const local = m.localPreviewUrl?.trim();
		if (local) return local;
		const path = m.path.trim();
		if (path.startsWith('blob:')) return path;
		return publicUrlForMediaStorageKey(path);
	});
}

/** Collect files from a drag event (`files` first, then `items` for Safari). */
export function filesFromDataTransfer(transfer: DataTransfer | null | undefined): File[] {
	if (!transfer) return [];
	if (transfer.files?.length) return Array.from(transfer.files);
	const out: File[] = [];
	for (const item of Array.from(transfer.items ?? [])) {
		if (item.kind !== 'file') continue;
		const file = item.getAsFile();
		if (file) out.push(file);
	}
	return out;
}

function toFileList(files: File[]): FileList {
	const dt = new DataTransfer();
	for (const file of files) {
		dt.items.add(file);
	}
	return dt.files;
}

export async function attachComposerMediaFromFiles(args: {
	files: File[] | FileList | null | undefined;
	uploadUid: string;
	publishDateIso?: string | null;
	onProgress?: (progress: MediaUploadProgress) => void;
}): Promise<
	{ ok: true; items: PostMediaProgrammerModel[] } | { ok: false; message: string }
> {
	const list =
		args.files == null
			? []
			: args.files instanceof FileList
				? Array.from(args.files)
				: args.files;
	if (!list.length) {
		return { ok: false, message: 'No files to attach.' };
	}
	if (!args.uploadUid.trim()) {
		return {
			ok: false,
			message: 'Workspace is not ready for uploads. Try again in a moment.'
		};
	}
	return uploadSocialPostComposerMediaFiles(toFileList(list), args.uploadUid, {
		publishDateIso: args.publishDateIso,
		onProgress: args.onProgress
	});
}

export function isComposerMediaFile(file: File): boolean {
	const mime = file.type.toLowerCase();
	if (mime.startsWith('image/') || mime.startsWith('video/')) return true;
	return /\.(png|jpe?g|gif|webp|svg|avif|mp4|mov|webm|m4v|mpeg)$/i.test(file.name);
}

function localPathForComposerFile(file: File): string {
	const name = file.name.trim();
	if (name.includes('.')) return name;
	const mime = file.type.toLowerCase();
	const ext = mime.includes('png')
		? 'png'
		: mime.includes('jpeg') || mime.includes('jpg')
			? 'jpg'
			: mime.includes('gif')
				? 'gif'
				: mime.includes('webp')
					? 'webp'
					: mime.includes('mp4')
						? 'mp4'
						: mime.includes('webm')
							? 'webm'
							: mime.includes('quicktime')
								? 'mov'
								: mime.startsWith('video/')
									? 'mp4'
									: mime.startsWith('image/')
										? 'jpg'
										: 'bin';
	return `${name || 'media'}.${ext}`;
}

function filesToArray(files: File[] | FileList | null | undefined): File[] {
	if (files == null) return [];
	if (Array.isArray(files)) return files;
	return Array.from(files);
}

/**
 * Guest composer: attach files as local `blob:` previews without calling `/api/v1/media`.
 */
export function attachComposerMediaFromLocalFiles(args: {
	files: File[] | FileList | null | undefined;
}): { ok: true; items: PostMediaProgrammerModel[] } | { ok: false; message: string } {
	const list = filesToArray(args.files).filter(isComposerMediaFile);
	if (!list.length) {
		return { ok: false, message: 'Add image or video files only.' };
	}
	if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
		return { ok: false, message: 'Local media previews are only available in the browser.' };
	}
	const items: PostMediaProgrammerModel[] = list.map((file) => ({
		id: crypto.randomUUID(),
		path: localPathForComposerFile(file),
		localPreviewUrl: URL.createObjectURL(file)
	}));
	return { ok: true, items };
}

export function revokeLocalMediaPreviewUrl(previewUrl: string | null | undefined): void {
	const value = previewUrl?.trim();
	if (!value || !value.startsWith('blob:')) return;
	if (typeof URL === 'undefined' || typeof URL.revokeObjectURL !== 'function') return;
	URL.revokeObjectURL(value);
}

export function revokeLocalMediaPreviewUrls(items: readonly PostMediaProgrammerModel[]): void {
	for (const item of items) {
		revokeLocalMediaPreviewUrl(item.localPreviewUrl);
	}
}
