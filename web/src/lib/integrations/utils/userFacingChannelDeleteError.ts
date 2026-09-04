/**
 * Maps channel-delete failures to user-facing copy.
 */
export function userFacingChannelDeleteError(message: string, _status?: number): string {
	return message;
}
