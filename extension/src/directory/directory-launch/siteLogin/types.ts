export type DirectorySiteLoginDetection = {
	loggedIn: boolean;
	loginUrl: string;
};

export type DirectorySiteLoginAdapter = {
	isLoggedIn(doc?: Document): boolean;
	loginUrl: string;
};
