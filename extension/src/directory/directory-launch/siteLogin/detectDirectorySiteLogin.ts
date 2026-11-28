import { isAlternativetoLoggedIn, ALTERNATIVETO_LOGIN_URL } from './alternativeto.js';
import { isTrustpilotLoggedIn, TRUSTPILOT_LOGIN_URL } from './trustpilot.js';
import { isDevhuntLoggedIn, DEVHUNT_LOGIN_URL } from './devhunt.js';
import { isFazierLoggedIn, FAZIER_LOGIN_URL } from './fazier.js';
import { isIndiehubLoggedIn, INDIEHUB_LOGIN_URL } from './indiehub.js';
import { isNickLaunchesLoggedIn, NICK_LAUNCHES_LOGIN_URL } from './nick-launches.js';
import { isOpenLaunchLoggedIn, OPEN_LAUNCH_LOGIN_URL } from './open-launch.js';
import { isPeerPushLoggedIn, PEERPUSH_LOGIN_URL } from './peerpush.js';
import { isStartupinspireLoggedIn, STARTUPINSPIRE_LOGIN_URL } from './startupinspire.js';
import { isTinylaunchLoggedIn, TINYLAUNCH_LOGIN_URL } from './tinylaunch.js';
import type { DirectorySiteLoginAdapter, DirectorySiteLoginDetection } from './types.js';
import { isUneedLoggedIn, UNEED_LOGIN_URL } from './uneed.js';

const adapters: Readonly<Record<string, DirectorySiteLoginAdapter>> = {
	peerpush: {
		isLoggedIn: isPeerPushLoggedIn,
		loginUrl: PEERPUSH_LOGIN_URL
	},
	uneed: {
		isLoggedIn: isUneedLoggedIn,
		loginUrl: UNEED_LOGIN_URL
	},
	'open-launch': {
		isLoggedIn: isOpenLaunchLoggedIn,
		loginUrl: OPEN_LAUNCH_LOGIN_URL
	},
	tinylaunch: {
		isLoggedIn: isTinylaunchLoggedIn,
		loginUrl: TINYLAUNCH_LOGIN_URL
	},
	fazier: {
		isLoggedIn: isFazierLoggedIn,
		loginUrl: FAZIER_LOGIN_URL
	},
	devhunt: {
		isLoggedIn: isDevhuntLoggedIn,
		loginUrl: DEVHUNT_LOGIN_URL
	},
	'nick-launches': {
		isLoggedIn: isNickLaunchesLoggedIn,
		loginUrl: NICK_LAUNCHES_LOGIN_URL
	},
	indiehub: {
		isLoggedIn: isIndiehubLoggedIn,
		loginUrl: INDIEHUB_LOGIN_URL
	},
	alternativeto: {
		isLoggedIn: isAlternativetoLoggedIn,
		loginUrl: ALTERNATIVETO_LOGIN_URL
	},
	trustpilot: {
		isLoggedIn: isTrustpilotLoggedIn,
		loginUrl: TRUSTPILOT_LOGIN_URL
	},
	startupinspire: {
		isLoggedIn: isStartupinspireLoggedIn,
		loginUrl: STARTUPINSPIRE_LOGIN_URL
	}
};

export function detectDirectorySiteLogin(
	siteKey: string,
	doc: Document = document
): DirectorySiteLoginDetection {
	const adapter = adapters[siteKey];
	if (!adapter) {
		return { loggedIn: true, loginUrl: '' };
	}
	return {
		loggedIn: adapter.isLoggedIn(doc),
		loginUrl: adapter.loginUrl
	};
}
