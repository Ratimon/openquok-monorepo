/**
 * Single content-script bundle for tinylaunch.com — login gate + all TinyLaunch launch providers.
 */
import { registerDirectoryLaunchProvider } from '../../directory/directory-launch/registerProvider.js';

import './directory-site-gate.js';

registerDirectoryLaunchProvider('tinylaunch-standard-launch');
registerDirectoryLaunchProvider('tinylaunch-premium-launch');