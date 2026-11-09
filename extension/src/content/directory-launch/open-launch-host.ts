/**
 * Single content-script bundle for open-launch.com — login gate + all Open Launch launch providers.
 */
import { registerDirectoryLaunchProvider } from '../../directory/directory-launch/registerProvider.js';

import './directory-site-gate.js';

registerDirectoryLaunchProvider('open-launch-free-launch');
registerDirectoryLaunchProvider('open-launch-premium-launch');
