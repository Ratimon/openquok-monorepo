import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const landingDir = join(webRoot, 'static', 'landing');

const DEFAULT_WIDTH = 1024;

function usage() {
	console.error(`Usage: node scripts/transcode-landing-hero.mjs --input <path> --name <basename>

  --input   Source video (e.g. ~/Desktop/clip.mp4)
  --name    Output basename without extension (e.g. 2-calendar-filters)
  --width   Max width in pixels (default: ${DEFAULT_WIDTH})

Writes:
  static/landing/<name>.mp4  (H.264, faststart, no audio)
  static/landing/<name>.webm (VP9, no audio)
`);
}

function parseArgs(argv) {
	let input = '';
	let name = '';
	let width = DEFAULT_WIDTH;

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === '--input') {
			input = argv[++i] ?? '';
		} else if (arg === '--name') {
			name = argv[++i] ?? '';
		} else if (arg === '--width') {
			width = Number(argv[++i]);
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

	if (name.includes('/') || name.includes('\\') || name.endsWith('.mp4') || name.endsWith('.webm')) {
		console.error('--name must be a basename without extension or path separators');
		process.exit(1);
	}

	return { input, name, width };
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

const { input, name, width } = parseArgs(process.argv.slice(2));
const ffmpeg = resolveFfmpeg();

mkdirSync(landingDir, { recursive: true });

const mp4Out = join(landingDir, `${name}.mp4`);
const webmOut = join(landingDir, `${name}.webm`);
const scale = `scale=${width}:-2:flags=lanczos`;

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
