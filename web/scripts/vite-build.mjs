import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const lockPath = path.join('.svelte-kit', '.build.lock');
const viteBin = path.join(path.dirname(require.resolve('vite/package.json')), 'bin/vite.js');

fs.mkdirSync('.svelte-kit', { recursive: true });

let lockFd;
try {
	lockFd = fs.openSync(lockPath, 'wx');
	fs.writeFileSync(lockFd, `${process.pid}\n`);
} catch (error) {
	if (error?.code === 'EEXIST') {
		console.error(
			'Another vite build is already running (lock: .svelte-kit/.build.lock). ' +
				'Wait for it to finish or remove the lock after confirming no build is active.'
		);
		process.exit(1);
	}
	throw error;
}

function releaseLock() {
	try {
		fs.closeSync(lockFd);
	} catch {
		// ignore
	}
	try {
		fs.unlinkSync(lockPath);
	} catch {
		// ignore
	}
}

for (const signal of ['SIGINT', 'SIGTERM']) {
	process.on(signal, () => {
		releaseLock();
		process.exit(signal === 'SIGINT' ? 130 : 143);
	});
}

const viteArgs = ['build', ...process.argv.slice(2)];
const vite = spawn(process.execPath, [viteBin, ...viteArgs], {
	stdio: 'inherit',
	env: process.env
});

vite.on('close', (code, signal) => {
	releaseLock();
	if (signal) {
		process.exit(1);
	}
	process.exit(code ?? 1);
});

vite.on('error', (error) => {
	releaseLock();
	console.error(error);
	process.exit(1);
});
