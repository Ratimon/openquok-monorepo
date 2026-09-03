import { describe, expect, it } from 'vitest';

import { PUBLIC_SELF_HOSTING_LANDING_CONFIG } from '$lib/content/constants/publicSelfHostingLandingConfig';
import { publicFaqHref } from '$lib/content/utils/publicFaqLinks';
import { route } from '$lib/utils/path';
import { getRootPathPublicSelfHosting } from '$lib/area-public/constants/getRootPathPublicSelfHosting';

const publicSelfHostingPath = route(getRootPathPublicSelfHosting());

describe('PUBLIC_SELF_HOSTING_LANDING_CONFIG', () => {
	it('lists three comparison cards for hosted cloud, Docker, and production stack', () => {
		const cards = PUBLIC_SELF_HOSTING_LANDING_CONFIG.comparisonSection.cards;

		expect(cards).toHaveLength(3);
		expect(cards.map((card) => card.id)).toEqual([
			'hosted-cloud',
			'self-hosted-docker',
			'cloud-self-host'
		]);
	});

	it('links cloud production stack CTA to production deployment docs', () => {
		const cloudCard = PUBLIC_SELF_HOSTING_LANDING_CONFIG.comparisonSection.cards.find(
			(card) => card.id === 'cloud-self-host'
		);

		expect(cloudCard?.cta?.href).toBe(publicFaqHref.productionDeployment);
		expect(cloudCard?.cta?.label).toBe('Read production deployment');
	});

	it('links start-here checklist to Self-hosting docs tab destinations', () => {
		const hrefById = Object.fromEntries(
			PUBLIC_SELF_HOSTING_LANDING_CONFIG.startHereSection.items.map((item) => [item.id, item.href])
		);

		expect(hrefById['docker-compose']).toBe(publicFaqHref.dockerCompose);
		expect(hrefById['production-deployment']).toBe(publicFaqHref.productionDeployment);
		expect(hrefById['system-requirements']).toBe('/docs/installation/system-requirements');
		expect(hrefById['self-hosting-docs']).toBe('/docs/getting-started-for-dev');
		expect(hrefById['cli-auth']).toBe('/docs/configuration-agent');
		expect(hrefById['social-integrations']).toBe(publicFaqHref.socialIntegration);
	});

	it('anchors hero primary CTA to the comparison section', () => {
		expect(PUBLIC_SELF_HOSTING_LANDING_CONFIG.hero.primaryCta.href).toContain(
			'#choose-your-path'
		);
	});

	it('targets free alternative scheduler SEO on title, h1, and description', () => {
		const { metaTitle, metaDescription, keywords, hero } = PUBLIC_SELF_HOSTING_LANDING_CONFIG;

		expect(metaTitle.toLowerCase()).toContain('free');
		expect(metaTitle.toLowerCase()).toContain('alternative');
		expect(metaTitle.toLowerCase()).toContain('scheduler');
		expect(metaDescription.toLowerCase()).toContain('free alternative');
		expect(metaDescription.toLowerCase()).toContain('scheduler');
		expect(keywords).toContain('free alternative social media scheduler');
		expect(hero.title.toLowerCase()).toContain('alternative');
		expect(hero.title.toLowerCase()).toContain('scheduler');
		expect(hero.description.toLowerCase()).toContain('free alternative');
	});

	it('links stack guides to configuration-backend, web, worker, and agent docs', () => {
		const hrefById = Object.fromEntries(
			PUBLIC_SELF_HOSTING_LANDING_CONFIG.stackSection.items.map((item) => [item.id, item.href])
		);

		expect(hrefById['configuration-backend']).toBe('/docs/configuration-backend');
		expect(hrefById['configuration-backend-supabase']).toBe('/docs/configuration-backend/supabase');
		expect(hrefById['configuration-web-vite']).toBe('/docs/configuration-web/vite');
		expect(hrefById['configuration-worker-railway']).toBe('/docs/configuration-worker/railway');
		expect(hrefById['configuration-agent-architecture']).toBe(
			'/docs/configuration-agent/architecture'
		);
	});

	it('lists every social-integration operator guide', () => {
		const items = PUBLIC_SELF_HOSTING_LANDING_CONFIG.socialIntegrationSection.items;

		expect(items.map((item) => item.id)).toEqual([
			'social-integration-overview',
			'social-integration-threads',
			'social-integration-instagram',
			'social-integration-facebook',
			'social-integration-youtube',
			'social-integration-tiktok',
			'social-integration-linkedin',
			'social-integration-linkedin-page',
			'social-integration-x',
			'social-integration-devto'
		]);
		expect(items.find((item) => item.id === 'social-integration-threads')?.href).toBe(
			'/docs/social-integration/threads'
		);
	});

	it('explains Compose vs production deployment in FAQ', () => {
		const faqItem = PUBLIC_SELF_HOSTING_LANDING_CONFIG.faqSection.faqItems.find(
			(item) =>
				item.title === 'What is the difference between Docker Compose and production deployment?'
		);

		expect(faqItem?.description).toContain(publicFaqHref.dockerCompose);
		expect(faqItem?.description).toContain(publicFaqHref.productionDeployment);
	});

	it('describes three cost models in the self-hosting cost FAQ', () => {
		const faqItem = PUBLIC_SELF_HOSTING_LANDING_CONFIG.faqSection.faqItems.find(
			(item) => item.title === 'Does self-hosting cost money?'
		);

		expect(faqItem?.description).toContain('no software fee');
		expect(faqItem?.description).toContain(publicFaqHref.pricing);
		expect(faqItem?.description).toContain(publicSelfHostingPath);
	});

	it('clarifies hosted plan limits apply only to the cloud plan', () => {
		const faqItem = PUBLIC_SELF_HOSTING_LANDING_CONFIG.faqSection.faqItems.find(
			(item) => item.title === 'Is self-hosted OpenQuok the same product as hosted?'
		);

		expect(faqItem?.description).toContain('Hosted plan limits');
		expect(faqItem?.description).toContain('production stacks');
	});

	it('links FAQ answers to Self-hosting docs tab destinations', () => {
		const servicesFaq = PUBLIC_SELF_HOSTING_LANDING_CONFIG.faqSection.faqItems.find(
			(item) => item.title === 'What services do I need to run?'
		);
		const agentAuthFaq = PUBLIC_SELF_HOSTING_LANDING_CONFIG.faqSection.faqItems.find(
			(item) => item.title === 'Can agents authenticate without API keys on the host?'
		);
		const socialAppsFaq = PUBLIC_SELF_HOSTING_LANDING_CONFIG.faqSection.faqItems.find(
			(item) => item.title === 'Do I need my own Meta or Google developer apps?'
		);

		expect(servicesFaq?.description).toContain(publicFaqHref.productionDeployment);
		expect(servicesFaq?.description).toContain('/docs/configuration-worker');
		expect(servicesFaq?.description).toContain('/docs/installation/system-requirements');
		expect(agentAuthFaq?.description).toContain('/docs/configuration-agent');
		expect(agentAuthFaq?.description).toContain('/docs/admin/oauth-server');
		expect(socialAppsFaq?.description).toContain(publicFaqHref.socialIntegration);
	});
});
