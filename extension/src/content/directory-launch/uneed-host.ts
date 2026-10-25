/**
 * Single content-script bundle for uneed.best — login gate + all Uneed launch providers.
 */
import { registerDirectoryLaunchProvider } from '../../directory/directory-launch/registerProvider.js';

import './directory-site-gate.js';

registerDirectoryLaunchProvider('uneed-join-line');
registerDirectoryLaunchProvider('uneed-paid-launch');
registerDirectoryLaunchProvider('uneed-maker-profile');
