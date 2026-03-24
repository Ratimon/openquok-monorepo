<script lang="ts">
	import {
		getRootPathAdminFeedbackManager,
		getRootPathAdminRoleManager
	} from '$lib/area-admin/constants/getRootPathAdminArea';
	import { absoluteUrl } from '$lib/utils/path';

	const feedbackManagerUrl = absoluteUrl(getRootPathAdminFeedbackManager());
	const roleManagerUrl = absoluteUrl(getRootPathAdminRoleManager());
</script>

<div class="p-4 md:p-6">
	<h1 class="text-xl font-semibold text-base-content">
		Admin</h1>
	<p class="text-sm text-base-content/70 mt-1">
		Manage feedback and user roles.
	</p>
	<ul class="mt-4 list-disc list-inside space-y-1 text-sm">
		<li><a href={feedbackManagerUrl} class="link link-primary">Feedback manager</a></li>
		<li><a href={roleManagerUrl} class="link link-primary">Role manager</a></li>
	</ul>
</div>
