import type { EmailConfig, SendEmailRequestBody } from '$lib/email/Email.repository.svelte';
import { httpGateway } from '$lib/core/index';
import { EmailRepository } from '$lib/email/Email.repository.svelte';
import { GetEmailPresenter } from '$lib/email/GetEmail.presenter.svelte';

const emailConfig: EmailConfig = {
	endpoints: {
		listReceiving: '/api/v1/admin/emails/receiving',
		receivingEmail: (id: string) => `/api/v1/admin/emails/receiving/${encodeURIComponent(id)}`,
		send: '/api/v1/admin/emails/send'
	}
};

const emailRepository = new EmailRepository(httpGateway, emailConfig);
const getEmailPresenter = new GetEmailPresenter(emailRepository);

export { emailRepository, getEmailPresenter };
export type { SendEmailRequestBody };
export type { ReceivedEmailSummaryVm, ReceivedEmailDetailVm } from '$lib/email/GetEmail.presenter.svelte';
