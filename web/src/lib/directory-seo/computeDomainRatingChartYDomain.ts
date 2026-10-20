/** Y-axis bounds for domain-rating line charts (0–100 scale, padded to visible range). */
export function computeDomainRatingChartYDomain(values: number[]): [number, number] {
	const finite = values.filter((value) => Number.isFinite(value));
	if (finite.length === 0) {
		return [0, 100];
	}

	let min = Math.min(...finite);
	let max = Math.max(...finite);

	if (min === max) {
		const pad = Math.max(2, min <= 0 ? 5 : Math.ceil(min * 0.12));
		min = Math.max(0, min - pad);
		max = Math.min(100, max + pad);
		if (max <= min) {
			max = Math.min(100, min + 5);
		}
		return [min, max];
	}

	const range = max - min;
	const pad = Math.max(1, range * 0.12);
	min = Math.max(0, Math.floor(min - pad));
	max = Math.min(100, Math.ceil(max + pad));
	if (max <= min) {
		max = Math.min(100, min + 1);
	}
	return [min, max];
}
