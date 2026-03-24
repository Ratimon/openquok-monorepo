/**
 * Auth User DTO – API representation of the authenticated user.
 * Matches frontend BasicUserAuthProgrammerModel / SigninResponseDto.data.user and SignupResponseDto.data.user.
 */
export interface AuthUserDTO {
	id: string | null;
	email: string;
	fullName: string;
	username?: string;
	isEmailVerified?: boolean;
	roles?: string[];
}

/** DB user row shape used by UserRepository (e.g. findFullUserByEmail). */
export interface AuthUserLike {
	id: string;
	email: string | null;
	full_name: string | null;
	is_email_verified?: boolean | null;
}

/** Auth provider user (e.g. Supabase auth.user) with optional metadata. */
export interface AuthProviderUserLike {
	id: string;
	email?: string;
	user_metadata?: { full_name?: string };
}

export class AuthUserDTOMapper {
	/**
	 * Map DB user + optional auth user to AuthUserDTO for API responses.
	 * Use for sign-in and sign-up responses so the frontend receives a consistent user shape.
	 */
	static toDTO(
		dbUser: AuthUserLike | null,
		authUser?: AuthProviderUserLike | null,
		options?: { roles?: string[] }
	): AuthUserDTO {
		const id = dbUser?.id ?? authUser?.id ?? null;
		const email = dbUser?.email ?? authUser?.email ?? '';
		const fullName =
			dbUser?.full_name ??
			(authUser?.user_metadata?.full_name as string | undefined) ??
			email;
		const username = email;
		const isEmailVerified = dbUser?.is_email_verified != null ? Boolean(dbUser.is_email_verified) : false;
		const roles = options?.roles ?? [];

		return {
			id: id ?? null,
			email,
			fullName,
			username,
			isEmailVerified,
			roles: roles.length > 0 ? roles : undefined,
		};
	}
}
