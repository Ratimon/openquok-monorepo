/**
 * Single content-script bundle for alternativeto.net — login gate + all AlternativeTo launch providers.
 */
import { registerDirectoryLaunchProvider } from '../../directory/directory-launch/registerProvider.js';

import './directory-site-gate.js';

registerDirectoryLaunchProvider('alternativeto-free-listing');
registerDirectoryLaunchProvider('alternativeto-priority-review');
registerDirectoryLaunchProvider('alternativeto-finish-listing');
registerDirectoryLaunchProvider('alternativeto-user-profile');