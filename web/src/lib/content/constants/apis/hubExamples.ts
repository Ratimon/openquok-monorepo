import type { PublicApiFormatExample, PublicApiHubStaticExample } from '$lib/content/constants/apis/types';
import {
	buildPublicApiCreatePostResponseExample,
	prettyPublicApiJson,
	PUBLIC_API_CREATE_POST_ENDPOINT,
	PUBLIC_API_MOCK_INTEGRATION_ID
} from '$lib/content/constants/apis/shared';

const HUB_CURL_TEMPLATE = `curl -X POST 'https://api.openquok.com/api/v1/public/posts' \\
  -H 'Authorization: opo_your_workspace_token' \\
  -H 'Content-Type: application/json' \\
  -d @payload.json`;

const POSTING_REQUEST = {
	scheduledAt: '2026-05-14T10:00:00.000Z',
	status: 'scheduled',
	body: 'Hello from the public API!',
	integrationIds: [
		PUBLIC_API_MOCK_INTEGRATION_ID,
		'2a8b5e4c-1d3f-4a5b-9c0d-8e7f6a5b4c3d'
	],
	media: [
		{
			id: 'img-global',
			path: 'uploads/2026/05/hero.png',
			alt: 'Product launch hero'
		}
	],
	tagNames: ['launch-week']
};

const SCHEDULING_REQUEST = {
	scheduledAt: '2026-06-18T14:30:00.000Z',
	status: 'scheduled',
	body: 'Queue this post for next Tuesday at 2:30 PM UTC.',
	integrationIds: [PUBLIC_API_MOCK_INTEGRATION_ID],
	repeatInterval: 'week',
	tagNames: ['campaign']
};

function buildHubStaticExample(request: Record<string, unknown>): PublicApiHubStaticExample {
	const requestJson = prettyPublicApiJson(request);
	const body = typeof request.body === 'string' ? request.body : 'Scheduled via the public API';
	const publishDate =
		typeof request.scheduledAt === 'string' ? request.scheduledAt : '2026-05-14T10:00:00.000Z';

	return {
		endpoint: PUBLIC_API_CREATE_POST_ENDPOINT,
		method: 'POST',
		curl: HUB_CURL_TEMPLATE,
		requestJson,
		responseJson: buildPublicApiCreatePostResponseExample({ content: body, publishDate })
	};
}

export const PUBLIC_API_POSTING_HUB_STATIC_EXAMPLE = buildHubStaticExample(POSTING_REQUEST);

export const PUBLIC_API_SCHEDULING_HUB_STATIC_EXAMPLE = buildHubStaticExample(SCHEDULING_REQUEST);

/** Payload validator bento on platform API landings — first tabbed format example for that page. */
export function buildPublicApiPayloadValidatorStaticExampleFromFormatExample(
	formatExample: PublicApiFormatExample
): PublicApiHubStaticExample {
	const request = JSON.parse(formatExample.requestJson) as Record<string, unknown>;
	const body = typeof request.body === 'string' ? request.body : 'Scheduled via the public API';
	const publishDate =
		typeof request.scheduledAt === 'string' ? request.scheduledAt : '2026-05-14T10:00:00.000Z';

	return {
		endpoint: PUBLIC_API_CREATE_POST_ENDPOINT,
		method: 'POST',
		curl: HUB_CURL_TEMPLATE,
		requestJson: formatExample.requestJson,
		responseJson:
			formatExample.responseJson ||
			buildPublicApiCreatePostResponseExample({ content: body, publishDate })
	};
}
