import supertest from "supertest";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { getStripeClient } from "../../connections/stripe";
import { EmailService } from "../../services/EmailService";
import { subscriptionRepository } from "../../repositories/index";
import { stripeService } from "../../services/index";
import {
    cleanupIntegrationTestUsers,
    signupVerifyAndSignIn,
} from "../helpers/integrationAuthTestHelper";
import { UserTestHelper } from "../helpers/userTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";
import {
    advanceTestClockByDays,
    billingPath,
    billingGet,
    billingPost,
    deleteStripeBillingFixture,
    hasSupabaseForBillingE2e,
    assertPayTodayProrate,
    buildProrationBreakdown,
    postBillingProrate,
    postBillingProrateAfterAdvancingClock,
    prepareBillingSession,
    seedStripeSubscriptionFixture,
    stripeBillingE2eEnabled,
    stripePriceIdForTier,
    type BillingSession,
    type StripeBillingFixture,
} from "./helpers/billingE2eHelper";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const usersPath = `${apiPrefix}/users`;

const describeIfSupabase = hasSupabaseForBillingE2e() ? describe : describe.skip;
const describeIfStripeBilling = stripeBillingE2eEnabled() ? describe : describe.skip;

describeIfSupabase("Billing plans (API)", () => {
    const userHelper = new UserTestHelper();

    let getVerificationTokenSpy: jest.SpyInstance;
    let verificationToken: string;
    let emailSendSpy: jest.SpyInstance;

    beforeAll(() => {
        verificationToken = generateRandomVerificationToken();
        getVerificationTokenSpy = jest
            .spyOn(EmailService.prototype, "generateVerificationToken")
            .mockImplementation(() => verificationToken);
        emailSendSpy = jest.spyOn(EmailService.prototype, "send").mockResolvedValue(undefined);
    });

    afterAll(async () => {
        await userHelper.cleanAll();
        getVerificationTokenSpy?.mockRestore();
        emailSendSpy?.mockRestore();
    });

    afterEach(async () => {
        await cleanupIntegrationTestUsers(userHelper);
    });

    async function signUpSession(): Promise<BillingSession> {
        const { accessToken } = await signupVerifyAndSignIn(
            app,
            userHelper,
            authPath,
            verificationToken
        );
        return prepareBillingSession(accessToken, userHelper);
    }

    it("new workspace is eligible for a 7-day trial (allow_trial, is_trialing)", async () => {
        const session = await signUpSession();

        const currentRes = await billingGet(app, session, `${billingPath}/current`);
        expect(currentRes.status).toBe(200);
        expect(currentRes.body?.data?.billing).toMatchObject({
            allowTrial: true,
            isTrialing: true,
        });
        expect(currentRes.body?.data?.tier).toBe("FREE");

        const finishedRes = await billingGet(app, session, `${billingPath}/is-trial-finished`);
        expect(finishedRes.status).toBe(200);
        expect(finishedRes.body?.data?.finished).toBe(false);
    });

    it("POST /billing/prorate returns zero when there is no Stripe subscription", async () => {
        const session = await signUpSession();

        const { status, price } = await postBillingProrate(session, {
            billing: "CREATOR",
            period: "MONTHLY",
        });
        expect(status).toBe(200);
        expect(price).toBe(0);
    });

    it("GET /billing/plans exposes tier catalog when billing is configured", async () => {
        const session = await signUpSession();

        const plansRes = await billingGet(app, session, `${billingPath}/plans`);
        expect(plansRes.status).toBe(200);
        expect(Array.isArray(plansRes.body?.data?.tiers)).toBe(true);
        expect(plansRes.body?.data?.tiers?.map((t: { tier: string }) => t.tier)).toEqual(
            expect.arrayContaining(["SOLO", "CREATOR", "TEAM", "ULTIMATE"])
        );

        const meRes = await supertest(app)
            .get(`${usersPath}/me`)
            .set("Authorization", `Bearer ${session.accessToken}`)
            .set("Cookie", [session.cookieHeader]);
        expect(meRes.status).toBe(200);
        expect(typeof meRes.body?.data?.billingEnabled).toBe("boolean");
    });
});

