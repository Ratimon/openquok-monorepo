import { preferHttpsLocalDevSignInUrl } from '../../shared/openDashboardUrl.js';

const BANNER_HOST_ID = 'openquok-directory-login-banner-host';

export type LoginBannerView = {
	kind: 'openquok' | 'directory';
	title: string;
	message: string;
	loginUrl: string;
	ctaLabel: string;
};

const BANNER_STYLES = `
	:host, * { box-sizing: border-box; font-family: system-ui, -apple-system, Segoe UI, sans-serif; }
	.banner {
		position: fixed;
		top: 20px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 2147483645;
		width: 90%;
		max-width: 600px;
		padding: 16px 18px;
		background: #fef3c7;
		border: 1px solid #f59e0b;
		border-radius: 10px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
		color: #78350f;
		font-size: 14px;
		line-height: 1.45;
	}
	.title {
		margin: 0 0 6px;
		font-size: 15px;
		font-weight: 600;
		color: #92400e;
	}
	.message {
		margin: 0 0 12px;
	}
	.cta {
		display: inline-block;
		padding: 8px 14px;
		border-radius: 8px;
		background: #f59e0b;
		color: #fff;
		font-size: 13px;
		font-weight: 600;
		text-decoration: none;
	}
	.cta:hover {
		background: #d97706;
	}
`;

export class DirectoryLoginBanner {
	private host: HTMLElement | null = null;
	private titleEl: HTMLElement | null = null;
	private messageEl: HTMLElement | null = null;
	private ctaEl: HTMLAnchorElement | null = null;

	mount(): void {
		const existing = document.getElementById(BANNER_HOST_ID);
		if (existing?.shadowRoot) {
			this.host = existing;
			this.titleEl = existing.shadowRoot.querySelector('.title');
			this.messageEl = existing.shadowRoot.querySelector('.message');
			this.ctaEl = existing.shadowRoot.querySelector('a.cta');
			return;
		}

		const host = document.createElement('div');
		host.id = BANNER_HOST_ID;
		host.style.all = 'initial';
		document.documentElement.appendChild(host);

		const shadow = host.attachShadow({ mode: 'open' });
		const style = document.createElement('style');
		style.textContent = BANNER_STYLES;
		shadow.appendChild(style);

		const banner = document.createElement('div');
		banner.className = 'banner';
		banner.setAttribute('role', 'alert');

		const title = document.createElement('h2');
		title.className = 'title';

		const message = document.createElement('p');
		message.className = 'message';

		const cta = document.createElement('a');
		cta.className = 'cta';
		cta.target = '_blank';
		cta.rel = 'noopener noreferrer';

		banner.append(title, message, cta);
		shadow.appendChild(banner);

		this.host = host;
		this.titleEl = title;
		this.messageEl = message;
		this.ctaEl = cta;
	}

	update(view: LoginBannerView): void {
		if (!this.titleEl || !this.messageEl || !this.ctaEl) {
			this.mount();
		}
		if (!this.titleEl || !this.messageEl || !this.ctaEl) return;

		this.titleEl.textContent = `🔒 ${view.title}`;
		this.messageEl.textContent = view.message;
		this.ctaEl.textContent = view.ctaLabel;
		this.ctaEl.href = preferHttpsLocalDevSignInUrl(view.loginUrl);
	}

	unmount(): void {
		this.host?.remove();
		this.host = null;
		this.titleEl = null;
		this.messageEl = null;
		this.ctaEl = null;
	}
}
