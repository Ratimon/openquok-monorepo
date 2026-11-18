import './sidepanel.css';

import { mountDashboardSessionBar } from './dashboardSessionBar.js';
import { mountDirectoryTab } from './directoryTab.js';
import { mountSocialTab } from './socialTab.js';
import { installDashboardSessionWatch } from '../../shared/dashboardSessionWatch.js';
import {
	SIDE_PANEL_PENDING_TAB_KEY,
	SIDE_PANEL_UI_MESSAGE,
	type SidePanelFocusTab,
	type SidePanelUiMessage,
} from './sidePanelMessages.js';
import { el } from './uiHelpers.js';

if (location.protocol !== 'chrome-extension:' && location.protocol !== 'moz-extension:') {
	document.body.textContent =
		'OpenQuok side panel must load from the browser extension. Reload the extension from extension/dist on chrome://extensions.';
	throw new Error(`OpenQuok side panel invalid origin: ${location.origin}`);
}

const appRoot = document.getElementById('app');
if (!appRoot) {
	throw new Error('Side panel root missing');
}

appRoot.setAttribute('data-openquok-sidepanel', '1');

type ActiveTab = SidePanelFocusTab;

let activeTab: ActiveTab = 'social';

const shell = el(`
	<div class="sidepanel-shell">
		<header class="shell-header">
			<span class="brand" aria-hidden="true">OpenQuok</span>
			<nav class="tab-nav" role="tablist" aria-label="OpenQuok">
				<button type="button" class="tab-btn" role="tab" id="tab-btn-social" data-tab="social" aria-selected="true" aria-controls="tab-panel-social">Social</button>
				<button type="button" class="tab-btn" role="tab" id="tab-btn-directory" data-tab="directory" aria-selected="false" aria-controls="tab-panel-directory">Directory</button>
			</nav>
		</header>
		<div id="dashboard-session-host" class="dashboard-session-host"></div>
		<div id="tab-panel-social" class="tab-panel" role="tabpanel" aria-labelledby="tab-btn-social"></div>
		<div id="tab-panel-directory" class="tab-panel hidden" role="tabpanel" aria-labelledby="tab-btn-directory" hidden></div>
	</div>
`);

appRoot.replaceChildren(shell);

const sessionHost = shell.querySelector('#dashboard-session-host') as HTMLElement;
const socialPanel = shell.querySelector('#tab-panel-social') as HTMLElement;
const directoryPanel = shell.querySelector('#tab-panel-directory') as HTMLElement;
const tabButtons = [...shell.querySelectorAll<HTMLButtonElement>('.tab-btn')];

let sessionBar!: ReturnType<typeof mountDashboardSessionBar>;
const socialTab = mountSocialTab(socialPanel, {
	getSessionSnapshot: () => sessionBar.getSnapshot(),
});
const directoryTab = mountDirectoryTab(directoryPanel, {
	getSessionSnapshot: () => sessionBar.getSnapshot(),
});

sessionBar = mountDashboardSessionBar(sessionHost, {
	onDisconnected: () => socialTab.onDashboardDisconnected(),
});

let sessionRefreshTimer: ReturnType<typeof setTimeout> | null = null;
const scheduleTabsRefreshOnSessionChange = (): void => {
	if (sessionRefreshTimer) clearTimeout(sessionRefreshTimer);
	sessionRefreshTimer = setTimeout(() => {
		sessionRefreshTimer = null;
		void socialTab.refresh();
		void directoryTab.refresh();
	}, 50);
};

sessionBar.subscribe(() => {
	scheduleTabsRefreshOnSessionChange();
});

installDashboardSessionWatch(() => {
	void sessionBar.refresh({ requestDashboardSync: false });
});

void sessionBar.refresh({ requestDashboardSync: true });

function setActiveTab(tab: ActiveTab): void {
	activeTab = tab;
	for (const button of tabButtons) {
		const isActive = button.dataset.tab === tab;
		button.setAttribute('aria-selected', isActive ? 'true' : 'false');
		button.classList.toggle('is-active', isActive);
	}
	const socialActive = tab === 'social';
	socialPanel.classList.toggle('hidden', !socialActive);
	socialPanel.hidden = !socialActive;
	directoryPanel.classList.toggle('hidden', socialActive);
	directoryPanel.hidden = socialActive;
	if (tab === 'social') {
		void socialTab.refresh();
	} else {
		void directoryTab.refresh();
	}
}

for (const button of tabButtons) {
	button.addEventListener('click', () => {
		const tab = button.dataset.tab as ActiveTab | undefined;
		if (tab === 'social' || tab === 'directory') {
			setActiveTab(tab);
		}
	});
}

const onRuntimeMessage = (message: unknown): void => {
	if (!message || typeof message !== 'object') return;
	const record = message as SidePanelUiMessage;
	if (record.type === SIDE_PANEL_UI_MESSAGE.FOCUS_TAB) {
		if (record.tab === 'social' || record.tab === 'directory') {
			setActiveTab(record.tab);
		}
	}
};

chrome.runtime.onMessage.addListener(onRuntimeMessage);

async function applyPendingFocusTab(): Promise<void> {
	if (!chrome.storage?.session) {
		setActiveTab('social');
		return;
	}
	try {
		const stored = await chrome.storage.session.get(SIDE_PANEL_PENDING_TAB_KEY);
		const pending = stored[SIDE_PANEL_PENDING_TAB_KEY];
		await chrome.storage.session.remove(SIDE_PANEL_PENDING_TAB_KEY);
		if (pending === 'social' || pending === 'directory') {
			setActiveTab(pending);
			return;
		}
	} catch {
		/* ignore */
	}
	setActiveTab('social');
}

void applyPendingFocusTab();