describeIfStripeBilling("Billing plans (Stripe test mode)", () => {
    jest.setTimeout(120_000);

    const userHelper = new UserTestHelper();
    let stripeFixture: StripeBillingFixture | undefined;

    let getVerificationTokenSpy: jest.SpyInstance;
    let verificationToken: string;
    let emailSendSpy: jest.SpyInstance;

    beforeAll(() => {
        verificationToken = generateRandomVerificationToken();
        getVerificationTokenSpy = jest
            .spyOn(EmailService.prototype, "generateVerificationToken")
            .mockImplementation(() => verificationToken);
        emailSendSpy = jest.spyOn(EmailService.prototype, "send").mockResolvedValue(undefined);
    });

    afterAll(async () => {
        await deleteStripeBillingFixture(stripeFixture);
        stripeFixture = undefined;
        await userHelper.cleanAll();
        getVerificationTokenSpy?.mockRestore();
        emailSendSpy?.mockRestore();
    });

    afterEach(async () => {
        await deleteStripeBillingFixture(stripeFixture);
        stripeFixture = undefined;
        await cleanupIntegrationTestUsers(userHelper);
    });

    async function signUpSession(): Promise<BillingSession> {
        const { accessToken } = await signupVerifyAndSignIn(
            app,
            userHelper,
            authPath,
            verificationToken
        );
        return prepareBillingSession(accessToken, userHelper);
    }

    it("first SOLO subscribe uses a 7-day trial and prorate upgrade is $0 while trialing", async () => {
        const session = await signUpSession();
        stripeFixture = await seedStripeSubscriptionFixture({
            organizationId: session.organizationId,
            tier: "SOLO",
            period: "MONTHLY",
            trialDays: 7,
        });

        const currentRes = await billingGet(app, session, `${billingPath}/current`);
        expect(currentRes.status).toBe(200);
        expect(currentRes.body?.data?.tier).toBe("SOLO");
        expect(currentRes.body?.data?.billing?.isTrialing).toBe(true);

        const { price: upgradeWhileTrial } = await postBillingProrate(session, {
            billing: "CREATOR",
            period: "MONTHLY",
        });
        expect(upgradeWhileTrial).toBe(0);
    });

    it("after trial ends the workspace stays subscribed and prorate can be non-zero mid-cycle", async () => {
        const session = await signUpSession();
        stripeFixture = await seedStripeSubscriptionFixture({
            organizationId: session.organizationId,
            tier: "SOLO",
            period: "MONTHLY",
            trialDays: 7,
        });

        const finishRes = await billingPost(app, session, `${billingPath}/finish-trial`);
        expect(finishRes.status).toBe(200);

        const finishedRes = await billingGet(app, session, `${billingPath}/is-trial-finished`);
        expect(finishedRes.status).toBe(200);
        expect(finishedRes.body?.data?.finished).toBe(true);

        const currentAfterTrial = await billingGet(app, session, `${billingPath}/current`);
        expect(currentAfterTrial.status).toBe(200);
        expect(currentAfterTrial.body?.data?.tier).toBe("SOLO");
        expect(currentAfterTrial.body?.data?.billing?.isTrialing).toBe(false);

        const { payTodayUsd: upgradePayToday, breakdown: upgradeBreakdown } =
            await postBillingProrateAfterAdvancingClock({
                session,
                fixture: stripeFixture,
                fromTier: "SOLO",
                target: { billing: "CREATOR", period: "MONTHLY" },
                startDays: 8,
                stepDays: 4,
                maxDays: 28,
            });
        assertPayTodayProrate({
            label: "SOLO → CREATOR after trial (mid-cycle upgrade)",
            breakdown: upgradeBreakdown,
            apiPayTodayUsd: upgradePayToday,
            greaterThan: 0,
        });
        expect({
            payTodayUsd: upgradePayToday,
            stripeRawUsd: upgradeBreakdown.rawPayTodayUsd,
            linearEstimateUsd: upgradeBreakdown.linearEstimateUsd,
            catalogFromTo: `$${upgradeBreakdown.fromMonthlyCatalogUsd} → $${upgradeBreakdown.toMonthlyCatalogUsd}`,
            stripeFromTo: `$${upgradeBreakdown.fromStripeMonthlyUsd} → $${upgradeBreakdown.toStripeMonthlyUsd}`,
            daysRemaining: upgradeBreakdown.daysRemaining,
            daysInPeriod: upgradeBreakdown.daysInPeriod,
        }).toEqual({
            payTodayUsd: upgradeBreakdown.payTodayUsd,
            stripeRawUsd: upgradeBreakdown.rawPayTodayUsd,
            linearEstimateUsd: upgradeBreakdown.linearEstimateUsd,
            catalogFromTo: "$29 → $39",
            stripeFromTo: `$${upgradeBreakdown.fromStripeMonthlyUsd} → $${upgradeBreakdown.toStripeMonthlyUsd}`,
            daysRemaining: expect.any(Number),
            daysInPeriod: expect.any(Number),
        });
    });

    it("upgrade and downgrade prorate previews reflect plan changes mid-cycle", async () => {
        const session = await signUpSession();
        stripeFixture = await seedStripeSubscriptionFixture({
            organizationId: session.organizationId,
            tier: "SOLO",
            period: "MONTHLY",
        });

        const { payTodayUsd: upgradePayToday, breakdown: upgradeBreakdown } =
            await postBillingProrateAfterAdvancingClock({
                session,
                fixture: stripeFixture,
                fromTier: "SOLO",
                target: { billing: "CREATOR", period: "MONTHLY" },
                startDays: 10,
                stepDays: 5,
                maxDays: 30,
            });
        assertPayTodayProrate({
            label: "SOLO → CREATOR mid-cycle (before subscribe)",
            breakdown: upgradeBreakdown,
            apiPayTodayUsd: upgradePayToday,
            greaterThan: 0,
        });
        expect({
            upgradePayTodayUsd: upgradePayToday,
            upgradeStripeRawUsd: upgradeBreakdown.rawPayTodayUsd,
            upgradeLinearEstimateUsd: upgradeBreakdown.linearEstimateUsd,
            catalogFromTo: "$29 → $39",
        }).toEqual({
            upgradePayTodayUsd: upgradeBreakdown.payTodayUsd,
            upgradeStripeRawUsd: upgradeBreakdown.rawPayTodayUsd,
            upgradeLinearEstimateUsd: upgradeBreakdown.linearEstimateUsd,
            catalogFromTo: "$29 → $39",
        });

        const creatorPriceId = stripePriceIdForTier("CREATOR", "MONTHLY");
        const subscribeRes = await billingPost(app, session, `${billingPath}/subscribe`)
            .send({
                organizationId: session.organizationId,
                period: "MONTHLY",
                billing: "CREATOR",
                stripePriceId: creatorPriceId,
            });
        expect(subscribeRes.status).toBe(200);
        expect(subscribeRes.body?.data?.updated).toBe(true);

        await stripeService.reconcileSubscriptionWithStripe(session.organizationId);

        const currentRes = await billingGet(app, session, `${billingPath}/current`);
        expect(currentRes.status).toBe(200);
        expect(currentRes.body?.data?.tier).toBe("CREATOR");

        const downgradeBreakdown = await buildProrationBreakdown({
            fixture: stripeFixture,
            fromTier: "CREATOR",
            toTier: "SOLO",
            period: "MONTHLY",
        });
        const { price: downgradePayToday } = await postBillingProrate(session, {
            billing: "SOLO",
            period: "MONTHLY",
        });
        assertPayTodayProrate({
            label: "CREATOR → SOLO mid-cycle (downgrade preview)",
            breakdown: downgradeBreakdown,
            apiPayTodayUsd: downgradePayToday,
            lessThan: upgradePayToday,
        });
        expect({
            upgradePayTodayUsd: upgradePayToday,
            downgradePayTodayUsd: downgradePayToday,
            downgradeStripeRawUsd: downgradeBreakdown.rawPayTodayUsd,
            catalogDeltaUsd:
                downgradeBreakdown.toMonthlyCatalogUsd -
                downgradeBreakdown.fromMonthlyCatalogUsd,
        }).toEqual({
            upgradePayTodayUsd: expect.any(Number),
            downgradePayTodayUsd: downgradeBreakdown.payTodayUsd,
            downgradeStripeRawUsd: downgradeBreakdown.rawPayTodayUsd,
            catalogDeltaUsd: -10,
        });
        expect(downgradePayToday).toBeLessThan(upgradePayToday);

        const sameTierBreakdown = await buildProrationBreakdown({
            fixture: stripeFixture,
            fromTier: "CREATOR",
            toTier: "CREATOR",
            period: "MONTHLY",
        });
        const { price: sameTierPayToday } = await postBillingProrate(session, {
            billing: "CREATOR",
            period: "MONTHLY",
        });
        assertPayTodayProrate({
            label: "CREATOR → CREATOR (no plan change)",
            breakdown: sameTierBreakdown,
            apiPayTodayUsd: sameTierPayToday,
        });
        expect({
            sameTierPayTodayUsd: sameTierPayToday,
            sameTierStripeRawUsd: sameTierBreakdown.rawPayTodayUsd,
        }).toEqual({
            sameTierPayTodayUsd: sameTierBreakdown.payTodayUsd,
            sameTierStripeRawUsd: sameTierBreakdown.rawPayTodayUsd,
        });
    });

    it("scheduled cancel still allows purchasing a higher tier", async () => {
        const session = await signUpSession();
        stripeFixture = await seedStripeSubscriptionFixture({
            organizationId: session.organizationId,
            tier: "SOLO",
            period: "MONTHLY",
        });

        const cancelRes = await billingPost(app, session, `${billingPath}/cancel`)
            .send({
                organizationId: session.organizationId,
                feedback: "E2E cancel to test upgrade after scheduling cancellation",
            });
        expect(cancelRes.status).toBe(200);
        expect(cancelRes.body?.data?.cancelAt).toBeDefined();

        await stripeService.reconcileSubscriptionWithStripe(session.organizationId);

        const currentScheduled = await billingGet(app, session, `${billingPath}/current`);
        expect(currentScheduled.status).toBe(200);
        expect(currentScheduled.body?.data?.subscription?.cancel_at).toBeTruthy();

        const creatorPriceId = stripePriceIdForTier("CREATOR", "MONTHLY");
        const upgradeRes = await billingPost(app, session, `${billingPath}/subscribe`)
            .send({
                organizationId: session.organizationId,
                period: "MONTHLY",
                billing: "CREATOR",
                stripePriceId: creatorPriceId,
            });
        expect(upgradeRes.status).toBe(200);
        expect(upgradeRes.body?.data?.updated ?? upgradeRes.body?.data?.url).toBeTruthy();

        await stripeService.reconcileSubscriptionWithStripe(session.organizationId);

        const currentAfterUpgrade = await billingGet(app, session, `${billingPath}/current`);
        expect(currentAfterUpgrade.status).toBe(200);
        expect(currentAfterUpgrade.body?.data?.tier).toBe("CREATOR");
    });

    it("after subscription ends, user can subscribe to a higher tier again", async () => {
        const session = await signUpSession();
        stripeFixture = await seedStripeSubscriptionFixture({
            organizationId: session.organizationId,
            tier: "SOLO",
            period: "MONTHLY",
        });

        const stripe = getStripeClient();
        await stripe.subscriptions.cancel(stripeFixture.subscriptionId);
        await subscriptionRepository.setTrialing(session.organizationId, false);
        await stripeService.reconcileSubscriptionWithStripe(session.organizationId);

        const freeRes = await billingGet(app, session, `${billingPath}/current`);
        expect(freeRes.status).toBe(200);
        expect(freeRes.body?.data?.tier).toBe("FREE");

        const creatorPriceId = stripePriceIdForTier("CREATOR", "MONTHLY");
        const subscribeRes = await billingPost(app, session, `${billingPath}/subscribe`)
            .send({
                organizationId: session.organizationId,
                period: "MONTHLY",
                billing: "CREATOR",
                stripePriceId: creatorPriceId,
            });
        expect(subscribeRes.status).toBe(200);
        expect(subscribeRes.body?.data?.url).toBeDefined();

        const newSub = await stripe.subscriptions.create({
            customer: stripeFixture.customerId,
            items: [{ price: creatorPriceId, quantity: 1 }],
            metadata: {
                service: "openquok",
                billing: "CREATOR",
                period: "MONTHLY",
                uniqueId: `e2e-resub-${Date.now()}`,
                organizationId: session.organizationId,
            },
        });
        stripeFixture = {
            ...stripeFixture,
            subscriptionId: newSub.id,
        };
        await stripeService.syncSubscriptionFromStripe(newSub);

        const currentRes = await billingGet(app, session, `${billingPath}/current`);
        expect(currentRes.status).toBe(200);
        expect(currentRes.body?.data?.tier).toBe("CREATOR");
    });
});
