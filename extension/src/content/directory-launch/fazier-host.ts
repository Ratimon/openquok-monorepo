/**
 * Single content-script bundle for fazier.com — login gate + all Fazier launch providers.
 */
import { registerDirectoryLaunchProvider } from '../../directory/directory-launch/registerProvider.js';

import './directory-site-gate.js';

registerDirectoryLaunchProvider('fazier-page');
registerDirectoryLaunchProvider('fazier-free-product-listing');
registerDirectoryLaunchProvider('fazier-paid-product-listing');