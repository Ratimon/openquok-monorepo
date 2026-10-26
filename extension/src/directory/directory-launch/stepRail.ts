import type { AutoLaunchExtensionConfig, FieldFillResult, LaunchStep } from 'openquok-common';

import { AUTO_LAUNCH_PANEL_POSITION_KEY } from '../auto-launch/constants.js';

const PANEL_HOST_ID = 'openquok-directory-launch-host';

export type StepRailCallbacks = {
	onFillStep: (stepId: string) => void;
	onFillAll: () => void;
	onResetPosition: () => void;
};

export type StepRailViewState = {
	providerName: string;
	productName: string;
	statusLine: string;
	steps: LaunchStep[];
	activeStepId?: string;
	fieldResultsByStep: Record<string, FieldFillResult[]>;
	readyUrlHint?: string;
	fillDisabled?: boolean;
	fillGateMessage?: string;
};

type PanelPosition = { top: number; left: number };

function loadPosition(): PanelPosition {
	try {
		const raw = localStorage.getItem(AUTO_LAUNCH_PANEL_POSITION_KEY);
		if (!raw) return { top: 96, left: 16 };
		const parsed = JSON.parse(raw) as PanelPosition;
		if (typeof parsed.top === 'number' && typeof parsed.left === 'number') return parsed;
	} catch {
		/* ignore */
	}
	return { top: 96, left: 16 };
}

function savePosition(position: PanelPosition): void {
	localStorage.setItem(AUTO_LAUNCH_PANEL_POSITION_KEY, JSON.stringify(position));
}

function statusIcon(status: FieldFillResult['status']): string {
	switch (status) {
		case 'found':
			return '✓';
		case 'skipped':
			return '○';
		case 'not_in_profile':
			return '—';
		case 'not_found':
			return '!';
		default:
			return '×';
	}
}

export class DirectoryLaunchStepRail {
	private host: HTMLElement | null = null;
	private shadow: ShadowRoot | null = null;
	private bodyEl: HTMLElement | null = null;
	private callbacks: StepRailCallbacks;

	constructor(callbacks: StepRailCallbacks) {
		this.callbacks = callbacks;
	}

	mount(): void {
		if (document.getElementById(PANEL_HOST_ID)) return;

		const host = document.createElement('div');
		host.id = PANEL_HOST_ID;
		host.style.all = 'initial';
		document.documentElement.appendChild(host);

		const shadow = host.attachShadow({ mode: 'open' });
		const style = document.createElement('style');
		style.textContent = `
			:host, * { box-sizing: border-box; font-family: system-ui, -apple-system, Segoe UI, sans-serif; }
			.panel {
				position: fixed;
				z-index: 2147483646;
				width: 280px;
				max-height: min(80vh, 520px);
				overflow: auto;
				background: #0f172a;
				color: #e2e8f0;
				border: 1px solid #334155;
				border-radius: 12px;
				box-shadow: 0 12px 40px rgba(0,0,0,.35);
				font-size: 12px;
				line-height: 1.4;
			}
			.header {
				padding: 12px 12px 8px;
				border-bottom: 1px solid #334155;
				cursor: move;
				user-select: none;
			}
			.title { font-weight: 600; font-size: 13px; margin: 0 0 4px; }
			.subtitle { color: #94a3b8; margin: 0; font-size: 11px; }
			.status { margin-top: 8px; color: #cbd5e1; font-size: 11px; }
			.steps { padding: 8px 0; }
			.step {
				border-top: 1px solid #1e293b;
				padding: 8px 12px;
			}
			.step-head {
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: 8px;
				margin-bottom: 6px;
			}
			.step-label { font-weight: 600; color: #f1f5f9; }
			button {
				all: unset;
				cursor: pointer;
				background: #2563eb;
				color: #fff;
				padding: 4px 10px;
				border-radius: 6px;
				font-size: 11px;
				font-weight: 600;
			}
			button.secondary {
				background: #334155;
				color: #e2e8f0;
			}
			button:disabled { opacity: .5; cursor: not-allowed; }
			.fields { list-style: none; margin: 0; padding: 0; }
			.fields li {
				display: flex;
				gap: 6px;
				align-items: flex-start;
				color: #94a3b8;
				font-size: 11px;
				margin-bottom: 2px;
			}
			.fields .icon { width: 12px; flex-shrink: 0; }
			.footer {
				padding: 10px 12px 12px;
				border-top: 1px solid #334155;
				display: flex;
				flex-direction: column;
				gap: 8px;
			}
			.disclaimer { color: #64748b; font-size: 10px; }
			.gate-hint { color: #94a3b8; font-size: 10px; margin: 0; }
		`;

		const panel = document.createElement('div');
		panel.className = 'panel';
		const pos = loadPosition();
		panel.style.top = `${pos.top}px`;
		panel.style.left = `${pos.left}px`;

		const body = document.createElement('div');
		body.className = 'body';

		panel.appendChild(body);
		shadow.appendChild(style);
		shadow.appendChild(panel);

		this.enableDrag(panel);

		this.host = host;
		this.shadow = shadow;
		this.bodyEl = body;
	}

	unmount(): void {
		this.host?.remove();
		this.host = null;
		this.shadow = null;
		this.bodyEl = null;
	}

	resetPosition(): void {
		const panel = this.shadow?.querySelector('.panel') as HTMLElement | null;
		if (!panel) return;
		panel.style.top = '96px';
		panel.style.left = '16px';
		savePosition({ top: 96, left: 16 });
		this.callbacks.onResetPosition();
	}

