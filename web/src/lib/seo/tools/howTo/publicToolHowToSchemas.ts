import type { HowTo } from 'schema-dts';

import { createHowToSEOSchema } from '$lib/seo/createHowToSEOSchema';

/** HowTo aligned with `BestTimeToPostCalculatorPanel` — timing test plan, not live analytics. */
export function createBestTimeToPostHowToSchema(params: {
	canonicalUrl: string;
	channelLabel?: string | null;
}): HowTo | Record<string, never> {
	const channelLabel = params.channelLabel?.trim();
	const name = channelLabel
		? `How to build a ${channelLabel} posting timing test plan`
		: 'How to build a social posting timing test plan';

	const platformStep = channelLabel
		? {
				name: `Use the ${channelLabel} calculator`,
				text: `This page fixes the platform to ${channelLabel}. Set audience and shown timezones, then generate benchmark test slots.`
			}
		: {
				name: 'Choose a social platform',
				text:
					'Select the network you publish on from the platform dropdown so benchmark slots match that channel.'
			};

	return createHowToSEOSchema({
		canonicalUrl: params.canonicalUrl,
		fragmentId: 'timing-test-howto',
		name,
		description:
			'Use audience timezone, content type, and posting cadence to generate a week of test slots you can schedule and compare.',
		steps: [
			platformStep,
			{
				name: 'Set audience timezone',
				text:
					'Pick where your viewers are. Benchmark clock times are interpreted in this zone (for example America/New_York).'
			},
			{
				name: 'Set shown timezone',
				text:
					'Pick your local zone for the copied plan and calendar preview (defaults to this browser’s posting schedule timezone).'
			},
			{
				name: 'Choose content type and cadence',
				text:
					'Match how often you post and what you publish so the suggested test slots fit your workflow.'
			},
			{
				name: 'Generate and use the timing test plan',
				text:
					'Run Suggest test slots, review the week preview, copy the plan, schedule posts at those times, and compare results in your analytics.'
			}
		]
	});
}

export function createPhotoEditorHowToSchema(params: {
	canonicalUrl: string;
	channelLabel?: string | null;
}): HowTo | Record<string, never> {
	const channelLabel = params.channelLabel?.trim();
	const name = channelLabel
		? `How to resize images for ${channelLabel}`
		: 'How to resize images for social media';

	const presetStep = channelLabel
		? {
				name: `Start from the ${channelLabel} preset`,
				text: `Open this channel page to load aspect ratios and safe zones tuned for ${channelLabel}.`
			}
		: {
				name: 'Pick a channel preset',
				text: 'Choose a social network preset or custom canvas size for your post format.'
			};

	return createHowToSEOSchema({
		canonicalUrl: params.canonicalUrl,
		fragmentId: 'photo-editor-howto',
		name,
		description: 'Create channel-ready images in the browser and download PNG files for free.',
		steps: [
			presetStep,
			{
				name: 'Add your image',
				text: 'Upload a photo or paste from clipboard, then position it inside the frame.'
			},
			{
				name: 'Adjust crop and layout',
				text: 'Drag to reframe, then fine-tune until the visual fits the platform safe area.'
			},
			{
				name: 'Export',
				text: 'Download a PNG. Sign in to save designs to your OpenQuok cloud when you need reuse across posts.'
			}
		]
	});
}

export function createSkillBuilderHowToSchema(params: {
	canonicalUrl: string;
	channelLabel?: string | null;
}): HowTo | Record<string, never> {
	const channelLabel = params.channelLabel?.trim();
	const name = channelLabel
		? `How to build an OpenQuok skill for ${channelLabel}`
		: 'How to build an OpenQuok agent skill';

	const channelStep = channelLabel
		? {
				name: `Use the ${channelLabel} recipe`,
				text: `This page pre-selects building blocks and examples for publishing on ${channelLabel}.`
			}
		: {
				name: 'Choose a target channel',
				text: 'Pick the social network your skill should schedule or draft posts for.'
			};

	return createHowToSEOSchema({
		canonicalUrl: params.canonicalUrl,
		fragmentId: 'skill-builder-howto',
		name,
		description: 'Compose CLI commands and MCP tools into SKILL.md you can paste into your agent host.',
		steps: [
			channelStep,
			{
				name: 'Add building blocks',
				text: 'Drag OpenQuok CLI steps and MCP tools into the workflow canvas.'
			},
			{
				name: 'Preview SKILL.md',
				text: 'Review generated markdown, prompts, and command examples before export.'
			},
			{
				name: 'Copy or download',
				text: 'Copy the skill file or download it, then install it in your agent per the setup docs.'
			}
		]
	});
}

export function createHumanizerHowToSchema(params: {
	canonicalUrl: string;
	channelLabel?: string | null;
}): HowTo | Record<string, never> {
	const channelLabel = params.channelLabel?.trim();
	const name = channelLabel
		? `How to humanize ${channelLabel} post copy`
		: 'How to humanize social post copy';

	return createHowToSEOSchema({
		canonicalUrl: params.canonicalUrl,
		fragmentId: 'humanizer-howto',
		name,
		description: 'Rewrite draft posts so they sound natural while staying within channel length limits.',
		steps: [
			{
				name: 'Paste your draft',
				text: 'Add the post text you want to polish before scheduling or publishing.'
			},
			...(channelLabel
				? [
						{
							name: `Keep ${channelLabel} constraints in mind`,
							text: `This page highlights limits and tone tips for ${channelLabel} posts.`
						}
					]
				: []),
			{
				name: 'Run humanize',
				text: 'Generate a revised version that reads more naturally for social feeds.'
			},
			{
				name: 'Copy and schedule',
				text: 'Copy the output into OpenQuok scheduling, your API payload, or the native composer.'
			}
		]
	});
}

export function createPayloadWizardHowToSchema(params: {
	canonicalUrl: string;
	channelLabel?: string | null;
}): HowTo | Record<string, never> {
	const channelLabel = params.channelLabel?.trim();
	const name = channelLabel
		? `How to build a ${channelLabel} API post payload`
		: 'How to build a public API post payload';

	const channelStep = channelLabel
		? {
				name: `Select ${channelLabel} and post type`,
				text: `Start from the ${channelLabel} wizard page so required fields match that integration.`
			}
		: {
				name: 'Select channel and post type',
				text: 'Choose the connected integration and whether you are creating a text, image, or video post.'
			};

	return createHowToSEOSchema({
		canonicalUrl: params.canonicalUrl,
		fragmentId: 'payload-wizard-howto',
		name,
		description: 'Fill validated fields and copy JSON ready for the OpenQuok public API or SDK.',
		steps: [
			channelStep,
			{
				name: 'Complete required fields',
				text: 'The form mirrors integration schema rules so you avoid rejected payloads.'
			},
			{
				name: 'Review generated JSON',
				text: 'Inspect the payload preview for captions, media URLs, and schedule fields.'
			},
			{
				name: 'Copy into your integration',
				text: 'Paste into curl, the Node SDK, or your automation — then call create or schedule endpoints.'
			}
		]
	});
}
