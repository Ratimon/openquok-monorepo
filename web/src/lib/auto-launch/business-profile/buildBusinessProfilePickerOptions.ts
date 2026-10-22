import type {
	AutoLaunchProductProfileDto,
	BusinessProfileDto
} from '$lib/auto-launch/auto-launch.types';

export type WorkspaceChannelGroupRow = { id: string; name: string };

/** One row in the Move / add to business profile picker (channel group + Products tab). */
export type BusinessProfilePickerOption = {
	/** Stable selection id: integration customer uuid or `product:<profileId>`. */
	key: string;
	name: string;
	integrationCustomerId: string | null;
	productProfileId: string | null;
};

export function buildBusinessProfilePickerOptions(
	channelGroups: WorkspaceChannelGroupRow[],
	productProfiles: AutoLaunchProductProfileDto[]
): BusinessProfilePickerOption[] {
	const groupIds = new Set(channelGroups.map((g) => g.id));
	const options: BusinessProfilePickerOption[] = [];

	for (const group of channelGroups) {
		const linked = productProfiles.find((p) => p.integrationCustomerId === group.id);
		options.push({
			key: group.id,
			name: group.name,
			integrationCustomerId: group.id,
			productProfileId: linked?.id ?? null
		});
	}

	for (const profile of productProfiles) {
		if (profile.integrationCustomerId && groupIds.has(profile.integrationCustomerId)) {
			continue;
		}
		const key = profile.integrationCustomerId ?? `product:${profile.id}`;
		if (options.some((o) => o.key === key)) continue;
		options.push({
			key,
			name: profile.name,
			integrationCustomerId: profile.integrationCustomerId,
			productProfileId: profile.id
		});
	}

	return options.sort((a, b) =>
		a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
	);
}

/** Maps unified API rows to picker options (preferred over client-side merge). */
export function businessProfileDtosToPickerOptions(
	rows: BusinessProfileDto[]
): BusinessProfilePickerOption[] {
	return rows
		.map((row) => {
			const customerId = row.integrationCustomerId;
			const productId = row.productProfileId;
			const key = customerId ?? (productId ? `product:${productId}` : `name:${row.name}`);
			return {
				key,
				name: row.name,
				integrationCustomerId: customerId,
				productProfileId: productId
			};
		})
		.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}
