import { supabaseServiceClientConnection, cacheServiceConnection, cacheInvalidationServiceConnection } from "../connections/index";
import {
    refreshTokenRepository,
    userRepository,
    configRepository,
    organizationRepository,
    rbacRepository,
    feedbackRepository,
    blogRepository,
    listingRepository,
    listingCategoryRepository,
    listingTagRepository,
    integrationRepository,
    plugRepository,
    notificationRepository,
    postsRepository,
    mediaRepository,
    signatureRepository,
    setsRepository,
    oauthAppRepository,
    storageSupabaseRepository,
    subscriptionRepository,
} from "../repositories/index";
import { AuthenticationService } from "./AuthenticationService";
import { UserService } from "./UserService";
import { EmailService } from "./EmailService";
import { CompanyService } from "./CompanyService";
import { MarketingService } from "./MarketingService";
import { OrganizationService } from "./OrganizationService";
import { RbacService } from "../guards/rbac/RbacService";
import { FeedbackService } from "./FeedbackService";
import { BlogService } from "./BlogService";
import { ListingService } from "./ListingService";
import { ConfigService } from "./ConfigService";
import { IntegrationManager } from "../integrations/integrationManager";
import { RefreshIntegrationService } from "./RefreshIntegrationService";
import { IntegrationService } from "./IntegrationService";
import { PlugService } from "./PlugService";
import { IntegrationConnectionService } from "./IntegrationConnectionService";
import { NotificationService } from "./NotificationService";
import { TransactionalNotificationEmailService } from "./TransactionalNotificationEmailService";
import { PostsService } from "./PostsService";
import { MediaService } from "./MediaService";
import { SignatureService } from "./SignatureService";
import { SetsService } from "./SetsService";
import { AnalyticsService } from "./AnalyticsService";
import { OauthAppService } from "./OauthAppService";
import { OauthService } from "./OauthService";
import { SubscriptionService } from "./SubscriptionService";
import { UserSessionService } from "./UserSessionService";
import { SubscriptionGuardService } from "../guards/subscription/SubscriptionGuardService";
import { StripeService } from "./StripeService";
import { TrackService } from "./TrackService";
import { config } from "../config/GlobalConfig";

export const integrationManager = new IntegrationManager();

export const userService = new UserService(
    userRepository,
    cacheServiceConnection,
    rbacRepository,
    cacheInvalidationServiceConnection
);
export const emailService = new EmailService({
    isEnabled: (config.email as { enabled?: boolean } | undefined)?.enabled ?? false,
});
export const transactionalNotificationEmailService = new TransactionalNotificationEmailService(
    organizationRepository
);
export const notificationService = new NotificationService(
    notificationRepository,
    userRepository,
    organizationRepository,
    emailService,
    transactionalNotificationEmailService
);

