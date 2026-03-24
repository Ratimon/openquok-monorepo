export enum AuthStatus {
	UNKNOWN = 'unknown',
	CHECKING = 'checking',
	AUTHENTICATED = 'authenticated',
	UNAUTHENTICATED = 'unauthenticated',
	ERROR = 'error'
}

export class AuthStatusModel {
	status = $state<AuthStatus>(AuthStatus.UNKNOWN);
}
