import { supabaseServiceClientConnection, cacheServiceConnection, cacheInvalidationServiceConnection } from "../connections/index";
import {
    refreshTokenRepository,
    userRepository,
    configRepository,
    organizationRepository,
    rbacRepository,
    feedbackRepository,
    blogRepository,
    integrationRepository,
    notificationRepository,
    postsRepository,
    mediaRepository,
} from "../repositories/index";
import { AuthenticationService } from "./AuthenticationService";
import { UserService } from "./UserService";
import { EmailService } from "./EmailService";
import { CompanyService } from "./CompanyService";
import { MarketingService } from "./MarketingService";
import { OrganizationService } from "./OrganizationService";
import { RbacService } from "./RbacService";
import { FeedbackService } from "./FeedbackService";
import { BlogService } from "./BlogService";
import { ConfigService } from "./ConfigService";
import { IntegrationManager } from "../integrations/integrationManager";
import { RefreshIntegrationService } from "./RefreshIntegrationService";
import { IntegrationService } from "./IntegrationService";
import { IntegrationConnectionService } from "./IntegrationConnectionService";
import { NotificationService } from "./NotificationService";
import { TransactionalNotificationEmailService } from "./TransactionalNotificationEmailService";
import { PostsService } from "./PostsService";
import { MediaService } from "./MediaService";

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
    notificationService
);
export const authenticationService = new AuthenticationService(
    supabaseServiceClientConnection,
    refreshTokenRepository,
    userRepository,
    userService
);
export const organizationService = new OrganizationService(
    organizationRepository,
    userRepository,
    emailService,
    cacheServiceConnection,
    cacheInvalidationServiceConnection
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
export const blogService = new BlogService(
    blogRepository,
    cacheServiceConnection,
    cacheInvalidationServiceConnection,
    configRepository
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
export const integrationConnectionService = new IntegrationConnectionService(
    integrationService,
    organizationRepository,
    integrationManager,
    refreshIntegrationService,
    cacheServiceConnection,
    cacheInvalidationServiceConnection
);
export const postsService = new PostsService(
    postsRepository,
    integrationConnectionService,
    integrationService,
    organizationRepository
);
export const mediaService = new MediaService(mediaRepository);
export { AuthenticationService } from "./AuthenticationService";
export { UserService } from "./UserService";
export { EmailService } from "./EmailService";
export { CompanyService } from "./CompanyService";
export { MarketingService } from "./MarketingService";
export { OrganizationService } from "./OrganizationService";
export { RbacService } from "./RbacService";
export { FeedbackService } from "./FeedbackService";
export { BlogService } from "./BlogService";
export { ConfigService } from "./ConfigService";
export { IntegrationService } from "./IntegrationService";
export { IntegrationConnectionService } from "./IntegrationConnectionService";
export { RefreshIntegrationService } from "./RefreshIntegrationService";
export { NotificationService } from "./NotificationService";
export { TransactionalNotificationEmailService, type SendPlainJobPayload } from "./TransactionalNotificationEmailService";
export { PostsService } from "./PostsService";
export { MediaService } from "./MediaService";
