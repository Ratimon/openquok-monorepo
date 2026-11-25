/**
 * Single content-script bundle for nicklaunches.com — login gate + all Nick Launches providers.
 */
import { registerDirectoryLaunchProvider } from '../../directory/directory-launch/registerProvider.js';

import './directory-site-gate.js';

registerDirectoryLaunchProvider('nick-launches-free-launch');
registerDirectoryLaunchProvider('nick-launches-paid-launch');
registerDirectoryLaunchProvider('nick-launches-maker-profile');