	render(state: StepRailViewState): void {
		if (!this.bodyEl) return;

		this.bodyEl.replaceChildren();

		const header = document.createElement('div');
		header.className = 'header';
		header.innerHTML = `
			<p class="title">${escapeHtml(state.providerName)}</p>
			<p class="subtitle">${escapeHtml(state.productName)}</p>
			<p class="status">${escapeHtml(state.statusLine)}</p>
		`;

		const stepsWrap = document.createElement('div');
		stepsWrap.className = 'steps';

		for (const step of state.steps) {
			const results = state.fieldResultsByStep[step.id] ?? [];
			const filled = results.filter((r) => r.status === 'found' || r.status === 'skipped').length;
			const total = step.fields?.length ?? results.length;

			const stepEl = document.createElement('section');
			stepEl.className = 'step';

			const head = document.createElement('div');
			head.className = 'step-head';

			const label = document.createElement('span');
			label.className = 'step-label';
			label.textContent = `${step.label} (${filled}/${total || 0} fields)`;

			const fillBtn = document.createElement('button');
			fillBtn.type = 'button';
			fillBtn.textContent = 'Fill';
			fillBtn.disabled = Boolean(state.fillDisabled);
			fillBtn.addEventListener('click', () => this.callbacks.onFillStep(step.id));

			head.append(label, fillBtn);

			const list = document.createElement('ul');
			list.className = 'fields';
			for (const field of step.fields ?? []) {
				const result = results.find((r) => r.key === field.key);
				const li = document.createElement('li');
				const icon = document.createElement('span');
				icon.className = 'icon';
				icon.textContent = statusIcon(result?.status ?? 'not_found');
				const text = document.createElement('span');
				text.textContent = field.label;
				li.append(icon, text);
				list.appendChild(li);
			}

			stepEl.append(head, list);
			stepsWrap.appendChild(stepEl);
		}

		const footer = document.createElement('div');
		footer.className = 'footer';

		const fillAll = document.createElement('button');
		fillAll.type = 'button';
		fillAll.textContent = 'Fill all steps';
		fillAll.disabled = Boolean(state.fillDisabled);
		fillAll.addEventListener('click', () => this.callbacks.onFillAll());

		const reset = document.createElement('button');
		reset.type = 'button';
		reset.className = 'secondary';
		reset.textContent = 'Reset panel position';
		reset.addEventListener('click', () => this.resetPosition());

		const disclaimer = document.createElement('p');
		disclaimer.className = 'disclaimer';
		disclaimer.textContent =
			'OpenQuok fills forms only. You review and submit on the directory site.';

		footer.append(fillAll, reset, disclaimer);
		if (state.fillDisabled && state.fillGateMessage) {
			const gateHint = document.createElement('p');
			gateHint.className = 'gate-hint';
			gateHint.textContent = state.fillGateMessage;
			footer.prepend(gateHint);
		}

		this.bodyEl.append(header, stepsWrap, footer);
	}

	private enableDrag(panel: HTMLElement): void {
		const header = () => panel.querySelector('.header') as HTMLElement | null;
		let dragging = false;
		let startX = 0;
		let startY = 0;
		let originTop = 0;
		let originLeft = 0;

		const onMove = (event: PointerEvent) => {
			if (!dragging) return;
			const top = originTop + (event.clientY - startY);
			const left = originLeft + (event.clientX - startX);
			panel.style.top = `${Math.max(8, top)}px`;
			panel.style.left = `${Math.max(8, left)}px`;
		};

		const onUp = () => {
			if (!dragging) return;
			dragging = false;
			const top = parseInt(panel.style.top, 10) || 96;
			const left = parseInt(panel.style.left, 10) || 16;
			savePosition({ top, left });
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
		};

		panel.addEventListener('pointerdown', (event) => {
			const target = event.target as HTMLElement;
			if (!header()?.contains(target) || target.closest('button')) return;
			dragging = true;
			startX = event.clientX;
			startY = event.clientY;
			originTop = parseInt(panel.style.top, 10) || 96;
			originLeft = parseInt(panel.style.left, 10) || 16;
			window.addEventListener('pointermove', onMove);
			window.addEventListener('pointerup', onUp);
		});
	}
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export function pageMatchesConfig(config: AutoLaunchExtensionConfig): boolean {
	const patterns = config.startUrlPatterns ?? [];
	if (patterns.length === 0) return true;
	const href = window.location.href;
	return patterns.some((pattern) => {
		try {
			const re = wildcardToRegExp(pattern);
			return re.test(href);
		} catch {
			return href.includes(pattern.replace(/\*/g, ''));
		}
	});
}

export function buildStatusLine(config: AutoLaunchExtensionConfig, onReadyPage: boolean): string {
	if (!onReadyPage && config.readyUrlHint) {
		return `Open your product edit or submission page (the URL should include “${config.readyUrlHint}”). Then use Fill on each section below or Fill all steps.`;
	}
	if (!onReadyPage) {
		return 'Open the directory listing or submission form in this tab. When the fields are visible, use Fill on each section or Fill all steps below.';
	}
	return 'You’re on the right page. Use Fill on each section—or Fill all steps—then review every field before you submit on this site.';
}

function wildcardToRegExp(pattern: string): RegExp {
	const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
	return new RegExp(`^${escaped}$`, 'i');
}

export function isReadyPage(config: AutoLaunchExtensionConfig): boolean {
	const hint = config.readyUrlHint?.toLowerCase();
	if (!hint) return pageMatchesConfig(config);
	const href = window.location.href.toLowerCase();
	if (hint === 'submit') {
		try {
			const path = new URL(window.location.href).pathname.replace(/\/+$/, '') || '/';
			if (path !== '/submit' && href.includes('submit')) {
				return true;
			}
		} catch {
			/* ignore */
		}
	}
	return href.includes(hint);
}
