import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const landingDir = join(webRoot, 'static', 'landing');

const DEFAULT_WIDTH = 1024;

function usage() {
	console.error(`Usage: node scripts/transcode-landing-hero.mjs --input <path> --name <basename>

  --input      Source video or still image (e.g. ~/Desktop/clip.mp4, chart.png)
  --name       Output basename without extension (e.g. calendar-filters-views)
  --width      Max width in pixels (default: ${DEFAULT_WIDTH})
  --webp-only  Write only static/landing/<name>.webp (no mp4/webm)

Default (no --webp-only):
  static/landing/<name>.mp4  (H.264, faststart, no audio)
  static/landing/<name>.webm (VP9, no audio)
`);
}

function parseArgs(argv) {
	let input = '';
	let name = '';
	let width = DEFAULT_WIDTH;
	let webpOnly = false;

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === '--input') {
			input = argv[++i] ?? '';
		} else if (arg === '--name') {
			name = argv[++i] ?? '';
		} else if (arg === '--width') {
			width = Number(argv[++i]);
		} else if (arg === '--webp-only') {
			webpOnly = true;
		} else if (arg === '-h' || arg === '--help') {
			usage();
			process.exit(0);
		} else {
			console.error(`Unknown argument: ${arg}`);
			usage();
			process.exit(1);
		}
	}

	if (!input || !name) {
		usage();
		process.exit(1);
	}

	if (!Number.isFinite(width) || width < 1) {
		console.error('--width must be a positive number');
		process.exit(1);
	}

	if (
		name.includes('/') ||
		name.includes('\\') ||
		name.endsWith('.mp4') ||
		name.endsWith('.webm') ||
		name.endsWith('.webp')
	) {
		console.error('--name must be a basename without extension or path separators');
		process.exit(1);
	}

	return { input, name, width, webpOnly };
}

function resolveFfmpeg() {
	const candidates = ['ffmpeg', '/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg'];
	for (const bin of candidates) {
		const r = spawnSync(bin, ['-version'], { stdio: 'ignore' });
		if (r.status === 0) return bin;
	}
	console.error('ffmpeg not found. Install it (e.g. brew install ffmpeg) and retry.');
	process.exit(1);
}

function runFfmpeg(ffmpeg, args) {
	const r = spawnSync(ffmpeg, args, { stdio: 'inherit' });
	if (r.status !== 0) {
		process.exit(r.status === null ? 1 : r.status);
	}
}

function ffmpegHasEncoder(ffmpeg, encoder) {
	const r = spawnSync(ffmpeg, ['-hide_banner', '-encoders'], { encoding: 'utf8' });
	return r.status === 0 && (r.stdout ?? '').includes(encoder);
}

function exportLandingWebp(ffmpeg, { input, name, width }) {
	const webpOut = join(landingDir, `${name}.webp`);
	const scale = `scale=${width}:-2:flags=lanczos`;

	if (ffmpegHasEncoder(ffmpeg, 'libwebp')) {
		console.log(`Exporting ${input} -> ${webpOut}`);
		runFfmpeg(ffmpeg, [
			'-y',
			'-i',
			input,
			'-vf',
			scale,
			'-frames:v',
			'1',
			'-update',
			'1',
			'-c:v',
			'libwebp',
			'-quality',
			'85',
			webpOut
		]);
		return;
	}

	const pngOut = join(landingDir, `${name}.png`);
	console.warn('ffmpeg libwebp encoder not found; writing PNG. Convert to WebP if needed.');
	console.log(`Exporting ${input} -> ${pngOut}`);
	runFfmpeg(ffmpeg, [
		'-y',
		'-i',
		input,
		'-vf',
		scale,
		'-frames:v',
		'1',
		'-update',
		'1',
		pngOut
	]);
}

const { input, name, width, webpOnly } = parseArgs(process.argv.slice(2));
const ffmpeg = resolveFfmpeg();

mkdirSync(landingDir, { recursive: true });

const scale = `scale=${width}:-2:flags=lanczos`;

if (webpOnly) {
	exportLandingWebp(ffmpeg, { input, name, width });
	console.log('Done.');
	process.exit(0);
}

const mp4Out = join(landingDir, `${name}.mp4`);
const webmOut = join(landingDir, `${name}.webm`);

console.log(`Transcoding ${input} -> ${mp4Out}`);
runFfmpeg(ffmpeg, [
	'-y',
	'-i',
	input,
	'-vf',
	scale,
	'-an',
	'-c:v',
	'libx264',
	'-preset',
	'slow',
	'-crf',
	'23',
	'-movflags',
	'+faststart',
	mp4Out
]);

console.log(`Transcoding ${input} -> ${webmOut}`);
runFfmpeg(ffmpeg, [
	'-y',
	'-i',
	input,
	'-vf',
	scale,
	'-an',
	'-c:v',
	'libvpx-vp9',
	'-b:v',
	'0',
	'-crf',
	'32',
	'-row-mt',
	'1',
	webmOut
]);

console.log('Done.');
