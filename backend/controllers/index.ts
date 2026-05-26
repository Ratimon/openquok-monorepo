import { AuthController } from "./AuthController";
import { UserController } from "./UserController";
import { CompanyController } from "./CompanyController";
import { SettingsController } from "./SettingsController";
import { RbacController } from "./RbacController";
import { FeedbackController } from "./FeedbackController";
import { BlogController } from "./BlogController";
import { ImageController } from "./ImageController";
import { MediaController, MAX_MEDIA_UPLOAD_BYTES } from "./MediaController";
import { BillingController } from "./BillingController";
import { StripeWebhookController } from "./StripeWebhookController";
import { ConfigController } from "./ConfigController";
import { EmailController } from "./EmailController";
import { IntegrationController } from "./IntegrationController";
import { PublicIntegrationController } from "./PublicIntegrationController";
import { NotificationController } from "./NotificationController";
import { PublicNotificationController } from "./PublicNotificationController";
import { PostsController } from "./PostsController";
import { PublicPostsController } from "./PublicPostsController";
import { PublicAnalyticsController } from "./PublicAnalyticsController";
import { OauthAppController } from "./OauthAppController";
import { OauthController } from "./OauthController";
import { ApprovedAppsController } from "./ApprovedAppsController";
import { ThirdPartyController } from "./ThirdPartyController";
import { SignatureController } from "./SignatureController";
import { SetsController } from "./SetsController";
import { AnalyticsController } from "./AnalyticsController";
import {
    authenticationService,
    emailService,
    userService,
    companyService,
    marketingService,
    organizationService,
    rbacService,
    feedbackService,
    blogService,
    configService,
    integrationConnectionService,
    integrationManager,
    notificationService,
    postsService,
    oauthAppService,
    oauthService,
    mediaService,
    subscriptionService,
    permissionsService,
    stripeService,
    trackService,
    signatureService,
    setsService,
    analyticsService,
    userSessionService,
} from "../services/index";
import { TrackController } from "./TrackController";
import { subscriptionRepository } from "../repositories/index";
import { userRepository, storageR2Repository, storageSupabaseRepository } from "../repositories/index";
import { UploadFactory } from "../connections/upload/upload.factory";

export const authController = new AuthController(
    authenticationService,
    userRepository,
    userService,
    emailService,
    organizationService,
    rbacService
);
export const userController = new UserController(
    userService,
    authenticationService,
    emailService,
    userSessionService,
    organizationService,
    subscriptionService,
    stripeService
);
export const companyController = new CompanyController(companyService, marketingService);
export const trackController = new TrackController(trackService);
export const settingsController = new SettingsController(organizationService);
export const rbacController = new RbacController(rbacService, userRepository);
export const feedbackController = new FeedbackController(feedbackService);
export const blogController = new BlogController(blogService);
export const imageController = new ImageController(storageSupabaseRepository);
export const mediaController = new MediaController(
    mediaService,
    subscriptionService,
    storageR2Repository,
    UploadFactory.createStorage(storageR2Repository)
);
export const billingController = new BillingController(
    subscriptionService,
    permissionsService,
    stripeService,
    subscriptionRepository,
    emailService
);
export const stripeWebhookController = new StripeWebhookController(stripeService);
export { MAX_MEDIA_UPLOAD_BYTES };
export const configController = new ConfigController(configService);
export const emailController = new EmailController(emailService);
export const integrationController = new IntegrationController(integrationConnectionService, integrationManager);
export const publicIntegrationController = new PublicIntegrationController(integrationConnectionService);
export const notificationController = new NotificationController(notificationService);
export const publicNotificationController = new PublicNotificationController(notificationService);
export const postsController = new PostsController(postsService);
export const publicPostsController = new PublicPostsController(postsService);
export const publicAnalyticsController = new PublicAnalyticsController(analyticsService, postsService);
export const oauthAppController = new OauthAppController(oauthAppService);
export const oauthController = new OauthController(oauthService);
export const approvedAppsController = new ApprovedAppsController(oauthService);
export const thirdPartyController = new ThirdPartyController();
export const signatureController = new SignatureController(signatureService);
export const setsController = new SetsController(setsService);
export const analyticsController = new AnalyticsController(analyticsService, integrationConnectionService, postsService);