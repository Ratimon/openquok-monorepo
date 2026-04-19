export function rectData({
	width,
	height,
	cornerRadius = 0
}: {
	width: number;
	height: number;
	cornerRadius?: number;
}): string {
	if (cornerRadius > 0) {
		const r = Math.min(cornerRadius, width / 2, height / 2);
		return (
			`M 0 ${r} A ${r} ${r} 0 0 1 ${r} 0 ` +
			`L ${width - r} 0 A ${r} ${r} 0 0 1 ${width} ${r} ` +
			`L ${width} ${height - r} A ${r} ${r} 0 0 1 ${width - r} ${height} ` +
			`L ${r} ${height} A ${r} ${r} 0 0 1 0 ${height - r} Z`
		);
	}
	return `M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`;
}

export const triangleData = ({ width, height }: { width: number; height: number }): string =>
	`M ${width / 2} 0 L ${width} ${height} L 0 ${height} Z`;

export const rightTriangleData = ({ width, height }: { width: number; height: number }): string =>
	`M 0 0 L ${width} 0 L 0 ${height} Z`;

export const circleData = ({ width, height }: { width: number; height: number }): string =>
	`M ${width / 2} ${height / 2} m -${width / 2}, 0 a ${width / 2},${height / 2} 0 1,0 ${width},0 a ${width / 2},${height / 2} 0 1,0 -${width},0`;

export function starPath({ width, height }: { width: number; height: number }): string {
	const cx = width / 2;
	const cy = height / 2;
	const rx = width / 2;
	const ry = height / 2;
	const innerRx = rx / 2;
	const innerRy = ry / 2;
	let path = '';
	const step = Math.PI / 5;
	for (let i = 0; i < 10; i++) {
		const r = i % 2 === 0 ? ry : innerRy;
		const x = cx + (i % 2 === 0 ? rx : innerRx) * Math.sin(i * step);
		const y = cy - r * Math.cos(i * step);
		path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
	}
	return path + ' Z';
}

export function diamondPath({ width, height }: { width: number; height: number }): string {
	const cx = width / 2;
	const cy = height / 2;
	return `M ${cx} 0 L ${width} ${cy} L ${cx} ${height} L 0 ${cy} Z`;
}

export function pentagonPath({ width, height }: { width: number; height: number }): string {
	const cx = width / 2;
	const cy = height / 2;
	const rx = width / 2;
	const ry = height / 2;
	let path = '';
	const step = (2 * Math.PI) / 5;
	for (let i = 0; i < 5; i++) {
		const x = cx + rx * Math.sin(i * step);
		const y = cy - ry * Math.cos(i * step);
		path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
	}
	return path + ' Z';
}

export function hexagonPath({ width, height }: { width: number; height: number }): string {
	const cx = width / 2;
	const cy = height / 2;
	const rx = width / 2;
	const ry = height / 2;
	let path = '';
	const step = (2 * Math.PI) / 6;
	for (let i = 0; i < 6; i++) {
		const x = cx + rx * Math.sin(i * step);
		const y = cy - ry * Math.cos(i * step);
		path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
	}
	return path + ' Z';
}

function scaledPath(opts: {
	path: string;
	aspectRatio: { width: number; height: number };
	width: number;
	height: number;
}): { path: string; scaleX: number; scaleY: number } {
	return {
		path: opts.path,
		scaleX: opts.width / opts.aspectRatio.width,
		scaleY: opts.height / opts.aspectRatio.height
	};
}

export function speechBubblePath({ width, height }: { width: number; height: number }): string {
	const r = 0.1 * Math.min(width, height);
	const tailW = 0.2 * width;
	const tailH = 0.2 * height;
	const cx = 0.5 * width;
	let path = `M ${r},0`;
	path += ` H ${width - r}`;
	path += ` A ${r},${r} 0 0 1 ${width},${r}`;
	path += ` V ${height - r - tailH}`;
	path += ` A ${r},${r} 0 0 1 ${width - r},${height - tailH}`;
	path += ` H ${cx + tailW / 2}`;
	path += ` L ${cx},${height}`;
	path += ` L ${cx - tailW / 2},${height - tailH}`;
	path += ` H ${r}`;
	path += ` A ${r},${r} 0 0 1 0,${height - r - tailH}`;
	path += ` V ${r}`;
	path += ` A ${r},${r} 0 0 1 ${r},0`;
	path += ' Z';
	return path;
}

