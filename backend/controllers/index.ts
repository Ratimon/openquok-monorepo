import { AuthController } from "./AuthController";
import { UserController } from "./UserController";
import { CompanyController } from "./CompanyController";
import { SettingsController } from "./SettingsController";
import { RbacController } from "./RbacController";
import { FeedbackController } from "./FeedbackController";
import { BlogController } from "./BlogController";
import { ImageController } from "./ImageController";
import { ConfigController } from "./ConfigController";
import { EmailController } from "./EmailController";
import { IntegrationController } from "./IntegrationController";
import { PublicIntegrationController } from "./PublicIntegrationController";
import { NotificationController } from "./NotificationController";
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
} from "../services/index";
import { userRepository, storageRepository } from "../repositories/index";

export const authController = new AuthController(authenticationService, userRepository, emailService, organizationService);
export const userController = new UserController(userService, authenticationService, emailService);
export const companyController = new CompanyController(companyService, marketingService);
export const settingsController = new SettingsController(organizationService);
export const rbacController = new RbacController(rbacService, userRepository);
export const feedbackController = new FeedbackController(feedbackService);
export const blogController = new BlogController(blogService);
export const imageController = new ImageController(storageRepository);
export const configController = new ConfigController(configService);
export const emailController = new EmailController(emailService);
export const integrationController = new IntegrationController(integrationConnectionService, integrationManager);
export const publicIntegrationController = new PublicIntegrationController(integrationConnectionService);
export const notificationController = new NotificationController(notificationService);
