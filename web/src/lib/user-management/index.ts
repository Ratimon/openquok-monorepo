import type { UserConfig } from '$lib/user-management/User.repository.svelte';
import { httpGateway } from '$lib/core/index';
import { UserRepository } from '$lib/user-management/User.repository.svelte';
import { GetUserPresenter } from '$lib/user-management/GetUser.presenter.svelte';

const userConfig: UserConfig = {
	endpoints: {
		getFullUsersWithRoles: '/api/v1/admin/users'
	}
};

const userRepository = new UserRepository(httpGateway, userConfig);
const getUserPresenter = new GetUserPresenter(userRepository);

export { userRepository, getUserPresenter };
export type { ExtendedFullUserViewModel } from '$lib/user-management/GetUser.presenter.svelte';
export type { UserConfig, FullUserProgrammerModelWithRoles } from '$lib/user-management/User.repository.svelte';
