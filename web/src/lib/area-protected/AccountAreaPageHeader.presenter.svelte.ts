export type AccountAreaPageHeaderConfig = {
	title: string;
	currentPageLabel?: string;
	linkHome?: boolean;
	headingId?: string;
	description?: string | null;
	/** Optional compact control in the protected top bar (e.g. open Getting started). */
	actionLabel?: string | null;
	onAction?: (() => void) | null;
};

export class AccountAreaPageHeaderPresenter {
	title = $state('');
	currentPageLabel = $state('');
	linkHome = $state(true);
	headingId = $state<string | undefined>(undefined);
	description = $state<string | null>(null);
	actionLabel = $state<string | null>(null);
	/** Not reactive — updated whenever `set` runs (same tick as actionLabel). */
	onAction: (() => void) | null = null;
	active = $state(false);

	set(config: AccountAreaPageHeaderConfig): void {
		this.title = config.title;
		this.currentPageLabel = config.currentPageLabel ?? config.title;
		this.linkHome = config.linkHome ?? true;
		this.headingId = config.headingId;
		this.description = config.description ?? null;
		this.actionLabel = config.actionLabel ?? null;
		this.onAction = config.onAction ?? null;
		this.active = true;
	}

	clear(): void {
		this.active = false;
		this.title = '';
		this.currentPageLabel = '';
		this.description = null;
		this.actionLabel = null;
		this.onAction = null;
		this.headingId = undefined;
	}
}

export const accountAreaPageHeaderPresenter = new AccountAreaPageHeaderPresenter();