export function crossPath({ width, height }: { width: number; height: number }): string {
	const bw = 0.3 * width;
	const bh = 0.3 * height;
	const cx = width / 2;
	const cy = height / 2;
	const left = cx - bw / 2;
	const right = cx + bw / 2;
	const top = cy - bh / 2;
	const bottom = cy + bh / 2;
	let path = `M ${left},0 `;
	path += `H ${right} `;
	path += `V ${top} `;
	path += `H ${width} `;
	path += `V ${bottom} `;
	path += `H ${right} `;
	path += `V ${height} `;
	path += `H ${left} `;
	path += `V ${bottom} `;
	path += 'H 0 ';
	path += `V ${top} `;
	path += `H ${left} `;
	path += 'V 0 ';
	path += 'Z';
	return path;
}

export const TYPES: Record<
	string,
	(opts: { width: number; height: number }) => string | { path: string; scaleX: number; scaleY: number }
> = {
	rect: rectData,
	circle: circleData,
	star: starPath,
	triangle: triangleData,
	rightTriangle: rightTriangleData,
	diamond: diamondPath,
	pentagon: pentagonPath,
	hexagon: hexagonPath,
	speechBubble: speechBubblePath,
	cross: crossPath,
	arc: ({ width, height }) =>
		scaledPath({
			path: 'M234 117C234 85.97 221.673 56.21 199.731 34.269C177.79 12.327 148.03 0 117 0C85.97 0 56.2103 12.327 34.2685 34.268C12.3268 56.21 0 85.97 0 117H117H234Z',
			aspectRatio: { width: 234, height: 117 },
			width,
			height
		}),
	cloud: ({ width, height }) =>
		scaledPath({
			path: 'M216.41 57.006C216.961 54.084 217.249 51.069 217.249 47.986C217.249 21.4841 195.972 0 169.725 0C153.666 0 139.467 8.043 130.865 20.3575C122.606 13.3566 111.954 9.1402 100.327 9.1402C74.3322 9.1402 53.2123 30.2136 52.8094 56.364H52.8035C23.6407 56.364 0 80.235 0 109.682C0 139.129 23.6407 163 52.8035 163H208.197C237.359 163 261 139.129 261 109.682C261 83.056 241.672 60.99 216.41 57.006Z',
			aspectRatio: { width: 261, height: 163 },
			width,
			height
		}),
	rightArrow: ({ width, height }) => {
		const tip = 0.6 * width;
		return `M 0 ${height / 4} L ${tip} ${height / 4} L ${tip} 0 L ${width} ${height / 2} L ${tip} ${height} L ${tip} ${0.75 * height} L 0 ${0.75 * height} Z`;
	},
	leftArrow: ({ width, height }) => {
		const tip = 0.4 * width;
		return `M ${width} ${height / 4} L ${tip} ${height / 4} L ${tip} 0 L 0 ${height / 2} L ${tip} ${height} L ${tip} ${0.75 * height} L ${width} ${0.75 * height} Z`;
	},
	downArrow: ({ width, height }) => {
		const tip = 0.6 * height;
		return `M ${width / 4} 0 L ${width / 4} ${tip} L 0 ${tip} L ${width / 2} ${height} L ${width} ${tip} L ${0.75 * width} ${tip} L ${0.75 * width} 0 Z`;
	},
	upArrow: ({ width, height }) => {
		const tip = 0.4 * height;
		return `M ${width / 4} ${height} L ${width / 4} ${tip} L 0 ${tip} L ${width / 2} 0 L ${width} ${tip} L ${0.75 * width} ${tip} L ${0.75 * width} ${height} Z`;
	},
	asterisk1: ({ width, height }) =>
		scaledPath({
			path: 'M45.5265 218.498C51.5466 222.87 58.5359 224.98 65.4742 224.98C75.916 224.98 86.221 220.2 92.853 211.217C92.872 211.198 92.89 211.178 92.907 211.157C92.923 211.136 92.939 211.115 92.954 211.094L92.977 211.061C92.993 211.039 93.008 211.017 93.023 210.996L116.491 178.725L139.959 210.996C139.982 211.031 140.006 211.058 140.029 211.088C140.04 211.102 140.05 211.116 140.061 211.132C151.115 226.188 172.355 229.505 187.473 218.515C202.608 207.526 205.992 186.278 195.074 171.104L195.05 171.066C195.03 171.034 195.014 171.01 194.989 170.985L171.572 138.696L209.512 126.346C227.334 120.545 237.129 101.305 231.33 83.476C225.532 65.648 206.315 55.8493 188.476 61.6334L150.537 73.933L150.52 34.0064C150.502 15.2594 135.248 0 116.508 0C97.768 0 82.514 15.2594 82.497 34.0234L82.463 73.916L44.5233 61.6163C26.5992 55.8664 7.45076 65.665 1.66886 83.46C-4.11314 101.254 5.61427 120.426 23.3511 126.278L61.4098 138.679L37.9929 170.968C26.9903 186.244 30.3572 207.492 45.5265 218.498Z',
			aspectRatio: { width: 233, height: 225 },
			width,
			height
		})
};

