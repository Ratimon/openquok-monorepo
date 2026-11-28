/**
 * Single content-script bundle for startupinspire.com — login gate + StartupInspire launch providers.
 */
import { registerDirectoryLaunchProvider } from '../../directory/directory-launch/registerProvider.js';

import './directory-site-gate.js';

registerDirectoryLaunchProvider('startupinspire-free-listing');
registerDirectoryLaunchProvider('startupinspire-paid-listing');