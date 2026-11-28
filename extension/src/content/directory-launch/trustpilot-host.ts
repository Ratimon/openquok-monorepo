/**
 * Single content-script bundle for businessapp.b2b.trustpilot.com — login gate + Trustpilot launch providers.
 */
import { registerDirectoryLaunchProvider } from '../../directory/directory-launch/registerProvider.js';

import './directory-site-gate.js';

registerDirectoryLaunchProvider('trustpilot-company-profile');