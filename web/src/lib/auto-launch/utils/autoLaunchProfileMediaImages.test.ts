import { describe, expect, it } from 'vitest';

import {
	buildAutoLaunchProfileMediaPublicUrl,
	extractAutoLaunchProfileMediaStoragePathFromImageSrc,
	resolveAutoLaunchProfileImageUrl,
	resolveAutoLaunchProfileMediaStorageKey
} from '$lib/auto-launch/utils/autoLaunchProfileMediaImages';

describe('autoLaunchProfileMediaImages', () => {
	const orgId = '550e8400-e29b-41d4-a716-446655440000';
	const profileId = '660e8400-e29b-41d4-a716-446655440001';
	const key = `${orgId}/${profileId}/0.123.webp`;

	it('derives storage keys from API download URLs', () => {
		expect(
			extractAutoLaunchProfileMediaStoragePathFromImageSrc(
				`/api/v1/image/download?databaseName=auto_launch_profile_media&imageUrl=${encodeURIComponent(key)}`
			)
		).toBe(key);
	});

	it('strips auto_launch_profile_media/ prefix', () => {
		expect(resolveAutoLaunchProfileMediaStorageKey(`auto_launch_profile_media/${key}`)).toBe(key);
	});

	it('passes through absolute http(s) URLs', () => {
		expect(resolveAutoLaunchProfileImageUrl('https://cdn.example.com/logo.png')).toBe(
			'https://cdn.example.com/logo.png'
		);
	});

	it('builds an API download URL when Supabase public URL is unavailable', () => {
		expect(buildAutoLaunchProfileMediaPublicUrl(key)).toBe(
			`/api/v1/image/download?databaseName=auto_launch_profile_media&imageUrl=${encodeURIComponent(key)}`
		);
	});
});
