import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import type { GetEmailPresenter, ReceivedEmailDetailVm, ReceivedEmailSummaryVm } from '$lib/email/GetEmail.presenter.svelte';
import type { EmailRepository } from '$lib/email/Email.repository.svelte';

const DEFAULT_REPLY_FROM_EMAIL = String(CONFIG_SCHEMA_COMPANY.SUPPORT_EMAIL.default);
const DEFAULT_COMPANY_NAME = String(CONFIG_SCHEMA_COMPANY.NAME.default);

function extractReplyToAddress(fromHeader: string): string {
	const m = fromHeader.match(/<([^>]+)>/);
	if (m?.[1]) return m[1].trim();
	return fromHeader.trim();
}

function formatFromHeader(input: string): string {
	const trimmed = input.trim();
	if (!trimmed) return trimmed;
	// If already in `Name <email>` form, keep it.
	if (trimmed.includes('<') && trimmed.includes('>')) return trimmed;
	// If it's a bare email, add a recognizable display name.
	if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
		return `${DEFAULT_COMPANY_NAME} Support <${trimmed}>`;
	}
	return trimmed;
}

export class AdminEmailManagerPagePresenter {
	public receivedEmails: ReceivedEmailSummaryVm[] = $state([]);
	public hasMore = $state(false);
	public listLoading = $state(false);
	public listLoadingMore = $state(false);
	public listError: string | null = $state(null);

	public selectedId: string | null = $state(null);
	public detail: ReceivedEmailDetailVm | null = $state(null);
	public detailLoading = $state(false);
	public detailError: string | null = $state(null);

	public composeFrom = $state('');
	public composeTo = $state('');
	public composeSubject = $state('');
	public composeText = $state('');
	public composeInReplyTo = $state('');
	public sendInProgress = $state(false);

	public showToastMessage = $state(false);
	public toastMessage = $state('');

	constructor(
		private readonly getEmailPresenter: GetEmailPresenter,
		private readonly emailRepository: EmailRepository
	) {}

	async loadInitial(fetch?: typeof globalThis.fetch): Promise<void> {
		this.listLoading = true;
		this.listError = null;
		const res = await this.getEmailPresenter.loadReceivedEmailsVm({ limit: 25 }, fetch);
		this.listLoading = false;
		if (res.success) {
			this.receivedEmails = res.list;
			this.hasMore = res.hasMore;
		} else {
			this.receivedEmails = [];
			this.hasMore = false;
			this.listError = res.message;
		}
	}

	async loadMore(fetch?: typeof globalThis.fetch): Promise<void> {
		if (!this.hasMore || this.listLoadingMore) return;
		const last = this.receivedEmails[this.receivedEmails.length - 1];
		if (!last) return;
		this.listLoadingMore = true;
		const res = await this.getEmailPresenter.loadReceivedEmailsVm({ limit: 25, after: last.id }, fetch);
		this.listLoadingMore = false;
		if (res.success) {
			this.receivedEmails = [...this.receivedEmails, ...res.list];
			this.hasMore = res.hasMore;
		} else {
			this.showToastMessage = true;
			this.toastMessage = res.message;
		}
	}

	async selectEmail(id: string, fetch?: typeof globalThis.fetch): Promise<void> {
		this.selectedId = id;
		this.detailLoading = true;
		this.detailError = null;
		this.detail = null;
		const res = await this.getEmailPresenter.loadReceivedEmailDetailVm(id, fetch);
		this.detailLoading = false;
		if (res.success && res.detail) {
			this.detail = res.detail;
			this.composeFrom = formatFromHeader(DEFAULT_REPLY_FROM_EMAIL);
			this.composeTo = extractReplyToAddress(res.detail.from);
			const subj = res.detail.subject ?? '';
			this.composeSubject = subj.startsWith('Re:') ? subj : `Re: ${subj}`;
			this.composeText = '';
			this.composeInReplyTo = res.detail.messageId.trim();
		} else {
			this.detailError = res.message;
		}
	}

	clearSelection(): void {
		this.selectedId = null;
		this.detail = null;
		this.detailError = null;
		this.composeInReplyTo = '';
	}

	async sendReply(fetch?: typeof globalThis.fetch): Promise<void> {
		const to = this.composeTo.trim();
		const subject = this.composeSubject.trim();
		const text = this.composeText.trim();
		const replyTo = extractReplyToAddress(this.composeFrom);
		if (!to || !subject || !text) {
			this.showToastMessage = true;
			this.toastMessage = 'To, Subject, and message text are required.';
			return;
		}

		this.sendInProgress = true;
		const res = await this.emailRepository.sendEmail(
			{
				to,
				subject,
				text,
				...(replyTo ? { reply_to: replyTo } : {}),
				...(this.composeInReplyTo ? { in_reply_to: this.composeInReplyTo } : {})
			},
			fetch
		);
		this.sendInProgress = false;

		if (res.success) {
			this.showToastMessage = true;
			this.toastMessage = res.message || 'Email sent.';
			this.composeText = '';
		} else {
			this.showToastMessage = true;
			this.toastMessage = res.message || 'Failed to send email.';
		}
	}
}
