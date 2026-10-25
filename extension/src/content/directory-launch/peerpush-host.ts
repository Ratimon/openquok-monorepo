/**
 * Single content-script bundle for peerpush.com — login gate + all PeerPush launch providers.
 */
import { registerDirectoryLaunchProvider } from '../../directory/directory-launch/registerProvider.js';

import './directory-site-gate.js';

registerDirectoryLaunchProvider('peerpush-free-queue');
registerDirectoryLaunchProvider('peerpush-standard-launch');
