export type DirectoryChannelNavigatePrompt = {
	channelName: string;
	targetUrl: string;
	/** Active handoff slug when a launch is in progress. */
	activeLaunchSlug: string | null;
	activeLaunchLabel: string | null;
	selectedSlug: string;
};

export function buildDirectoryChannelNavigateMessage(prompt: DirectoryChannelNavigatePrompt): string {
	const lines: string[] = [
		`Open ${prompt.channelName} in your browser?`,
		`You will go to ${prompt.targetUrl}.`,
	];
	if (prompt.activeLaunchSlug && prompt.activeLaunchSlug !== prompt.selectedSlug) {
		lines.push(
			`Autofill on this directory needs a launch from OpenQuok for that channel. Your current launch (${prompt.activeLaunchLabel ?? prompt.activeLaunchSlug}) stays active until you mark it done or clear the session.`
		);
	} else if (!prompt.activeLaunchSlug) {
		lines.push('Start a directory launch from OpenQuok (My Products) to autofill with your product profile.');
	}
	return lines.join('\n\n');
}

/**
 * Modal confirm before opening a directory site from the Directory tab channel picker.
 */
export function confirmDirectoryChannelNavigation(
	prompt: DirectoryChannelNavigatePrompt
): Promise<boolean> {
	return new Promise((resolve) => {
		const backdrop = document.createElement('div');
		backdrop.className = 'directory-nav-dialog-backdrop';
		backdrop.setAttribute('role', 'presentation');

		const dialog = document.createElement('div');
		dialog.className = 'directory-nav-dialog';
		dialog.setAttribute('role', 'alertdialog');
		dialog.setAttribute('aria-modal', 'true');
		dialog.setAttribute('aria-labelledby', 'directory-nav-dialog-title');

		const title = document.createElement('h2');
		title.id = 'directory-nav-dialog-title';
		title.className = 'directory-nav-dialog-title';
		title.textContent = 'Switch directory site?';

		const body = document.createElement('p');
		body.className = 'directory-nav-dialog-body';
		body.textContent = buildDirectoryChannelNavigateMessage(prompt);

		const actions = document.createElement('div');
		actions.className = 'directory-nav-dialog-actions';

		const cancel = document.createElement('button');
		cancel.type = 'button';
		cancel.className = 'secondary directory-nav-dialog-btn';
		cancel.textContent = 'Cancel';

		const confirm = document.createElement('button');
		confirm.type = 'button';
		confirm.className = 'directory-nav-dialog-btn directory-nav-dialog-btn--primary';
		confirm.textContent = 'Open site';

		const teardown = (result: boolean) => {
			backdrop.remove();
			resolve(result);
		};

		cancel.addEventListener('click', () => teardown(false));
		confirm.addEventListener('click', () => teardown(true));
		backdrop.addEventListener('click', (event) => {
			if (event.target === backdrop) teardown(false);
		});

		actions.append(cancel, confirm);
		dialog.append(title, body, actions);
		backdrop.appendChild(dialog);
		document.body.appendChild(backdrop);
		confirm.focus();
	});
}
