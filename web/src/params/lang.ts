import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
	return /^[a-z]{2}(-[a-z]{2})?$/.test(param);
};
