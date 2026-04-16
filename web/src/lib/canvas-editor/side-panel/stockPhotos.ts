/** Deterministic preview tiles for the design picker (public image service, no API key). */
export type StockPhotoEntry = {
	id: string;
	thumbUrl: string;
	fullUrl: string;
};

export const STOCK_PHOTOS: StockPhotoEntry[] = Array.from({ length: 36 }, (_, i) => {
	const seed = `openquokdm${i}`;
	return {
		id: seed,
		thumbUrl: `https://picsum.photos/seed/${seed}/120/150`,
		fullUrl: `https://picsum.photos/seed/${seed}/900/1125`
	};
});
