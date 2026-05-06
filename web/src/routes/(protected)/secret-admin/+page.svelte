<script lang="ts">
	import {
		getRootPathSecretAdminFeedbackManager,
		getRootPathSecretAdminRoleManager,
		getRootPathSecretAdminPermissionManager,
		getRootPathSecretAdminEmailManager,
		getRootPathSecretAdminBullBoard,
		getRootPathSecretAdminBlogManager,
		getRootPathSecretAdminConfigManager
	} from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { absoluteUrl, route } from '$lib/utils/path';

	// /secret-admin/feedback-manager
	const rootPathSecretAdminFeedbackManager = getRootPathSecretAdminFeedbackManager();
	const secretAdminFeedbackManagerPath = route(rootPathSecretAdminFeedbackManager);
	const feedbackManagerUrl = absoluteUrl(secretAdminFeedbackManagerPath);

	// /secret-admin/role-manager
	const rootPathSecretAdminRoleManager = getRootPathSecretAdminRoleManager();
	const secretAdminRoleManagerPath = route(rootPathSecretAdminRoleManager);
	const roleManagerUrl = absoluteUrl(secretAdminRoleManagerPath);

	// /secret-admin/permission-manager
	const rootPathSecretAdminPermissionManager = getRootPathSecretAdminPermissionManager();
	const secretAdminPermissionManagerPath = route(rootPathSecretAdminPermissionManager);
	const permissionManagerUrl = absoluteUrl(secretAdminPermissionManagerPath);

	// /secret-admin/email-manager
	const rootPathSecretAdminEmailManager = getRootPathSecretAdminEmailManager();
	const secretAdminEmailManagerPath = route(rootPathSecretAdminEmailManager);
	const emailManagerUrl = absoluteUrl(secretAdminEmailManagerPath);

	// /secret-admin/bull-board
	const rootPathSecretAdminBullBoard = getRootPathSecretAdminBullBoard();
	const secretAdminBullBoardPath = route(rootPathSecretAdminBullBoard);
	const bullBoardUrl = absoluteUrl(secretAdminBullBoardPath);

	// /secret-admin/blog-manager
	const rootPathSecretAdminBlogManager = getRootPathSecretAdminBlogManager();
	const secretAdminBlogManagerPath = route(rootPathSecretAdminBlogManager);
	const blogManagerUrl = absoluteUrl(secretAdminBlogManagerPath);

	// /secret-admin/config-manager
	const rootPathSecretAdminConfigManager = getRootPathSecretAdminConfigManager();
	const secretAdminConfigManagerPath = route(rootPathSecretAdminConfigManager);
	const configManagerUrl = absoluteUrl(secretAdminConfigManagerPath);
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
		<li><a href={bullBoardUrl} class="link link-primary">Queue dashboard (Bull Board)</a></li>
		<li><a href={blogManagerUrl} class="link link-primary">Blog Manager</a></li>
		<li><a href={configManagerUrl} class="link link-primary">Config manager</a></li>
	</ul>
</div>