/**
 * OTP UI length for variable recovery codes (e.g. 6 or 8 digits).
 * Start with `minLength` cells; expand to `maxLength` once the user reaches
 * `minLength` digits (so 7th/8th digits are typeable) or pastes a longer code.
 */
export function recoveryCodeVisibleCellCount(
	valueLength: number,
	minLength: number,
	maxLength: number
): number {
	if (valueLength >= minLength) {
		return maxLength;
	}
	return minLength;
}
