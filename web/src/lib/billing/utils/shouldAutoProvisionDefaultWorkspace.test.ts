import { describe, expect, it } from 'vitest';

import { shouldAutoProvisionDefaultWorkspace } from './shouldAutoProvisionDefaultWorkspace';

describe('shouldAutoProvisionDefaultWorkspace', () => {
	it('returns false when the list API failed and workspace count is zero', () => {
		expect(shouldAutoProvisionDefaultWorkspace('error', 0, false)).toBe(false);
	});

	it('returns true when the list succeeded with zero workspaces', () => {
		expect(shouldAutoProvisionDefaultWorkspace('ok', 0, false)).toBe(true);
	});

	it('returns false when the list succeeded with at least one workspace', () => {
		expect(shouldAutoProvisionDefaultWorkspace('ok', 1, false)).toBe(false);
	});

	it('returns false for platform admins regardless of list outcome or count', () => {
		expect(shouldAutoProvisionDefaultWorkspace('ok', 0, true)).toBe(false);
		expect(shouldAutoProvisionDefaultWorkspace('error', 0, true)).toBe(false);
		expect(shouldAutoProvisionDefaultWorkspace('ok', 1, true)).toBe(false);
	});

	it('returns false while list outcome is still idle', () => {
		expect(shouldAutoProvisionDefaultWorkspace('idle', 0, false)).toBe(false);
	});
});