const blobPaths: Record<string, { path: string; aspectRatio: { width: number; height: number } }> = {
	blob1: {
		path: 'M183.5 31C198 55.5 196 87.5 189.2 119C182.7 150 171.2 181 150.5 189.6C130.1 197.8 100.5 184.2 69.8 170C39.4 156 7.8 142.2 1.3 120.6C-5.2 99 13.7 69.8 35.3 43.8C56.6 18 81.2 -4.7 109 -7.7C137.1 -10.4 168.4 6.5 183.5 31Z',
		aspectRatio: { width: 195, height: 200 }
	},
	blob2: {
		path: 'M166.3 30.7C183.8 48.5 195.9 71.9 199 98.9C202.4 125.6 197.2 155.7 179.4 169.1C161.8 182.2 131.6 178.8 103.3 177C75 175.1 48.8 174.9 29.7 161.5C10.8 148.1 -0.7 121.9 0 96.2C0.8 70.8 14.2 46.2 33.1 28.3C52.2 10.5 76.9 -0.5 101 0C125.1 0.8 148.4 12.9 166.3 30.7Z',
		aspectRatio: { width: 200, height: 179 }
	}
};

for (const [name, { path, aspectRatio }] of Object.entries(blobPaths)) {
	TYPES[name] = ({ width, height }) => scaledPath({ path, aspectRatio, width, height });
}

export function subTypeToPathDataFunc(
	subType: string
): (opts: { width: number; height: number; [key: string]: unknown }) => unknown {
	return TYPES[subType] || rectData;
}

export function figureToSvg(element: {
	id?: string;
	subType: string;
	width: number;
	height: number;
	fill: string;
	stroke: string;
	strokeWidth: number;
	dash?: number[];
}): string {
	const pathFunc = subTypeToPathDataFunc(element.subType);
	const { width, height, fill, stroke, strokeWidth, dash } = element;
	const dashArray = (dash ?? []).map((d) => d * strokeWidth);

	let pathResult = pathFunc(element) as string | { path: string; scaleX: number; scaleY: number };
	let scaleX = 1;
	let scaleY = 1;

	if (typeof pathResult !== 'string') {
		scaleX = pathResult.scaleX;
		scaleY = pathResult.scaleY;
		pathResult = pathResult.path;
	}

	const clipId = `clip-${element.id ?? crypto.randomUUID()}`;
	const strokeHalf = 2 * strokeWidth;
	const dashAttr =
		strokeWidth > 0 && dashArray.length > 0
			? ` stroke-dasharray="${dashArray.join(' ')}"`
			: '';
	const strokeLayer =
		strokeWidth > 0
			? `<path d="${pathResult}" fill="none" stroke="${stroke}" stroke-width="${strokeHalf}" clip-path="url(#${clipId})" transform="scale(${scaleX}, ${scaleY})"${dashAttr}/>`
			: '';

	return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
    <clipPath id="${clipId}">
      <path d="${pathResult}" />
    </clipPath>
  </defs>

  <path d="${pathResult}" fill="${fill}" transform="scale(${scaleX}, ${scaleY})"/>

  ${strokeLayer}
    </svg>
  `;
}
