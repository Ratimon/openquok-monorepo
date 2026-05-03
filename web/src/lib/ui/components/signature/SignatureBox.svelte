<script lang="ts">
	import type { SignatureProgrammerModel } from '$lib/signatures';

	import { icons } from '$data/icons';

	import { Badge } from '$lib/ui/badge';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		signature: SignatureProgrammerModel;
		busy?: boolean;
		onEdit: (sig: SignatureProgrammerModel) => void;
		onDelete: (id: string) => void | Promise<void>;
		onSetDefault: (id: string) => void | Promise<void>;
	};

	let { signature, busy = false, onEdit, onDelete, onSetDefault }: Props = $props();

	const preview = $derived(signature.content.length > 220 ? `${signature.content.slice(0, 220)}…` : signature.content);
</script>

<div class="rounded-lg border border-base-300 bg-base-100/60 p-4 shadow-sm">
	<div class="flex items-start justify-between gap-3">
		<div class="min-w-0">
			<div class="flex flex-wrap items-center gap-2">
				<h4 class="truncate text-sm font-semibold text-base-content">
                    {signature.title}
                </h4>
				<Badge variant={signature.isDefault ? 'default' : 'secondary'}>
					{signature.isDefault ? 'Auto add' : 'Manual'}
				</Badge>
			</div>
			<p class="mt-1 whitespace-pre-wrap break-words text-sm text-base-content/70">
				{preview}</p>
		</div>
		<div class="flex shrink-0 flex-col items-end gap-2">
			<Button type="button" variant="outline" size="sm" class="gap-1.5" disabled={busy} onclick={() => onEdit(signature)}>
				<AbstractIcon name={icons.Pencil.name} class="size-3.5" width="14" height="14" />
				Edit
			</Button>
			<Button
				type="button"
				variant="outline"
				size="sm"
				class="gap-1.5"
				disabled={busy || signature.isDefault}
				onclick={() => onSetDefault(signature.id)}
			>
				<AbstractIcon name={icons.BadgeCheck.name} class="size-3.5" width="14" height="14" />
				Set default
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				class="gap-1.5 border-0 bg-error text-error-content hover:bg-error/90"
				disabled={busy}
				onclick={() => onDelete(signature.id)}
			>
				<AbstractIcon name={icons.Trash.name} class="size-3.5" width="14" height="14" />
				Delete
			</Button>
		</div>
	</div>
</div>
