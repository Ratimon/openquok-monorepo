import type { ThirdPartyConfig } from '$lib/third-parties/ThirdParty.repository.svelte';
import { httpGateway } from '$lib/core/index';
import { ThirdPartyRepository } from '$lib/third-parties/ThirdParty.repository.svelte';

const thirdPartyConfig: ThirdPartyConfig = {
	endpoints: {
		listForMedia: '/api/v1/third-parties/for-media'
	}
};

export const thirdPartyRepository = new ThirdPartyRepository(httpGateway, thirdPartyConfig);

export { ThirdPartyRepository } from '$lib/third-parties/ThirdParty.repository.svelte';
export type {
	ThirdPartyConfig,
	ThirdPartyConnectorProgrammerModel,
	ThirdPartyListResponseDto
} from '$lib/third-parties/ThirdParty.repository.svelte';
