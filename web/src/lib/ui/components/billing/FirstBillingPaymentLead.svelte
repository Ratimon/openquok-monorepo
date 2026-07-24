<script lang="ts">
	type Props = {
		companyName?: string;
	};

	let { companyName = 'OPENQUOK' }: Props = $props();
</script>

<h2 class="text-balance text-3xl font-semibold leading-tight md:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
	You're one step away from
	<span class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
		publishing with {companyName}
	</span>
</h2>
<p class="mt-4 max-w-xl text-base text-base-content/70">
	Enter your payment details below to activate your plan and unlock scheduling, channels, and your
	workspace.
</p>
