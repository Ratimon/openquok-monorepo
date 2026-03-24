/** Stub response for a failed signup. */
export function GetFailedSignupStub() {
	return {
		status: 400,
		statusText: 'Bad Request',
		headers: { 'Content-Type': 'application/json' },
		data: {
			success: false,
			data: null,
			message: 'Signup failed. Please try again.'
		},
		ok: false
	};
}
