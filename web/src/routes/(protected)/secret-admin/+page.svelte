<script lang="ts">
	import {
		getRootPathSecretAdminFeedbackManager,
		getRootPathSecretAdminRoleManager,
		getRootPathSecretAdminPermissionManager,
		getRootPathSecretAdminEmailManager,
		getRootPathSecretAdminBlogManager,
		getRootPathSecretAdminConfigManager
	} from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { absoluteUrl } from '$lib/utils/path';

	const feedbackManagerUrl = absoluteUrl(getRootPathSecretAdminFeedbackManager());
	const roleManagerUrl = absoluteUrl(getRootPathSecretAdminRoleManager());
	const permissionManagerUrl = absoluteUrl(getRootPathSecretAdminPermissionManager());
	const emailManagerUrl = absoluteUrl(getRootPathSecretAdminEmailManager());
	const blogManagerUrl = absoluteUrl(getRootPathSecretAdminBlogManager());
	const configManagerUrl = absoluteUrl(getRootPathSecretAdminConfigManager());
</script>

<div class="p-4 md:p-6">
	<h1 class="text-xl font-semibold text-base-content">
		Super admin</h1>
	<p class="text-sm text-base-content/70 mt-1">
		Manage feedback, roles, users, and blog from the sidebar.
	</p>
	<ul class="mt-4 list-disc list-inside space-y-1 text-sm">
		<li><a href={feedbackManagerUrl} class="link link-primary">Feedback manager</a></li>
		<li><a href={roleManagerUrl} class="link link-primary">Role manager</a></li>
		<li><a href={permissionManagerUrl} class="link link-primary">Permission manager</a></li>
		<li><a href={emailManagerUrl} class="link link-primary">Email manager</a></li>
		<li><a href={blogManagerUrl} class="link link-primary">Blog Manager</a></li>
		<li><a href={configManagerUrl} class="link link-primary">Config manager</a></li>
	</ul>
</div>