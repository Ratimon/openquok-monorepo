/**
 * Single content-script bundle for devhunt.org — login gate + all DevHunt launch providers.
 */
import { registerDirectoryLaunchProvider } from '../../directory/directory-launch/registerProvider.js';

import './directory-site-gate.js';

registerDirectoryLaunchProvider('devhunt-paid-launch');
registerDirectoryLaunchProvider('devhunt-standard-launch');