export const refreshIntegrationService = new RefreshIntegrationService(
    integrationRepository,
    integrationManager,
    storageSupabaseRepository,
    notificationService
);
export const authenticationService = new AuthenticationService(
    supabaseServiceClientConnection,
    refreshTokenRepository,
    userRepository,
    userService
);
export const companyService = new CompanyService(configRepository, cacheServiceConnection);
export const marketingService = new MarketingService(configRepository, cacheServiceConnection);
export const rbacService = new RbacService(
    rbacRepository,
    cacheServiceConnection,
    cacheInvalidationServiceConnection
);
export const feedbackService = new FeedbackService(
    feedbackRepository,
    cacheServiceConnection,
    cacheInvalidationServiceConnection
);
export const configService = new ConfigService(
    configRepository,
    cacheServiceConnection,
    cacheInvalidationServiceConnection
);
export const integrationService = new IntegrationService(
    integrationRepository,
    cacheServiceConnection,
    cacheInvalidationServiceConnection
);
export const plugService = new PlugService(
    plugRepository,
    integrationRepository,
    cacheServiceConnection,
    cacheInvalidationServiceConnection
);
export const subscriptionService = new SubscriptionService(
    subscriptionRepository,
    mediaRepository,
    organizationRepository
);
export const subscriptionGuard = new SubscriptionGuardService(
    subscriptionService,
    integrationService,
    organizationRepository,
    postsRepository,
    rbacRepository
);
subscriptionService.setSubscriptionGuard(subscriptionGuard);
export const blogService = new BlogService(
    blogRepository,
    cacheServiceConnection,
    cacheInvalidationServiceConnection,
    configRepository,
    subscriptionGuard
);
export const listingService = new ListingService(
    listingRepository,
    listingCategoryRepository,
    listingTagRepository,
    cacheServiceConnection,
    cacheInvalidationServiceConnection,
    configRepository,
    subscriptionGuard
);
export const userSessionService = new UserSessionService(
    organizationRepository,
    subscriptionGuard,
    subscriptionService,
    subscriptionRepository
);
export const integrationConnectionService = new IntegrationConnectionService(
    integrationService,
    plugService,
    organizationRepository,
    integrationManager,
    refreshIntegrationService,
    storageSupabaseRepository,
    cacheServiceConnection,
    cacheInvalidationServiceConnection,
    subscriptionGuard
);

export const oauthAppService = new OauthAppService(
    oauthAppRepository,
    organizationRepository,
    mediaRepository,
    subscriptionGuard
);

export const organizationService = new OrganizationService(
    organizationRepository,
    userRepository,
    emailService,
    cacheServiceConnection,
    cacheInvalidationServiceConnection,
    subscriptionGuard,
    oauthAppService
);
export const oauthService = new OauthService(oauthAppRepository, organizationRepository, mediaRepository);
export const postsService = new PostsService(
    postsRepository,
    integrationConnectionService,
    integrationService,
    organizationRepository,
    integrationManager,
    refreshIntegrationService,
    cacheServiceConnection,
    cacheInvalidationServiceConnection,
    subscriptionGuard
);
export const stripeService = new StripeService(
    subscriptionRepository,
    subscriptionService,
    organizationRepository,
    userRepository
);
export const trackService = new TrackService();
export const mediaService = new MediaService(mediaRepository);
export const signatureService = new SignatureService(
    signatureRepository,
    integrationConnectionService,
    cacheServiceConnection,
    cacheInvalidationServiceConnection
);

export const setsService = new SetsService(
    setsRepository,
    integrationConnectionService,
    cacheServiceConnection,
    cacheInvalidationServiceConnection
);

export const analyticsService = new AnalyticsService(
    integrationService,
    integrationManager,
    refreshIntegrationService
);
export { AuthenticationService } from "./AuthenticationService";
export { UserService } from "./UserService";
export { EmailService } from "./EmailService";
export { CompanyService } from "./CompanyService";
export { MarketingService } from "./MarketingService";
export { OrganizationService } from "./OrganizationService";
export { RbacService } from "../guards/rbac/RbacService";
export { FeedbackService } from "./FeedbackService";
export { BlogService } from "./BlogService";
export { ListingService } from "./ListingService";
export { ConfigService } from "./ConfigService";
export { IntegrationService } from "./IntegrationService";
export { PlugService } from "./PlugService";
export { IntegrationConnectionService } from "./IntegrationConnectionService";
export { RefreshIntegrationService } from "./RefreshIntegrationService";
export { NotificationService } from "./NotificationService";
export { TransactionalNotificationEmailService, type SendPlainJobPayload } from "./TransactionalNotificationEmailService";
export { PostsService } from "./PostsService";
export { MediaService } from "./MediaService";
export { SignatureService } from "./SignatureService";
export { SetsService } from "./SetsService";
export { AnalyticsService } from "./AnalyticsService";
export { SubscriptionService } from "./SubscriptionService";
export { SubscriptionGuardService } from "../guards/subscription/SubscriptionGuardService";
export { StripeService } from "./StripeService";
export { TrackService } from "./TrackService";
