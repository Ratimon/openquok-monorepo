import { VerifyEmailTemplate } from "./VerifyEmailTemplate";
import { generateRandomVerificationToken } from '../tests/utils/getVerificationTokenStub';

describe('VerifyEmail', () => {

    let BACKEND_DOMAIN_URL = 'http://localhost:3000';

    it('should contain the full name in the email subject', () => {
        const template = new VerifyEmailTemplate(BACKEND_DOMAIN_URL, 'John Doe', 'john.doe@example.com', generateRandomVerificationToken());
        const subject = template.buildSubject();

        expect(subject).toContain(`Please verify your email address`);
    });

    it('should contain the link in the email body', () => {
        const token = generateRandomVerificationToken();
        const email = 'john.doe@example.com';
        const template = new VerifyEmailTemplate(BACKEND_DOMAIN_URL, 'John Doe', email, token);
        const text = template.buildText();

        const expectedLink = `${BACKEND_DOMAIN_URL}/api/v1/auth/request-verify-signup?token=${token}&email=${encodeURIComponent(email)}`;
        expect(text).toContain('Hello John Doe,');
        expect(text).toContain('Please verify your email address by clicking the link below:');
        expect(text).toContain(expectedLink);
        expect(text).toContain('This link will expire in 24 hours.');
        expect(text).toContain('Best regards,');
        expect(text).toContain('The Team');
    });

    it('should contain h1 heading in the HTML email', () => {
        const template = new VerifyEmailTemplate(BACKEND_DOMAIN_URL, 'John Doe', 'john.doe@example.com', generateRandomVerificationToken());
        const html = template.buildHtml();

        expect(html).toContain('<h1');
        expect(html).toContain('Please verify your email address');
        expect(html).toContain('</h1>');
    });

    it('should contain the full name in the HTML email', () => {
        const template = new VerifyEmailTemplate(BACKEND_DOMAIN_URL, 'John Doe', 'john.doe@example.com', generateRandomVerificationToken());
        const html = template.buildHtml();

        expect(html).toContain('Hello <strong>John Doe</strong>');
    });

    it('should contain the verification link in the HTML email', () => {
        const token = generateRandomVerificationToken();
        const email = 'john.doe@example.com';
        const template = new VerifyEmailTemplate(BACKEND_DOMAIN_URL, 'John Doe', email, token);
        const html = template.buildHtml();

        const expectedLink = `${BACKEND_DOMAIN_URL}/api/v1/auth/request-verify-signup?token=${token}&email=${encodeURIComponent(email)}`;
        expect(html).toContain(`href="${expectedLink}"`);
        expect(html).toContain('Verify Email Address');
    });

    it('should contain expiration warning in the HTML email', () => {
        const template = new VerifyEmailTemplate(BACKEND_DOMAIN_URL, 'John Doe', 'john.doe@example.com', generateRandomVerificationToken());
        const html = template.buildHtml();

        expect(html).toContain('This link will expire in 24 hours');
    });
    
});