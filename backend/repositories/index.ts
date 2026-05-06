import { config } from "../config/GlobalConfig";
import { supabaseServiceClientConnection } from "../connections/index";
import { RefreshTokenRepository } from "./RefreshTokenRepository";
import { UserRepository } from "./UserRepository";
import { ConfigRepository } from "./ConfigRepository";
import { OrganizationRepository } from "./OrganizationRepository";
import { RbacRepository } from "./RbacRepository";
import { FeedbackRepository } from "./FeedbackRepository";
import { BlogRepository } from "./BlogRepository";
import { isR2ConnectionReady, type R2ConnectionConfig } from "../connections/R2StorageClient";
import { StorageR2Repository } from "./StorageR2Repository";
import { MediaRepository } from "./MediaRepository";
import { StorageSupabaseRepository } from "./StorageSupabaseRepository";
import { IntegrationRepository } from "./IntegrationRepository";
import { PlugRepository } from "./PlugRepository";
import { NotificationRepository } from "./NotificationRepository";
import { PostsRepository } from "./PostsRepository";
import { SignatureRepository } from "./SignatureRepository";
import { SetsRepository } from "./SetsRepository";
import { OauthAppRepository } from "./OauthAppRepository";

export const refreshTokenRepository = new RefreshTokenRepository(supabaseServiceClientConnection);
export const userRepository = new UserRepository(supabaseServiceClientConnection);
export const configRepository = new ConfigRepository(supabaseServiceClientConnection);
export const organizationRepository = new OrganizationRepository(supabaseServiceClientConnection);
export const rbacRepository = new RbacRepository(supabaseServiceClientConnection);
export const feedbackRepository = new FeedbackRepository(supabaseServiceClientConnection);
export const blogRepository = new BlogRepository(supabaseServiceClientConnection);
type R2Slice = {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    region: string;
};

const r2Slice = (config as { storage?: { r2?: R2Slice } }).storage?.r2;
const r2Connection: R2ConnectionConfig | null =
    r2Slice && isR2ConnectionReady(r2Slice)
        ? {
              accountId: r2Slice.accountId,
              accessKeyId: r2Slice.accessKeyId,
              secretAccessKey: r2Slice.secretAccessKey,
              bucket: r2Slice.bucket,
              region: (r2Slice.region || "auto").trim() || "auto",
          }
        : null;
export const storageR2Repository = new StorageR2Repository(r2Connection);
export const mediaRepository = new MediaRepository(supabaseServiceClientConnection);
export const storageSupabaseRepository = new StorageSupabaseRepository(supabaseServiceClientConnection);
export const integrationRepository = new IntegrationRepository(supabaseServiceClientConnection);
export const plugRepository = new PlugRepository(supabaseServiceClientConnection);
export const notificationRepository = new NotificationRepository(supabaseServiceClientConnection);
export const postsRepository = new PostsRepository(supabaseServiceClientConnection);
export const signatureRepository = new SignatureRepository(supabaseServiceClientConnection);
export const setsRepository = new SetsRepository(supabaseServiceClientConnection);
export const oauthAppRepository = new OauthAppRepository(supabaseServiceClientConnection);

export { RefreshTokenRepository } from "./RefreshTokenRepository";
export { UserRepository } from "./UserRepository";
export { ConfigRepository } from "./ConfigRepository";
export { OrganizationRepository } from "./OrganizationRepository";
export { RbacRepository } from "./RbacRepository";
export { FeedbackRepository } from "./FeedbackRepository";
export { BlogRepository } from "./BlogRepository";
export { StorageSupabaseRepository } from "./StorageSupabaseRepository";
export { StorageR2Repository, COMPOSER_MEDIA_BUCKET_NAME } from "./StorageR2Repository";
export {
    MediaRepository,
    type MediaListItemDto,
    type MediaListResult,
    type SaveMediaInformationDto,
} from "./MediaRepository";
export type { MediaLike } from "../utils/dtos/MediaDTO";
export { DATABASE_NAMES, type DatabaseName, isAllowedDatabaseName } from "./StorageSupabaseRepository";
export { IntegrationRepository } from "./IntegrationRepository";
export { PlugRepository } from "./PlugRepository";
export { NotificationRepository } from "./NotificationRepository";
export { PostsRepository } from "./PostsRepository";
export { SignatureRepository } from "./SignatureRepository";
export { SetsRepository } from "./SetsRepository";
export { OauthAppRepository } from "./OauthAppRepository";
