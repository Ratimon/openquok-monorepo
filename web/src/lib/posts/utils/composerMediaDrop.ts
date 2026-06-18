import type { PostMediaProgrammerModel } from '$lib/posts/Post.repository.svelte';

import { uploadSocialPostComposerMediaFiles } from '$lib/posts';
import type { MediaUploadProgress } from '$lib/medias/utils/mediaUpload';

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
