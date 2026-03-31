import type {
	EmailRepository,
	ReceivedEmailDetailProgrammerModel,
	ReceivedEmailSummaryProgrammerModel
} from '$lib/email/Email.repository.svelte';

/** View model for inbox list (camelCase for UI). */
export interface ReceivedEmailSummaryVm {
	id: string;
	to: string[];
	from: string;
	createdAt: string;
	subject: string;
	messageId: string;
}

/** View model for reading one received message. */
export interface ReceivedEmailDetailVm {
	id: string;
	subject: string;
	from: string;
	to: string[];
	createdAt: string;
	html: string | null;
	text: string | null;
	messageId: string;
}

export class GetEmailPresenter {
	constructor(private readonly emailRepository: EmailRepository) {}

	async loadReceivedEmailsVm(
		params: { limit?: number; after?: string; before?: string },
		fetch?: typeof globalThis.fetch
	): Promise<{ list: ReceivedEmailSummaryVm[]; hasMore: boolean; message: string; success: boolean }> {
		const listPm = await this.emailRepository.listReceivedEmails(params, fetch);
		return {
			success: listPm.success,
			hasMore: listPm.hasMore,
			message: listPm.message,
			list: listPm.list.map((pm) => this.toSummaryVm(pm))
		};
	}

	async loadReceivedEmailDetailVm(
		id: string,
		fetch?: typeof globalThis.fetch
	): Promise<{ detail: ReceivedEmailDetailVm | null; message: string; success: boolean }> {
		const detailPm = await this.emailRepository.getReceivedEmail(id, fetch);
		return {
			success: detailPm.success,
			message: detailPm.message,
			detail: detailPm.detail ? this.toDetailVm(detailPm.detail) : null
		};
	}

	private toSummaryVm(pm: ReceivedEmailSummaryProgrammerModel): ReceivedEmailSummaryVm {
		return {
			id: pm.id,
			to: pm.to,
			from: pm.from,
			createdAt: pm.createdAt,
			subject: pm.subject,
			messageId: pm.messageId
		};
	}

	private toDetailVm(pm: ReceivedEmailDetailProgrammerModel): ReceivedEmailDetailVm {
		return {
			id: pm.id,
			subject: pm.subject,
			from: pm.from,
			to: pm.to,
			createdAt: pm.createdAt,
			html: pm.html,
			text: pm.text,
			messageId: pm.messageId
		};
	}
}

