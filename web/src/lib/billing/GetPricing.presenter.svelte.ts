import type {
	BillingCurrentProgrammerModel,
	BillingPlanProgrammerModel,
	BillingRepository,
	BillingSubscriptionProgrammerModel
} from '$lib/billing/Billing.repository.svelte';
import { formatPostsPerMonthLimit } from '$lib/billing/Billing.repository.svelte';
import type { PaidSubscriptionTier, SubscriptionPeriod } from 'openquok-common';

import { formatBytes } from '$lib/medias';

export type PlanFeatureLineViewModel = {
	label: string;
	tooltip?: string;
};

export type BillingPlanViewModel = BillingPlanProgrammerModel & {
	featureLines: PlanFeatureLineViewModel[];
};

export type BillingSubscriptionViewModel = {
	id: string;
	tier: PaidSubscriptionTier;
	period: SubscriptionPeriod;
	cancelAt: string | null;
};

export type BillingCurrentViewModel = {
	tier: BillingCurrentProgrammerModel['tier'];
	subscription: BillingSubscriptionViewModel | null;
	drive: BillingCurrentProgrammerModel['drive'];
	limits: BillingCurrentProgrammerModel['limits'];
	billing: BillingCurrentProgrammerModel['billing'];
	billingEnabled: boolean;
};

export type BillingPricingViewModel = {
	plansVm: BillingPlanViewModel[];
	currentVm: BillingCurrentViewModel | null;
	billingEnabled: boolean;
};

function perWorkspaceLabel(count: number, singular: string, plural: string): string {
	return count === 1 ? `1 ${singular} per workspace` : `${count} ${plural} per workspace`;
}

export function buildPlanFeatureLinesVm(plan: BillingPlanProgrammerModel): PlanFeatureLineViewModel[] {
	const linesVm: PlanFeatureLineViewModel[] = [];
	if (plan.workspaces > 1) {
		linesVm.push({ label: `${plan.workspaces} workspaces` });
	}

	const channelTotal = plan.channelPerWorkspace * plan.workspaces;
	linesVm.push({
		label: channelTotal === 1 ? '1 channel' : `Total ${channelTotal} channels`,
		tooltip:
			plan.workspaces > 1
				? perWorkspaceLabel(plan.channelPerWorkspace, 'channel', 'channels')
				: undefined
	});

	linesVm.push({ label: `${formatPostsPerMonthLimit(plan.postsPerMonth)} posts per month` });

	const teamTotal = plan.teamMembersPerWorkspace * plan.workspaces;
	if (teamTotal > 1) {
		linesVm.push({
			label: `Total ${teamTotal} team members`,
			tooltip: perWorkspaceLabel(plan.teamMembersPerWorkspace, 'member', 'members')
		});
	}

	if (plan.sharePostPreview) {
		linesVm.push({ label: 'Shareable post preview links' });
	}

	if (plan.publicApi) {
		linesVm.push({ label: 'Public API access' });
	}

	const storageTotalBytes = plan.mediaStorageBytesPerWorkspace * plan.workspaces;
	linesVm.push({
		label: `Total ${formatBytes(storageTotalBytes)} cloud storage`,
		tooltip:
			plan.workspaces > 1
				? `${formatBytes(plan.mediaStorageBytesPerWorkspace)} cloud storage per workspace`
				: undefined
	});

	return linesVm;
}

export function tierDisplayName(tier: string): string {
	if (tier === 'SOLO') return 'Solo';
	if (tier === 'CREATOR') return 'Creator';
	if (tier === 'TEAM') return 'Team';
	if (tier === 'ULTIMATE') return 'Ultimate Pro';
	return tier;
}

export class GetPricingPresenter {
	constructor(private readonly billingRepository: BillingRepository) {}

	public toBillingPlanVm(pm: BillingPlanProgrammerModel): BillingPlanViewModel {
		return {
			...pm,
			featureLines: buildPlanFeatureLinesVm(pm)
		};
	}

	public toBillingPlanListVm(listPm: BillingPlanProgrammerModel[]): BillingPlanViewModel[] {
		return listPm.map((pm) => this.toBillingPlanVm(pm));
	}

	public toBillingSubscriptionVm(
		pm: BillingSubscriptionProgrammerModel | null
	): BillingSubscriptionViewModel | null {
		if (!pm) return null;
		return {
			id: pm.id,
			tier: pm.tier,
			period: pm.period,
			cancelAt: pm.cancelAt
		};
	}

	public toBillingCurrentVm(pm: BillingCurrentProgrammerModel): BillingCurrentViewModel {
		return {
			tier: pm.tier,
			subscription: this.toBillingSubscriptionVm(pm.subscription),
			drive: pm.drive,
			limits: pm.limits,
			billing: pm.billing,
			billingEnabled: pm.billingEnabled
		};
	}

	/**
	 * Load catalog plans and optional workspace billing context; map PM → VM.
	 * Stateless: does not touch `$state`.
	 */
	public async loadBillingPricingVmStateless(
		organizationId?: string
	): Promise<BillingPricingViewModel> {
		const listPm = await this.billingRepository.listPlans();
		const plansVm = this.toBillingPlanListVm(listPm.plans);
		const orgId = organizationId?.trim();
		if (!orgId) {
			return { plansVm, currentVm: null, billingEnabled: listPm.billingEnabled };
		}
		let currentVm: BillingCurrentViewModel | null = null;
		try {
			const currentPm = await this.billingRepository.getCurrent(orgId);
			currentVm = currentPm ? this.toBillingCurrentVm(currentPm) : null;
		} catch {
			// Plans still render when workspace billing context is temporarily unavailable.
		}
		return {
			plansVm,
			currentVm,
			billingEnabled: listPm.billingEnabled
		};
	}
}
