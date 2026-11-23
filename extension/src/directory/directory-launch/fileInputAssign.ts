function asFileList(files: File[]): FileList {
	const list = {
		length: files.length,
		item(index: number) {
			return files[index] ?? null;
		},
		*[Symbol.iterator]() {
			for (const file of files) yield file;
		},
	} as FileList;
	return list;
}

export function assignFilesToInput(input: HTMLInputElement, files: File[]): boolean {
	if (files.length === 0) return false;
	if (typeof DataTransfer !== 'undefined') {
		const transfer = new DataTransfer();
		for (const file of files) {
			transfer.items.add(file);
		}
		input.files = transfer.files;
	} else {
		Object.defineProperty(input, 'files', {
			configurable: true,
			value: asFileList(files),
		});
	}
	input.dispatchEvent(new Event('input', { bubbles: true }));
	input.dispatchEvent(new Event('change', { bubbles: true }));
	if (typeof DragEvent !== 'undefined' && typeof DataTransfer !== 'undefined') {
		const transfer = new DataTransfer();
		for (const file of files) {
			transfer.items.add(file);
		}
		const dropTarget =
			input.closest(
				'[data-dropzone], [class*="dropzone" i], [class*="drop-zone" i], [class*="upload" i], label'
			) ?? input.parentElement;
		if (dropTarget) {
			try {
				dropTarget.dispatchEvent(
					new DragEvent('drop', {
						bubbles: true,
						cancelable: true,
						dataTransfer: transfer,
					})
				);
			} catch {
				/* DragEvent unsupported in test env */
			}
		}
	}
	return true;
}