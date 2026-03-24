/** Stub response for a successful signup (matches SignupResponseDto). */
export function GetSuccessfulSignupStub() {
	return {
		status: 201,
		statusText: 'Created',
		headers: { 'Content-Type': 'application/json' },
		data: {
			success: true,
			data: {
				user: {
					id: 'test-id',
					email: 'johndoe@test.com',
					fullName: 'John Doe',
					username: 'johndoe@test.com',
					isEmailVerified: false,
					roles: []
				},
				session: {
					accessToken: 'mock-access-token',
					refreshToken: 'mock-refresh-token'
				}
			},
			message:
				'We have sent a confirmation link to your email address. Please check your inbox and click the link to complete your registration.'
		},
		ok: true
	};
}
