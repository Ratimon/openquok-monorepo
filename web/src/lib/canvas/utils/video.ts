/**
 * Raster preview from a video URL (blob URL or remote URL). Used for upload thumbnails;
 * the canvas uses Konva images only, so video is placed as this still frame.
 */
export async function getVideoPreview(src: string, seekSeconds = 5): Promise<string> {
	if (typeof document === 'undefined') {
		throw new Error('getVideoPreview requires a browser environment');
	}

	return new Promise((resolve, reject) => {
		const video = document.createElement('video');
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			reject(new Error('Canvas 2D context unavailable'));
			return;
		}

		video.crossOrigin = 'anonymous';
		video.src = src;

		const cleanup = () => {
			video.remove();
		};

		video.addEventListener('error', () => {
			cleanup();
			reject(new Error('Failed to load video'));
		});

		video.addEventListener('loadeddata', () => {
			const w = video.videoWidth;
			const h = video.videoHeight;
			if (!w || !h) {
				cleanup();
				reject(new Error('Invalid video dimensions'));
				return;
			}
			const aspect = w / h;
			canvas.width = 480;
			canvas.height = 480 / aspect;
			const duration = video.duration;
			const seek =
				Number.isFinite(duration) && duration > 0
					? Math.min(seekSeconds, Math.max(0.05, duration * 0.25))
					: seekSeconds;
			video.currentTime = seek;
		});

		video.addEventListener('seeked', () => {
			try {
				ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
				resolve(canvas.toDataURL('image/png'));
			} catch (e) {
				reject(e instanceof Error ? e : new Error(String(e)));
			} finally {
				cleanup();
			}
		});
	});
}
