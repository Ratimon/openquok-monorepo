/**
 * Single content-script bundle for indiehub.best — login gate + all IndieHub launch providers.
 */
import { registerDirectoryLaunchProvider } from '../../directory/directory-launch/registerProvider.js';

import './directory-site-gate.js';

registerDirectoryLaunchProvider('indiehub-basic-launch');
registerDirectoryLaunchProvider('indiehub-pro-launch');