export type DirectoryListingDetailsFieldErrors = {
	listingUrl?: string;
	authEmail?: string;
};

export function validateDirectoryListingDetailsForComplete(input: {
	listingUrl: string;
	authEmail: string;
}): DirectoryListingDetailsFieldErrors {
	const errors: DirectoryListingDetailsFieldErrors = {};
	const listingUrl = input.listingUrl.trim();
	const authEmail = input.authEmail.trim();

	if (!listingUrl) {
		errors.listingUrl = 'List URL is required.';
	} else {
		try {
			new URL(listingUrl);
		} catch {
			errors.listingUrl = 'Enter a valid URL (https://…).';
		}
	}

	if (!authEmail) {
		errors.authEmail = 'Auth email is required.';
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail)) {
		errors.authEmail = 'Enter a valid email address.';
	}

	return errors;
}

export function hasDirectoryListingDetailsFieldErrors(
	errors: DirectoryListingDetailsFieldErrors
): boolean {
	return Boolean(errors.listingUrl || errors.authEmail);
}
