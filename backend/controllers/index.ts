import { AuthController } from "./AuthController";
import { UserController } from "./UserController";
import { CompanyController } from "./CompanyController";
import { SettingsController } from "./SettingsController";
import { RbacController } from "./RbacController";
import { FeedbackController } from "./FeedbackController";
import { BlogController } from "./BlogController";
import { ImageController } from "./ImageController";
import { MediaController, MAX_MEDIA_UPLOAD_BYTES } from "./MediaController";
import { ConfigController } from "./ConfigController";
import { EmailController } from "./EmailController";
import { IntegrationController } from "./IntegrationController";
import { PublicIntegrationController } from "./PublicIntegrationController";
import { NotificationController } from "./NotificationController";
import { PostsController } from "./PostsController";
import { ThirdPartyController } from "./ThirdPartyController";
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
    mediaService,
} from "../services/index";
import { userRepository, storageR2Repository, storageSupabaseRepository } from "../repositories/index";
import { UploadFactory } from "../connections/upload/upload.factory";

export const authController = new AuthController(authenticationService, userRepository, userService, emailService, organizationService);
export const userController = new UserController(userService, authenticationService, emailService);
export const companyController = new CompanyController(companyService, marketingService);
export const settingsController = new SettingsController(organizationService);
export const rbacController = new RbacController(rbacService, userRepository);
export const feedbackController = new FeedbackController(feedbackService);
export const blogController = new BlogController(blogService);
export const imageController = new ImageController(storageSupabaseRepository);
export const mediaController = new MediaController(
    mediaService,
    storageR2Repository,
    UploadFactory.createStorage(storageR2Repository)
);
export { MAX_MEDIA_UPLOAD_BYTES };
export const configController = new ConfigController(configService);
export const emailController = new EmailController(emailService);
export const integrationController = new IntegrationController(integrationConnectionService, integrationManager);
export const publicIntegrationController = new PublicIntegrationController(integrationConnectionService);
export const notificationController = new NotificationController(notificationService);
export const postsController = new PostsController(postsService);
export const thirdPartyController = new ThirdPartyController();