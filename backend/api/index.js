'use strict';

var dotenv = require('dotenv');
var supabaseJs = require('@supabase/supabase-js');
var ssr = require('@supabase/ssr');
var redis = require('redis');
var Sentry = require('@sentry/node');
var http = require('http');
var express2 = require('express');
var path2 = require('path');
var helmet = require('helmet');
var cors = require('cors');
var feed = require('feed');
var uuid = require('uuid');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var clientSesv2 = require('@aws-sdk/client-sesv2');
var dayjs = require('dayjs');
var https = require('https');
var zod = require('zod');
var fs = require('fs');
var multer = require('multer');
var cookieParser = require('cookie-parser');
var rateLimit = require('express-rate-limit');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var dotenv__default = /*#__PURE__*/_interopDefault(dotenv);
var Sentry__namespace = /*#__PURE__*/_interopNamespace(Sentry);
var http__default = /*#__PURE__*/_interopDefault(http);
var express2__default = /*#__PURE__*/_interopDefault(express2);
var path2__default = /*#__PURE__*/_interopDefault(path2);
var helmet__default = /*#__PURE__*/_interopDefault(helmet);
var cors__default = /*#__PURE__*/_interopDefault(cors);
var nodemailer__default = /*#__PURE__*/_interopDefault(nodemailer);
var dayjs__default = /*#__PURE__*/_interopDefault(dayjs);
var https__default = /*#__PURE__*/_interopDefault(https);
var fs__default = /*#__PURE__*/_interopDefault(fs);
var multer__default = /*#__PURE__*/_interopDefault(multer);
var cookieParser__default = /*#__PURE__*/_interopDefault(cookieParser);
var rateLimit__default = /*#__PURE__*/_interopDefault(rateLimit);

/* Bundled by tsup for Vercel */
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// config/envHelper.ts
function getEnv(key, defaultValue) {
  return process.env[key] ?? defaultValue ?? "";
}
function getEnvNumber(key, defaultValue) {
  const value = getEnv(key);
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}
function getEnvBoolean(key, defaultValue) {
  const value = getEnv(key);
  if (!value) return defaultValue;
  return value.toLowerCase() === "true";
}
var init_envHelper = __esm({
  "config/envHelper.ts"() {
  }
});

// utils/Logger.ts
var log, logger;
var init_Logger = __esm({
  "utils/Logger.ts"() {
    log = (level) => (msg, ...args) => {
      const out = typeof msg === "object" ? { ...msg } : { msg, ...args[0] };
      console[level](JSON.stringify(out));
    };
    logger = {
      error: log("error"),
      warn: log("warn"),
      info: log("info"),
      debug: log("debug"),
      trace: log("debug")
    };
  }
});

// config/GlobalConfig.ts
var GlobalConfig_exports = {};
__export(GlobalConfig_exports, {
  config: () => config
});
var ENV, config, server;
var init_GlobalConfig = __esm({
  "config/GlobalConfig.ts"() {
    init_envHelper();
    init_Logger();
    ENV = process.env.NODE_ENV ?? "development";
    dotenv__default.default.config({ path: `.env.${ENV}.local` });
    dotenv__default.default.config();
    config = {
      /** Sender identity for transactional email (Resend/SES). */
      basic: {
        siteName: getEnv("SITE_NAME", "Openquok"),
        senderEmailAddress: getEnv("SENDER_EMAIL_ADDRESS", "noreply@example.com")
      },
      server: {
        nodeEnv: getEnv("NODE_ENV", "development"),
        frontendDomainUrl: getEnv("FRONTEND_DOMAIN_URL", "http://localhost:5173"),
        backendDomainUrl: getEnv("BACKEND_DOMAIN_URL", "http://localhost:3000"),
        port: getEnvNumber("PORT", 3e3)
      },
      api: {
        prefix: getEnv("API_PREFIX", "/api/v1")
      },
      cors: {
        allowedOrigins: (() => {
          const frontendUrl = getEnv("FRONTEND_DOMAIN_URL", "http://localhost:5173");
          const origins = [frontendUrl];
          const extra = getEnv("ALLOWED_FRONTEND_ORIGINS", "");
          if (extra) origins.push(...extra.split(",").map((o) => o.trim()).filter(Boolean));
          origins.push("http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000");
          return [...new Set(origins)];
        })(),
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-CSRF-Token"],
        credentials: true,
        maxAge: 86400
      },
      auth: {
        /** When true, registration is disabled (unless DISABLE_REGISTRATION is not set). */
        disableRegistration: getEnvBoolean("DISABLE_REGISTRATION", false),
        /** When true, allow cookie in header for dev (NOT_SECURED). */
        notSecured: getEnvBoolean("NOT_SECURED", false),
        /** Secret for signing organization invite tokens. Required for invite-by-email. */
        inviteTokenSecret: getEnv("INVITE_TOKEN_SECRET", getEnv("JWT_SECRET", ""))
      },
      /**
       * OAuth providers (Google, GitHub, Generic OIDC).
       *
       * - Providers are **enabled only when required env vars are set** (see `connections/oauth/providers/index.ts`).
       * - Google redirect URI to set in Google Cloud Console:
       *   `${BACKEND_DOMAIN_URL}${API_PREFIX}/auth/oauth/google/callback`
       * - Start login endpoint (frontend calls this, then redirects the browser to returned URL):
       *   `GET ${API_PREFIX}/auth/oauth/google`
       */
      oauth: {
        google: {
          clientId: getEnv("OAUTH_GOOGLE_CLIENT_ID", ""),
          clientSecret: getEnv("OAUTH_GOOGLE_CLIENT_SECRET", "")
        },
        github: {
          clientId: getEnv("OAUTH_GITHUB_CLIENT_ID", ""),
          clientSecret: getEnv("OAUTH_GITHUB_CLIENT_SECRET", "")
        },
        generic: {
          authUrl: getEnv("OAUTH_GENERIC_AUTH_URL", ""),
          tokenUrl: getEnv("OAUTH_GENERIC_TOKEN_URL", ""),
          userInfoUrl: getEnv("OAUTH_GENERIC_USERINFO_URL", ""),
          clientId: getEnv("OAUTH_GENERIC_CLIENT_ID", ""),
          clientSecret: getEnv("OAUTH_GENERIC_CLIENT_SECRET", ""),
          scope: getEnv("OAUTH_GENERIC_SCOPE", "openid profile email")
        }
      },
      /** Email (verification, welcome). When enabled, verification emails are sent. */
      email: {
        enabled: getEnvBoolean("EMAIL_ENABLED", false),
        /** When true, use local SES mock (e.g. aws-ses-v2-local) for email. */
        isEmailServerOffline: getEnvBoolean("IS_EMAIL_SERVER_OFFLINE", false)
        // fromName: getEnv("EMAIL_FROM_NAME", "Openquok"),
        // fromAddress: getEnv("EMAIL_FROM_ADDRESS", "noreply@example.com"),
      },
      supabase: {
        supabaseUrl: getEnv("PUBLIC_SUPABASE_URL", ""),
        supabaseAnonKey: getEnv("PUBLIC_SUPABASE_ANON_KEY", ""),
        supabaseServiceRoleKey: getEnv("SUPABASE_SERVICE_ROLE_KEY", "")
      },
      /** AWS (SES) for local/dev email. */
      aws: {
        accessKeyId: getEnv("AWS_ACCESS_KEY_ID", ""),
        secretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY", "")
      },
      /** Resend (production) email. */
      resend: {
        secretKey: getEnv("RESEND_SECRET_KEY", "")
      },
      /** Sentry error monitoring. When SENTRY_DSN is set and enabled, errors are reported to Sentry. */
      sentry: {
        dsn: getEnv("SENTRY_DSN", ""),
        enabled: getEnvBoolean("SENTRY_ENABLED", true)
      },
      /** Cache (memory or redis). Used by CompanyService / MarketingService for module_configs. */
      cache: {
        provider: getEnv("CACHE_PROVIDER", "memory"),
        defaultTTL: getEnvNumber("CACHE_DEFAULT_TTL", 300),
        logHits: getEnvBoolean("CACHE_LOG_HITS", true),
        logMisses: getEnvBoolean("CACHE_LOG_MISSES", true),
        checkPeriod: getEnvNumber("CACHE_CHECK_PERIOD", 60),
        useClones: getEnvBoolean("CACHE_USE_CLONES", false),
        enabled: getEnv("CACHE_ENABLED", "true") !== "false",
        enablePatterns: getEnv("CACHE_ENABLE_PATTERNS", "true") !== "false",
        redis: {
          host: getEnv("REDIS_HOST", "localhost"),
          port: getEnvNumber("REDIS_PORT", 6379),
          password: getEnv("REDIS_PASSWORD", ""),
          db: getEnvNumber("REDIS_DB", 0),
          prefix: getEnv("REDIS_PREFIX", "app:cache:"),
          maxReconnectAttempts: getEnvNumber("REDIS_MAX_RECONNECT_ATTEMPTS", 10),
          enableOfflineQueue: getEnv("REDIS_ENABLE_OFFLINE_QUEUE", "true") !== "false",
          useScan: getEnv("REDIS_USE_SCAN", "true") !== "false"
        }
      },
      /** Rate limiting. When enabled, applies global and auth-specific limits. */
      rateLimit: {
        enabled: getEnv("RATE_LIMIT_ENABLED", "true") !== "false",
        global: {
          windowMs: getEnvNumber("RATE_LIMIT_WINDOW_MS", 36e5),
          // 1 hour
          max: getEnvNumber("RATE_LIMIT_MAX", 30),
          // 30 requests per hour
          standardHeaders: true,
          legacyHeaders: false,
          message: "Too many requests from this IP, please try again later"
        },
        auth: {
          windowMs: getEnvNumber("AUTH_RATE_LIMIT_WINDOW_MS", 9e5),
          max: getEnvNumber("AUTH_RATE_LIMIT_MAX", 50),
          standardHeaders: true,
          legacyHeaders: false,
          message: "Too many authentication attempts, please try again later"
        }
      }
    };
    server = config.server;
    logger.info({ msg: "[Config] Loaded", env: server?.nodeEnv });
  }
});

// connections/oauth/providers/GoogleProvider.ts
var GOOGLE_AUTH_URL, GOOGLE_TOKEN_URL, GOOGLE_USERINFO_URL, GoogleProvider;
var init_GoogleProvider = __esm({
  "connections/oauth/providers/GoogleProvider.ts"() {
    GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
    GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
    GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";
    GoogleProvider = class {
      name = "google";
      clientId;
      clientSecret;
      baseRedirectPath;
      constructor(clientId, clientSecret, backendOrigin2, authRoutePrefix) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.baseRedirectPath = `${backendOrigin2}${authRoutePrefix}/oauth/google/callback`;
      }
      getRedirectUrl(state) {
        const params = new URLSearchParams({
          client_id: this.clientId,
          redirect_uri: this.baseRedirectPath,
          response_type: "code",
          scope: [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile"
          ].join(" "),
          access_type: "offline",
          prompt: "consent"
        });
        if (state) params.set("state", state);
        return `${GOOGLE_AUTH_URL}?${params.toString()}`;
      }
      async exchangeCodeForProfile(code) {
        const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: this.clientId,
            client_secret: this.clientSecret,
            redirect_uri: this.baseRedirectPath,
            grant_type: "authorization_code"
          })
        });
        if (!tokenRes.ok) {
          const text = await tokenRes.text();
          throw new Error(`Google token exchange failed: ${text}`);
        }
        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;
        if (!accessToken) throw new Error("Google did not return an access token");
        const userRes = await fetch(GOOGLE_USERINFO_URL, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (!userRes.ok) {
          const text = await userRes.text();
          throw new Error(`Google userinfo failed: ${text}`);
        }
        const user = await userRes.json();
        const id = user.id ?? user.email;
        if (!id || !user.email) throw new Error("Google userinfo missing id or email");
        return {
          id,
          email: user.email,
          fullName: user.name ?? user.email
        };
      }
    };
  }
});

// connections/oauth/providers/GitHubProvider.ts
var GITHUB_AUTH_URL, GITHUB_TOKEN_URL, GITHUB_USER_URL, GITHUB_EMAILS_URL, GitHubProvider;
var init_GitHubProvider = __esm({
  "connections/oauth/providers/GitHubProvider.ts"() {
    GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";
    GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
    GITHUB_USER_URL = "https://api.github.com/user";
    GITHUB_EMAILS_URL = "https://api.github.com/user/emails";
    GitHubProvider = class {
      name = "github";
      clientId;
      clientSecret;
      baseRedirectPath;
      constructor(clientId, clientSecret, backendOrigin2, authRoutePrefix) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.baseRedirectPath = `${backendOrigin2}${authRoutePrefix}/oauth/github/callback`;
      }
      getRedirectUrl(state) {
        const params = new URLSearchParams({
          client_id: this.clientId,
          redirect_uri: this.baseRedirectPath,
          scope: "user:email read:user"
        });
        if (state) params.set("state", state);
        return `${GITHUB_AUTH_URL}?${params.toString()}`;
      }
      async exchangeCodeForProfile(code) {
        const tokenRes = await fetch(GITHUB_TOKEN_URL, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            code,
            client_id: this.clientId,
            client_secret: this.clientSecret,
            redirect_uri: this.baseRedirectPath
          })
        });
        if (!tokenRes.ok) {
          const text = await tokenRes.text();
          throw new Error(`GitHub token exchange failed: ${text}`);
        }
        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;
        if (!accessToken) throw new Error("GitHub did not return an access token");
        const userRes = await fetch(GITHUB_USER_URL, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json"
          }
        });
        if (!userRes.ok) {
          const text = await userRes.text();
          throw new Error(`GitHub user fetch failed: ${text}`);
        }
        const user = await userRes.json();
        const id = String(user.id ?? user.login ?? "");
        let email = user.email;
        if (!email) {
          const emailsRes = await fetch(GITHUB_EMAILS_URL, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/vnd.github.v3+json"
            }
          });
          if (emailsRes.ok) {
            const emails = await emailsRes.json();
            const primary = emails.find((e) => e.primary) ?? emails[0];
            email = primary?.email;
          }
        }
        if (!id || !email) throw new Error("GitHub profile missing id or email");
        return {
          id,
          email,
          fullName: user.name ?? user.login ?? email
        };
      }
    };
  }
});

// connections/oauth/providers/GenericOidcProvider.ts
var GenericOidcProvider;
var init_GenericOidcProvider = __esm({
  "connections/oauth/providers/GenericOidcProvider.ts"() {
    GenericOidcProvider = class {
      name = "generic";
      authUrl;
      tokenUrl;
      userInfoUrl;
      clientId;
      clientSecret;
      baseRedirectPath;
      /** Scopes to request (default openid profile email). */
      scope;
      constructor(env, backendOrigin2, authRoutePrefix, scope = "openid profile email") {
        this.authUrl = env.authUrl;
        this.tokenUrl = env.tokenUrl;
        this.userInfoUrl = env.userInfoUrl;
        this.clientId = env.clientId;
        this.clientSecret = env.clientSecret;
        this.scope = scope;
        this.baseRedirectPath = `${backendOrigin2}${authRoutePrefix}/oauth/generic/callback`;
      }
      getRedirectUrl(state) {
        const params = new URLSearchParams({
          client_id: this.clientId,
          redirect_uri: this.baseRedirectPath,
          response_type: "code",
          scope: this.scope
        });
        if (state) params.set("state", state);
        return `${this.authUrl}?${params.toString()}`;
      }
      async exchangeCodeForProfile(code) {
        const tokenRes = await fetch(this.tokenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json"
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: this.clientId,
            client_secret: this.clientSecret,
            code,
            redirect_uri: this.baseRedirectPath
          })
        });
        if (!tokenRes.ok) {
          const text = await tokenRes.text();
          throw new Error(`OIDC token exchange failed: ${text}`);
        }
        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;
        if (!accessToken) throw new Error("OIDC did not return an access token");
        const userRes = await fetch(this.userInfoUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json"
          }
        });
        if (!userRes.ok) {
          const text = await userRes.text();
          throw new Error(`OIDC userinfo failed: ${text}`);
        }
        const user = await userRes.json();
        const id = user.sub ?? user.id;
        const email = user.email ?? user.preferred_username;
        const fullName = user.name ?? user.preferred_username;
        if (!id || !email) throw new Error("OIDC userinfo missing sub/id or email");
        return {
          id,
          email,
          fullName: fullName || email
        };
      }
    };
  }
});

// connections/oauth/providers/index.ts
var providers_exports = {};
__export(providers_exports, {
  GenericOidcProvider: () => GenericOidcProvider,
  GitHubProvider: () => GitHubProvider,
  GoogleProvider: () => GoogleProvider,
  getConfiguredOAuthProviders: () => getConfiguredOAuthProviders,
  getOAuthProvider: () => getOAuthProvider
});
function buildGoogle() {
  const c = authConfig?.google;
  if (!c?.clientId || !c?.clientSecret) return null;
  return new GoogleProvider(c.clientId, c.clientSecret, backendOrigin, authPrefix);
}
function buildGitHub() {
  const c = authConfig?.github;
  if (!c?.clientId || !c?.clientSecret) return null;
  return new GitHubProvider(c.clientId, c.clientSecret, backendOrigin, authPrefix);
}
function buildGeneric() {
  const c = authConfig?.generic;
  if (!c?.authUrl || !c?.tokenUrl || !c?.userInfoUrl || !c?.clientId || !c?.clientSecret)
    return null;
  return new GenericOidcProvider(
    {
      authUrl: c.authUrl,
      tokenUrl: c.tokenUrl,
      userInfoUrl: c.userInfoUrl,
      clientId: c.clientId,
      clientSecret: c.clientSecret
    },
    backendOrigin,
    authPrefix,
    c.scope ?? "openid profile email"
  );
}
function getOAuthProvider(name) {
  const normalized = name.toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(providerBuilders, normalized)) {
    throw new Error(`Unknown OAuth provider: ${name}`);
  }
  const provider = providerBuilders[normalized]();
  if (!provider) {
    throw new Error(`OAuth provider "${name}" is not configured (missing env/config)`);
  }
  return provider;
}
function getConfiguredOAuthProviders() {
  const list = [];
  for (const key of Object.keys(providerBuilders)) {
    if (providerBuilders[key]()) list.push(key);
  }
  return list;
}
var serverConfig, apiConfig, authConfig, backendOrigin, authPrefix, providerBuilders;
var init_providers = __esm({
  "connections/oauth/providers/index.ts"() {
    init_GoogleProvider();
    init_GitHubProvider();
    init_GenericOidcProvider();
    init_GlobalConfig();
    init_GoogleProvider();
    init_GitHubProvider();
    init_GenericOidcProvider();
    serverConfig = config.server;
    apiConfig = config.api;
    authConfig = config.oauth;
    backendOrigin = serverConfig?.backendDomainUrl ?? "http://localhost:3000";
    authPrefix = `${apiConfig?.prefix ?? "/api/v1"}/auth`;
    providerBuilders = {
      google: buildGoogle,
      github: buildGitHub,
      generic: buildGeneric
    };
  }
});

// connections/supabase.ts
init_GlobalConfig();
init_Logger();
var supabaseConfig = config.supabase;
supabaseJs.createClient(
  supabaseConfig.supabaseUrl,
  supabaseConfig.supabaseAnonKey
);
function createSupabaseServiceClient() {
  try {
    const supabaseUrl = supabaseConfig.supabaseUrl;
    let supabaseKey = supabaseConfig.supabaseServiceRoleKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseKey) {
      if (config.server.nodeEnv === "production") {
        throw new Error(
          "SUPABASE_SERVICE_ROLE_KEY (or config.supabase.supabaseServiceRoleKey) is required in production"
        );
      }
      supabaseKey = supabaseConfig.supabaseAnonKey;
      logger.warn({ msg: "Using anon key for Supabase (bypasses RLS)." });
    }
    if (!supabaseUrl) {
      throw new Error("PUBLIC_SUPABASE_URL (or config.supabase.supabaseUrl) is required");
    }
    const supabaseClient = supabaseJs.createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    return supabaseClient;
  } catch (error) {
    logger.error({
      msg: "CRITICAL: Failed to initialize Supabase client",
      error: error instanceof Error ? error.message : String(error)
    });
    throw new Error(
      `Supabase client initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
var createSupabaseRLSClient = ({ req, res }) => {
  const cookies = {
    getAll() {
      return ssr.parseCookieHeader(req.headers.cookie ?? "").map(({ name, value }) => ({
        name,
        value: value ?? ""
      }));
    },
    setAll(cookiesToSet) {
      if (res.headersSent) return;
      cookiesToSet.forEach(({ name, value, options: options2 }) => {
        res.appendHeader("Set-Cookie", ssr.serializeCookieHeader(name, value, options2 ?? {}));
      });
    }
  };
  const options = { cookies };
  return ssr.createServerClient(
    supabaseConfig.supabaseUrl,
    supabaseConfig.supabaseAnonKey,
    options
  );
};

// connections/cache/index.ts
init_GlobalConfig();

// connections/cache/CacheService.ts
init_Logger();

// errors/CacheError.ts
var CacheError = class extends Error {
  statusCode;
  constructor(message = "Cache operation failed", options) {
    super(message);
    this.name = "CacheError";
    this.statusCode = options?.statusCode ?? 500;
    if (options?.cause) this.cause = options.cause;
  }
};
var CacheConnectionError = class extends CacheError {
  constructor(message = "Failed to connect to cache", options) {
    super(message, { ...options, statusCode: 503 });
    this.name = "CacheConnectionError";
  }
};
var CacheOperationError = class extends CacheError {
  constructor(message = "Cache operation failed", options) {
    super(message, { ...options, statusCode: 500 });
    this.name = "CacheOperationError";
  }
};

// connections/cache/CacheService.ts
var DEFAULT_TTL_SEC = 300;
var CacheService = class {
  provider;
  defaultTTL;
  logHits;
  logMisses;
  enabled;
  constructor(provider, options = {}) {
    if (!provider) {
      throw new CacheConnectionError("Cache provider is required");
    }
    this.provider = provider;
    this.defaultTTL = options.defaultTTL ?? DEFAULT_TTL_SEC;
    this.logHits = options.logHits ?? true;
    this.logMisses = options.logMisses ?? true;
    this.enabled = options.enabled ?? true;
  }
  async get(key) {
    if (!this.enabled) return null;
    if (!key) throw new CacheOperationError("Cache key is required");
    const raw = await this.provider.get(key);
    if (raw === null || raw === void 0) {
      if (this.logMisses) logger.debug({ msg: "[Cache] miss", key });
      return null;
    }
    if (this.logHits) logger.debug({ msg: "[Cache] hit", key });
    if (typeof raw === "string" && (raw.startsWith("{") || raw.startsWith("["))) {
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    }
    return raw;
  }
  async set(key, value, ttl) {
    if (!this.enabled) return false;
    if (!key) throw new CacheOperationError("Cache key is required");
    if (value === void 0 || value === null) {
      logger.debug({ msg: "[Cache] skip set null/undefined", key });
      return false;
    }
    const effectiveTTL = ttl ?? this.defaultTTL;
    const toStore = typeof value === "object" ? JSON.stringify(value) : value;
    await this.provider.set(key, toStore, effectiveTTL);
    logger.debug({ msg: "[Cache] set", key, ttl: effectiveTTL });
    return true;
  }
  async del(key) {
    if (!this.enabled) return false;
    try {
      const ok = await this.provider.del(key);
      if (ok) logger.debug({ msg: "[Cache] del", key });
      return ok;
    } catch (error) {
      logger.error({ msg: "[Cache] del error", key, error: String(error) });
      return false;
    }
  }
  async delPattern(pattern) {
    if (!this.enabled) return false;
    try {
      return await this.provider.delPattern(pattern);
    } catch (error) {
      logger.error({ msg: "[Cache] delPattern error", pattern, error: String(error) });
      return false;
    }
  }
  async flush() {
    if (!this.enabled) return false;
    await this.provider.flush();
    logger.debug({ msg: "[Cache] flush" });
    return true;
  }
  async getOrSet(key, factory, ttl) {
    if (!this.enabled) return factory();
    if (!key) throw new CacheOperationError("Cache key is required");
    if (typeof factory !== "function") throw new CacheOperationError("Factory must be a function");
    const cached = await this.get(key);
    if (cached !== null && cached !== void 0) {
      return cached;
    }
    const value = await factory();
    if (value !== null && value !== void 0) {
      await this.set(key, value, ttl ?? this.defaultTTL);
    }
    return value;
  }
};
var CacheService_default = CacheService;

// connections/cache/CacheInvalidationService.ts
init_Logger();
var CacheInvalidationService = class {
  cache;
  metrics;
  startTime;
  constructor(cacheService2) {
    if (!cacheService2) {
      throw new Error("Cache service is required for the Cache Invalidation Service");
    }
    this.cache = cacheService2;
    this.metrics = {
      invalidationsByEntityType: {},
      patternInvalidations: 0,
      keyInvalidations: 0,
      failedInvalidations: 0,
      lastInvalidation: null
    };
    this.startTime = Date.now();
  }
  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.startTime,
      totalInvalidations: this.metrics.patternInvalidations + this.metrics.keyInvalidations
    };
  }
  resetMetrics() {
    this.metrics = {
      invalidationsByEntityType: {},
      patternInvalidations: 0,
      keyInvalidations: 0,
      failedInvalidations: 0,
      lastInvalidation: this.metrics.lastInvalidation
    };
    logger.info({ msg: "Cache invalidation metrics have been reset" });
  }
  async invalidateKey(key) {
    try {
      await this.cache.del(key);
      this.metrics.keyInvalidations++;
      this.metrics.lastInvalidation = {
        type: "key",
        key,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      logger.debug({ msg: "Invalidated cache key", key });
      return true;
    } catch (error) {
      this.metrics.failedInvalidations++;
      logger.error({ msg: "Error invalidating cache key", key, error: String(error) });
      return false;
    }
  }
  async invalidatePattern(pattern) {
    try {
      await this.cache.delPattern(pattern);
      this.metrics.patternInvalidations++;
      this.metrics.lastInvalidation = {
        type: "pattern",
        pattern,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      logger.debug({ msg: "Invalidated cache keys matching pattern", pattern });
      return true;
    } catch (error) {
      this.metrics.failedInvalidations++;
      logger.error({ msg: "Error invalidating cache pattern", pattern, error: String(error) });
      return false;
    }
  }
  async invalidateEntity(entityType, entityId) {
    if (!entityType || !entityId) {
      logger.warn({
        msg: "Invalid entity type or ID provided for cache invalidation",
        entityType,
        entityId
      });
      return false;
    }
    try {
      await this.invalidateKey(`${entityType}:byId:${entityId}`);
      await this.invalidatePattern(`${entityType}:*:${entityId}:*`);
      await this.invalidatePattern(`${entityType}:*:*:${entityId}`);
      if (!this.metrics.invalidationsByEntityType[entityType]) {
        this.metrics.invalidationsByEntityType[entityType] = 0;
      }
      this.metrics.invalidationsByEntityType[entityType]++;
      logger.debug({ msg: "Invalidated entity", entityType, entityId });
      return true;
    } catch (error) {
      this.metrics.failedInvalidations++;
      logger.error({
        msg: "Error invalidating entity",
        entityType,
        entityId,
        error: String(error)
      });
      return false;
    }
  }
};
var CacheInvalidationService_default = CacheInvalidationService;

// connections/cache/MemoryCacheProvider.ts
init_Logger();
var MemoryCacheProvider = class {
  cache = /* @__PURE__ */ new Map();
  defaultTTL;
  enablePatterns;
  constructor(options = {}) {
    this.defaultTTL = options.ttl ?? 300;
    this.enablePatterns = options.enablePatterns ?? true;
    logger.info({
      msg: "[Cache] Memory cache provider initialized",
      defaultTTL: this.defaultTTL
    });
  }
  isExpired(entry) {
    return entry.expiry !== null && Date.now() > entry.expiry;
  }
  async get(key) {
    const entry = this.cache.get(key);
    if (entry === void 0) return null;
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }
  async set(key, value, ttl) {
    const ttlSec = ttl ?? this.defaultTTL;
    const expiry = ttlSec > 0 ? Date.now() + ttlSec * 1e3 : null;
    this.cache.set(key, { value, expiry });
    return true;
  }
  async delete(key) {
    return this.cache.delete(key);
  }
  async del(key) {
    return this.delete(key);
  }
  patternToRegex(pattern) {
    const escaped = pattern.split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*");
    return new RegExp(`^${escaped}$`);
  }
  async delPattern(pattern) {
    if (!this.enablePatterns) return false;
    const re = this.patternToRegex(pattern);
    let deleted = 0;
    for (const key of this.cache.keys()) {
      if (re.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    return deleted > 0;
  }
  async flush() {
    this.cache.clear();
    return true;
  }
};
var MemoryCacheProvider_default = MemoryCacheProvider;

// connections/cache/RedisCacheProvider.ts
init_Logger();
var RedisCacheProvider = class {
  options;
  client = null;
  isConnected = false;
  constructor(options = {}) {
    this.options = {
      host: options.host ?? "localhost",
      port: options.port ?? 6379,
      password: options.password,
      db: options.db ?? 0,
      prefix: options.prefix ?? "app:cache:",
      enableOfflineQueue: options.enableOfflineQueue !== false,
      useScan: options.useScan !== false,
      maxReconnectAttempts: options.maxReconnectAttempts ?? 10
    };
    this.connect();
  }
  async connect() {
    try {
      if (this.client) await this.disconnect();
      const clientOptions = {
        socket: {
          host: this.options.host,
          port: this.options.port,
          reconnectStrategy: (retries) => {
            if (retries > this.options.maxReconnectAttempts) {
              logger.error({
                msg: "Max Redis reconnect attempts reached",
                attempt: retries,
                maxReconnectAttempts: this.options.maxReconnectAttempts
              });
              return new Error("Max Redis reconnect attempts reached");
            }
            const delay = Math.min(
              Math.pow(2, retries) * 100 + Math.random() * 100,
              3e4
            );
            logger.warn({
              msg: "Redis reconnecting...",
              attempt: retries,
              delayMs: Math.round(delay)
            });
            return delay;
          }
        },
        password: this.options.password || void 0,
        database: this.options.db
      };
      this.client = redis.createClient(clientOptions);
      this.client.on("ready", () => {
        this.isConnected = true;
        logger.info({
          msg: "[Cache] Redis connection established",
          host: this.options.host,
          port: this.options.port,
          db: this.options.db
        });
      });
      this.client.on("error", (err) => {
        this.isConnected = false;
        logger.error({
          msg: "[Cache] Redis error",
          error: err.message,
          host: this.options.host,
          port: this.options.port
        });
      });
      this.client.on("end", () => {
        this.isConnected = false;
        logger.info({ msg: "[Cache] Redis connection closed" });
      });
      await this.client.connect();
      this.isConnected = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error({
        msg: "[Cache] Failed to connect to Redis",
        error: message,
        host: this.options.host,
        port: this.options.port
      });
      throw error;
    }
  }
  async disconnect() {
    if (this.client && this.isConnected) {
      try {
        await this.client.quit();
        this.isConnected = false;
        logger.info({ msg: "[Cache] Disconnected from Redis" });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error({ msg: "[Cache] Error disconnecting from Redis", error: message });
      }
    }
  }
  async get(key) {
    try {
      if (!this.isConnected || !this.client) {
        logger.warn({ msg: "[Cache] Redis not connected for get" });
        return null;
      }
      const prefixedKey = this.options.prefix + key;
      const value = await this.client.get(prefixedKey);
      return value;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error({ msg: `[Cache] Redis get error: ${key}`, error: message });
      return null;
    }
  }
  async set(key, value, ttl) {
    try {
      if (!this.isConnected || !this.client) {
        logger.warn({ msg: "[Cache] Redis not connected for set" });
        return false;
      }
      const prefixedKey = this.options.prefix + key;
      const str = typeof value === "string" ? value : JSON.stringify(value);
      if (ttl && ttl > 0) {
        await this.client.setEx(prefixedKey, ttl, str);
      } else {
        await this.client.set(prefixedKey, str);
      }
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error({ msg: `[Cache] Redis set error: ${key}`, error: message });
      return false;
    }
  }
  async del(key) {
    try {
      if (!this.isConnected || !this.client) return false;
      const prefixedKey = this.options.prefix + key;
      const result = await this.client.del(prefixedKey);
      return result > 0;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error({ msg: `[Cache] Redis del error: ${key}`, error: message });
      return false;
    }
  }
  async delete(key) {
    return this.del(key);
  }
  async scanForKeys(pattern) {
    if (!this.client) return [];
    const keys = [];
    let cursor = 0;
    const fullPattern = this.options.prefix + pattern;
    do {
      const result = await this.client.scan(String(cursor), { MATCH: fullPattern, COUNT: 1e3 });
      cursor = typeof result.cursor === "string" ? parseInt(result.cursor, 10) : result.cursor;
      if (result.keys?.length) {
        for (const k of result.keys) {
          if (k.startsWith(this.options.prefix)) {
            keys.push(k.slice(this.options.prefix.length));
          } else {
            keys.push(k);
          }
        }
      }
    } while (cursor !== 0);
    return keys;
  }
  async delPattern(pattern) {
    try {
      if (!this.isConnected || !this.client) return false;
      if (!this.options.useScan) return false;
      const keys = await this.scanForKeys(pattern);
      if (keys.length === 0) return false;
      const prefixedKeys = keys.map((k) => this.options.prefix + k);
      await this.client.del(prefixedKeys);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error({ msg: `[Cache] Redis delPattern error: ${pattern}`, error: message });
      return false;
    }
  }
  async flush() {
    try {
      if (!this.isConnected || !this.client) return false;
      if (this.options.prefix) {
        const keys = await this.scanForKeys("*");
        if (keys.length > 0) {
          const prefixedKeys = keys.map((k) => this.options.prefix + k);
          await this.client.del(prefixedKeys);
        }
        return true;
      }
      await this.client.flushDb();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error({ msg: "[Cache] Redis flush error", error: message });
      return false;
    }
  }
};
var RedisCacheProvider_default = RedisCacheProvider;

// connections/cache/index.ts
function createCacheProvider() {
  const cacheConfig2 = config.cache;
  const providerName = cacheConfig2?.provider ?? "memory";
  const defaultTTL = cacheConfig2?.defaultTTL ?? 300;
  const redisOpts = cacheConfig2?.redis;
  if (providerName === "redis" && redisOpts) {
    const redis = new RedisCacheProvider_default({
      host: redisOpts.host,
      port: redisOpts.port,
      password: redisOpts.password,
      db: redisOpts.db,
      prefix: redisOpts.prefix,
      maxReconnectAttempts: redisOpts.maxReconnectAttempts,
      enableOfflineQueue: redisOpts.enableOfflineQueue,
      useScan: redisOpts.useScan
    });
    return {
      get: (k) => redis.get(k),
      set: (k, v, ttl) => redis.set(k, v, ttl),
      del: (k) => redis.del(k),
      delPattern: (p) => redis.delPattern(p),
      flush: () => redis.flush()
    };
  }
  const memory = new MemoryCacheProvider_default({
    ttl: defaultTTL,
    checkPeriod: cacheConfig2?.checkPeriod ?? 60,
    enablePatterns: cacheConfig2?.enablePatterns ?? true
  });
  return {
    get: (k) => memory.get(k),
    set: (k, v, ttl) => memory.set(k, v, ttl),
    del: (k) => memory.del(k),
    delPattern: (p) => memory.delPattern(p),
    flush: () => memory.flush()
  };
}
var cacheConfig = config.cache;
var cacheService = new CacheService_default(createCacheProvider(), {
  defaultTTL: cacheConfig?.defaultTTL ?? 300,
  logHits: cacheConfig?.logHits ?? true,
  logMisses: cacheConfig?.logMisses ?? true,
  enabled: cacheConfig?.enabled ?? true
});
var cacheInvalidationService = new CacheInvalidationService_default(cacheService);

// connections/sentry/index.js
init_GlobalConfig();
var dsn = (config.sentry?.dsn ?? "").toString().trim();
var sentryEnabled = config.sentry?.enabled !== false;
if (dsn && sentryEnabled && !Sentry__namespace.isInitialized()) {
  let createLoggingTransport = function(transportOptions) {
    const base = Sentry__namespace.makeNodeTransport(transportOptions);
    return {
      send: async (envelope) => {
        try {
          const result = await base.send(envelope);
          console.log("[Sentry] Transport: event sent to Sentry", result?.statusCode ?? result);
          return result;
        } catch (err) {
          console.error("[Sentry] Transport: send failed", err?.message ?? err);
          throw err;
        }
      },
      flush: (timeout) => base.flush(timeout)
    };
  };
  Sentry__namespace.init({
    dsn,
    sendDefaultPii: true,
    enableLogs: true,
    environment: (config.server?.nodeEnv ?? "development").toString(),
    disableInstrumentationWarnings: true,
    debug: false,
    denyUrls: [],
    transport: createLoggingTransport,
    integrations: [Sentry__namespace.expressIntegration()],
    beforeSend(event, hint) {
      if (config.server?.nodeEnv === "development") {
        console.log("[Sentry] beforeSend:", event.message || hint.originalException?.message);
      }
      return event;
    }
  });
  console.log("[Sentry] Initialized in app context (DSN configured, SENTRY_ENABLED=true)");
} else if (dsn && !sentryEnabled) {
  console.log("[Sentry] DSN present but SENTRY_ENABLED=false; events will not be sent.");
}

// connections/index.ts
var supabaseServiceClientConnection = createSupabaseServiceClient();
var cacheServiceConnection = cacheService;
var cacheInvalidationServiceConnection = cacheInvalidationService;

// errors/AuthError.ts
var AuthError = class extends Error {
  statusCode;
  status;
  isOperational;
  metadata;
  cause;
  constructor(message, statusCode = 400, options = {}) {
    super(message);
    this.statusCode = statusCode;
    this.status = "fail";
    this.isOperational = true;
    this.metadata = { error: "auth", errorType: "AUTH_ERROR" };
    this.cause = options.cause ?? null;
    Error.captureStackTrace(this, this.constructor);
  }
};
var AuthValidationError = class extends AuthError {
  constructor(message = "Invalid auth data", options = {}) {
    super(message, 400, options);
    this.name = "AuthValidationError";
    this.metadata = { ...this.metadata, ...options.metadata };
  }
};
var InvalidCredentialsError = class extends AuthError {
  constructor(message = "Invalid credentials") {
    super(message, 401);
    this.name = "InvalidCredentialsError";
    this.metadata.errorType = "INVALID_CREDENTIALS_ERROR";
  }
};
var TokenError = class extends AuthError {
  isTokenExpired;
  constructor(message = "Invalid or missing token", isExpired = false) {
    super(message, 401);
    this.name = "TokenError";
    this.metadata.errorType = isExpired ? "TOKEN_EXPIRED_ERROR" : "TOKEN_ERROR";
    this.isTokenExpired = isExpired;
  }
};
var MissingUserIdError = class extends AuthError {
  constructor(message = "Missing user ID") {
    super(message, 401);
    this.name = "MissingUserIdError";
    this.metadata.errorType = "MISSING_USER_ID_ERROR";
  }
};
var NotVerifiedUserError = class extends AuthError {
  constructor(message = "User is not verified") {
    super(message, 403);
    this.name = "NotVerifiedUserError";
    this.metadata.errorType = "NOT_VERIFIED_USER_ERROR";
  }
};
var AuthNotFoundError = class extends AuthError {
  constructor(identifier = "", options = {}) {
    const message = identifier ? `Auth entity not found: ${identifier}` : "Auth entity not found";
    super(message, 404);
    this.metadata = { ...this.metadata, ...options.metadata };
    this.name = "AuthNotFoundError";
  }
};
var UserConflictError = class extends AuthError {
  constructor(message = "User already exists") {
    super(message, 409);
    this.name = "UserConflictError";
    this.metadata.errorType = "USER_CONFLICT_ERROR";
  }
};
var IncorrectUserIDError = class extends AuthError {
  constructor(message = "Incorrect user ID") {
    super(message, 422);
    this.name = "IncorrectUserIDError";
    this.metadata.errorType = "INCORRECT_USER_ID_ERROR";
  }
};
var PermissionError = class extends AuthError {
  constructor(requiredRoleOrPermission) {
    super(`Permission denied. Required: ${requiredRoleOrPermission}`, 403);
    this.name = "PermissionError";
    this.metadata.errorType = "PERMISSION_ERROR";
  }
};

// errors/InfraError.ts
var ValidationError = class extends Error {
  statusCode = 400;
  constructor(message, options) {
    super(message);
    this.name = "ValidationError";
    if (options?.cause) this.cause = options.cause;
  }
};
var InfraError = class extends Error {
  statusCode;
  component;
  operation;
  cause;
  constructor(message, options = {}) {
    super(message);
    this.name = "InfraError";
    this.statusCode = options.statusCode ?? 500;
    this.component = options.component ?? "infrastructure";
    this.operation = options.operation;
    this.cause = options.cause;
  }
};
var DatabaseError = class extends Error {
  statusCode;
  metadata;
  constructor(message, options = {}) {
    super(message);
    this.name = "DatabaseError";
    this.statusCode = options.statusCode ?? 500;
    this.metadata = {
      cause: options.cause,
      operation: options.operation,
      resource: options.resource,
      entityType: options.entityType,
      ...options.metadata
    };
  }
};
var DatabaseEntityNotFoundError = class extends DatabaseError {
  constructor(entityType, identifier, options) {
    super(`Entity not found: ${entityType}`, {
      statusCode: 404,
      entityType: options?.entityType ?? entityType,
      metadata: { identifier }
    });
    this.name = "DatabaseEntityNotFoundError";
  }
};

// emails/AbstractEmailTemplate.ts
var AbstractEmailTemplate = class {
};

// emails/VerifyEmailTemplate.ts
var VerifyEmailTemplate = class extends AbstractEmailTemplate {
  fullName;
  verificationLink;
  constructor(backendDomainUrl, fullName, email, token) {
    super();
    this.fullName = fullName;
    this.verificationLink = `${backendDomainUrl}/api/v1/auth/request-verify-signup?token=${token}&email=${encodeURIComponent(email)}`;
  }
  buildSubject() {
    return "Please verify your email address";
  }
  buildText() {
    return `
Hello ${this.fullName || "there"},

Please verify your email address by clicking the link below:

${this.verificationLink}

This link will expire in 24 hours.

If you did not create an account, please ignore this email.

Best regards,
The Team
`.trim();
  }
  buildHtml() {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email Address</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Please verify your email address</h1>
    <p>Hello <strong>${this.fullName || "there"}</strong>,</p>
    <p>Please verify your email address by clicking the link below:</p>
    <p style="margin: 20px 0;">
        <a href="${this.verificationLink}" style="display: inline-block; background-color: #3498db; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
    </p>
    <p style="color: #7f8c8d; font-size: 14px;">
        Or copy and paste this link into your browser:<br>
        <a href="${this.verificationLink}" style="color: #3498db; word-break: break-all;">${this.verificationLink}</a>
    </p>
    <p style="color: #e74c3c; font-weight: bold;">This link will expire in 24 hours.</p>
    <p style="color: #7f8c8d; font-size: 14px; margin-top: 30px;">
        If you did not create an account, please ignore this email.
    </p>
    <p style="margin-top: 30px;">
        Best regards,<br>
        <strong>The Team</strong>
    </p>
</body>
</html>
`.trim();
  }
};

// emails/WelcomeEmailTemplate.ts
var WelcomeEmailTemplate = class extends AbstractEmailTemplate {
  fullName;
  constructor(fullName) {
    super();
    this.fullName = fullName;
  }
  buildSubject() {
    return "Welcome to our platform!";
  }
  buildText() {
    return `
Hello ${this.fullName || "there"},

Thank you for verifying your email address. Your account is now fully activated.

You can now access all features of our platform.

Best regards,
The Team
`.trim();
  }
  buildHtml() {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2c3e50; border-bottom: 2px solid #27ae60; padding-bottom: 10px;">Welcome to our platform!</h1>
    <p>Hello <strong>${this.fullName || "there"}</strong>,</p>
    <p>Thank you for verifying your email address. Your account is now fully activated.</p>
    <p>You can now access all features of our platform.</p>
    <p style="margin-top: 30px;">
        Best regards,<br>
        <strong>The Team</strong>
    </p>
</body>
</html>
`.trim();
  }
};

// emails/ResetPasswordEmailTemplate.ts
var ResetPasswordEmailTemplate = class extends AbstractEmailTemplate {
  fullName;
  code;
  resetLink;
  constructor(frontendDomainUrl, fullName, email, code) {
    super();
    this.fullName = fullName;
    this.code = code;
    this.resetLink = `${frontendDomainUrl}/forgot-password?confirm=true&email=${encodeURIComponent(email)}&type=recovery`;
  }
  buildSubject() {
    return "Reset your password";
  }
  buildText() {
    return `
Hello ${this.fullName || "there"},

Your code is ${this.code}

Follow this link to reset your password using the code above:

${this.resetLink}

If you did not request a password reset, please ignore this email.

Best regards,
The Team
`.trim();
  }
  buildHtml() {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset your password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2c3e50; border-bottom: 2px solid #e67e22; padding-bottom: 10px;">Reset your password</h1>
    <p>Hello <strong>${this.fullName || "there"}</strong>,</p>
    <p>Your code is <strong style="font-size: 1.2em; letter-spacing: 0.1em;">${this.code}</strong></p>
    <p>Follow this link to reset your password using the code above:</p>
    <p style="margin: 20px 0;">
        <a href="${this.resetLink}" style="display: inline-block; background-color: #e67e22; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset password</a>
    </p>
    <p style="color: #7f8c8d; font-size: 14px;">
        Or copy and paste this link into your browser:<br>
        <a href="${this.resetLink}" style="color: #e67e22; word-break: break-all;">${this.resetLink}</a>
    </p>
    <p style="color: #7f8c8d; font-size: 14px; margin-top: 30px;">
        If you did not request a password reset, please ignore this email.
    </p>
    <p style="margin-top: 30px;">
        Best regards,<br>
        <strong>The Team</strong>
    </p>
</body>
</html>
`.trim();
  }
};

// controllers/AuthController.ts
init_GlobalConfig();
init_Logger();

// utils/helper.ts
function normalizeEmail(email) {
  if (email == null || typeof email !== "string") return "";
  return email.trim().toLowerCase();
}
function isValidUUID(value) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(value);
}

// utils/dtos/AuthUserDTO.ts
var AuthUserDTOMapper = class {
  /**
   * Map DB user + optional auth user to AuthUserDTO for API responses.
   * Use for sign-in and sign-up responses so the frontend receives a consistent user shape.
   */
  static toDTO(dbUser, authUser, options) {
    const id = dbUser?.id ?? authUser?.id ?? null;
    const email = dbUser?.email ?? authUser?.email ?? "";
    const fullName = dbUser?.full_name ?? authUser?.user_metadata?.full_name ?? email;
    const username = email;
    const isEmailVerified = dbUser?.is_email_verified != null ? Boolean(dbUser.is_email_verified) : false;
    const roles = options?.roles ?? [];
    return {
      id: id ?? null,
      email,
      fullName,
      username,
      isEmailVerified,
      roles: roles.length > 0 ? roles : void 0
    };
  }
};

// controllers/AuthController.ts
var serverConfig2 = config.server;
var AuthController = class {
  userRepository;
  authenticationService;
  emailService;
  oauthService;
  organizationService;
  /**
   * Get appropriate sameSite value for refresh token cookie.
   * - 'lax' for development or when frontend/backend are on same registrable domain
   * - 'none' when frontend/backend are on different domains (requires secure: true)
   */
  getSameSiteValue() {
    if (serverConfig2.nodeEnv !== "production") return "lax";
    try {
      const frontUrl = new URL(serverConfig2.frontendDomainUrl ?? "");
      const backUrl = new URL(serverConfig2.backendDomainUrl ?? "");
      const frontDomain = frontUrl.hostname.split(".").slice(-2).join(".");
      const backDomain = backUrl.hostname.split(".").slice(-2).join(".");
      return frontDomain === backDomain ? "lax" : "none";
    } catch {
      return "none";
    }
  }
  setRefreshTokenCookie(res, refreshToken) {
    const isProduction = serverConfig2.nodeEnv === "production";
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: this.getSameSiteValue(),
      maxAge: 7 * 24 * 60 * 60 * 1e3,
      //7 days
      path: "/"
    });
  }
  constructor(authenticationService2, userRepository2, emailService2, oauthService2, organizationService2) {
    this.authenticationService = authenticationService2;
    this.userRepository = userRepository2;
    this.emailService = emailService2;
    this.oauthService = oauthService2;
    this.organizationService = organizationService2;
  }
  signUp = async (req, res, next) => {
    try {
      const { email: rawEmail, password, fullName } = req.body;
      const email = normalizeEmail(rawEmail);
      const isEmailVerified = await this.userRepository.checkIfEmailVerified(email);
      if (isEmailVerified) {
        throw new UserConflictError("This email is already registered. Please sign in.");
      }
      const { newUser, session } = await this.authenticationService.signUp(
        email,
        password,
        fullName ?? email,
        { req, res }
      );
      if (session?.refresh_token && newUser?.id) {
        const clientInfo = {
          ipAddress: req.ip ?? req.socket?.remoteAddress,
          userAgent: req.headers["user-agent"]
        };
        try {
          await this.authenticationService.generateRefreshToken({
            userId: newUser.id,
            token: session.refresh_token,
            ipAddress: clientInfo.ipAddress,
            userAgent: clientInfo.userAgent
          });
        } catch (err) {
          logger.warn({
            msg: "Failed to store refresh token",
            userId: newUser.id,
            error: err.message
          });
        }
        this.setRefreshTokenCookie(res, session.refresh_token);
      }
      if (newUser?.id && email) {
        await this.userRepository.upsertUserFromAuth({
          id: newUser.id,
          authId: newUser.id,
          email: newUser.email ?? email,
          fullName: fullName ?? email
        });
      }
      if (newUser?.id) {
        const defaultOrg = await this.organizationService.createDefaultOrganizationForNewUser(newUser.id, {
          name: fullName ?? "My Organization"
        });
        if (!defaultOrg) {
          logger.warn({ msg: "Default organization creation failed at signup", userId: newUser.id });
        }
      }
      if (newUser?.id && newUser?.email) {
        try {
          const token = this.emailService.generateVerificationToken();
          const hashedToken = this.emailService.hashToken(token);
          const expiresAt = /* @__PURE__ */ new Date();
          expiresAt.setHours(expiresAt.getHours() + 24);
          const { updateError } = await this.userRepository.updateVerificationTokenByEmail(
            newUser.email ?? email,
            hashedToken,
            expiresAt
          );
          if (!updateError && this.emailService.isEnabled) {
            await this.emailService.send(
              new VerifyEmailTemplate(
                serverConfig2.backendDomainUrl ?? "",
                fullName ?? "User",
                email,
                token
              ),
              email
            );
            logger.info({ msg: "Verification email sent after signup", email });
          } else if (updateError) {
            logger.warn({ msg: "Failed to store verification token", email });
          }
        } catch (emailErr) {
          logger.warn({
            msg: "Failed to send verification email after signup",
            email,
            error: emailErr instanceof Error ? emailErr.message : String(emailErr)
          });
        }
      }
      const { userData: dbUser } = await this.userRepository.findFullUserByEmail(email);
      const userDto = AuthUserDTOMapper.toDTO(
        dbUser ?? null,
        newUser ? { id: newUser.id, email: newUser.email ?? email, user_metadata: { full_name: fullName ?? email } } : null,
        { roles: [] }
      );
      logger.info({ msg: "User signup successful", email });
      res.status(201).json({
        success: true,
        data: {
          user: userDto,
          session: session ? { accessToken: session.access_token, refreshToken: session.refresh_token } : void 0
        },
        message: "Sign up successful!!"
      });
    } catch (error) {
      next(error);
    }
  };
  signIn = async (req, res, next) => {
    try {
      const { email: rawEmail, password } = req.body;
      const email = normalizeEmail(rawEmail);
      const { signedInUser, userDBdata, session } = await this.authenticationService.signIn(
        email,
        password,
        { req, res }
      );
      const refreshToken = session.refresh_token;
      const clientInfo = {
        ipAddress: req.ip ?? req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"]
      };
      try {
        await this.authenticationService.generateRefreshToken({
          userId: signedInUser.id,
          token: refreshToken,
          ipAddress: clientInfo.ipAddress,
          userAgent: clientInfo.userAgent
        });
      } catch (err) {
        logger.warn({
          msg: "Failed to store refresh token",
          userId: signedInUser.id,
          error: err.message
        });
      }
      this.setRefreshTokenCookie(res, refreshToken);
      const userDto = AuthUserDTOMapper.toDTO(
        userDBdata,
        signedInUser,
        // Roles are empty here: sign-in does not run role-loading middleware. They are set by requireFullAuthWithRoles on subsequent authenticated requests.
        { roles: [] }
      );
      logger.info({ msg: "User authenticated successfully", email });
      res.status(200).json({
        success: true,
        data: {
          user: userDto,
          accessToken: session.access_token,
          refreshToken
        },
        message: "Sign in successful"
      });
    } catch (error) {
      next(error);
    }
  };
  signOut = async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.refreshToken ?? req.body?.refreshToken;
      if (refreshToken) {
        try {
          await this.authenticationService.revokeRefreshToken(refreshToken);
        } catch (err) {
          logger.warn({ msg: "Failed to revoke refresh token", error: err.message });
        }
      }
      res.clearCookie("refreshToken");
      await this.authenticationService.signOut({ req, res });
      logger.info({ msg: "User signed out" });
      res.status(200).json({ success: true, message: "Signed out successfully" });
    } catch (error) {
      next(error);
    }
  };
  refreshToken = async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.refreshToken ?? req.body?.refreshToken;
      if (!refreshToken) {
        throw new TokenError("Missing refresh token");
      }
      const clientInfo = {
        ipAddress: req.ip ?? req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"]
      };
      const data = await this.authenticationService.refreshToken(refreshToken, clientInfo);
      if (req.cookies?.refreshToken) {
        this.setRefreshTokenCookie(res, data.session.refresh_token);
      }
      logger.info({ msg: "Token refreshed successfully" });
      res.status(200).json({
        success: true,
        data: {
          accessToken: data.session.access_token,
          refreshToken: req.cookies?.refreshToken ? void 0 : data.session.refresh_token,
          expiresIn: 3600,
          tokenType: "Bearer"
        },
        message: "Token refreshed successfully"
      });
    } catch (error) {
      if (req.cookies?.refreshToken) res.clearCookie("refreshToken");
      if (error instanceof DatabaseEntityNotFoundError || error instanceof ValidationError) {
        logger.debug({ msg: "Refresh token invalid or not found", reason: error.message });
        res.status(401).json({
          success: false,
          message: "Session expired or invalid. Please sign in again.",
          error: { type: "Unauthorized", message: error.message }
        });
        return;
      }
      next(error);
    }
  };
  askPasswordReset = async (req, res, next) => {
    try {
      const email = normalizeEmail(req.body?.email);
      const frontendUrl = serverConfig2.frontendDomainUrl ?? "";
      const { token, error: genError } = await this.authenticationService.generateRecoveryLink(email, {
        redirectTo: `${frontendUrl}/forgot-password`
      });
      if (genError) {
        logger.warn({ msg: "Password reset request failed", email, error: genError.message });
      }
      if (token && this.emailService.isEnabled) {
        try {
          const { userData } = await this.userRepository.findFullUserByEmail(email);
          const fullName = userData?.full_name ?? "User";
          await this.emailService.send(
            new ResetPasswordEmailTemplate(frontendUrl, fullName, email, token),
            email
          );
          logger.info({ msg: "Password reset email sent", email });
        } catch (emailErr) {
          logger.warn({
            msg: "Failed to send password reset email",
            email,
            error: emailErr instanceof Error ? emailErr.message : String(emailErr)
          });
        }
      }
      res.status(200).json({
        success: true,
        message: "If an account exists for this email, you will receive password reset instructions."
      });
    } catch (error) {
      next(error);
    }
  };
  verifyReset = async (req, res, next) => {
    try {
      const { email: rawEmail, code, type } = req.query;
      const email = normalizeEmail(rawEmail);
      const { signedInUser, session } = await this.authenticationService.verifyOtp(
        email,
        code,
        type
      );
      res.status(200).json({
        success: true,
        data: {
          user: {
            email: signedInUser?.email,
            fullName: signedInUser?.user_metadata?.full_name ?? "User"
          },
          accessToken: session.access_token,
          refreshToken: session.refresh_token
        },
        message: "Code verified successfully"
      });
    } catch (error) {
      next(error);
    }
  };
  status = async (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Auth service is running",
      authenticated: false
    });
  };
  /**
   * Request verify signup: user clicks link in email (token + email in query).
   * Redirects to frontend verify-signup page with token and email, or to auth-error on failure.
   */
  requestSignupVerification = async (req, res, next) => {
    try {
      const { token, email: rawEmail } = req.query;
      const email = normalizeEmail(rawEmail);
      const hashedToken = this.emailService.hashToken(token);
      const { userData } = await this.userRepository.findUserByTokenHash(hashedToken);
      if (!userData || userData.length === 0) {
        if (email) {
          const { userData: userByEmail } = await this.userRepository.findFullUserByEmail(email);
          if (userByEmail?.is_email_verified) {
            res.redirect(`${serverConfig2.frontendDomainUrl ?? ""}/sign-up`);
            return;
          }
          throw new TokenError(
            "This verification link has expired. Please use the most recent verification email, or request a new one."
          );
        }
        throw new TokenError("Expired or invalid verification token");
      }
      const user = userData[0];
      if (!user) {
        throw new TokenError("Invalid or expired verification token");
      }
      if (!user.is_email_verified) {
        const frontendUrl = serverConfig2.frontendDomainUrl ?? "";
        res.redirect(`${frontendUrl}/verify-signup?token=${token}&email=${encodeURIComponent(email ?? user.email ?? "")}`);
        return;
      }
      res.redirect(`${serverConfig2.frontendDomainUrl ?? ""}/sign-up`);
    } catch (error) {
      const frontendUrl = serverConfig2.frontendDomainUrl ?? "";
      const message = error instanceof AuthError ? error.message : error instanceof Error ? error.message : "An error occurred. Please contact support.";
      res.redirect(`${frontendUrl}/auth-error?message=${encodeURIComponent(message)}`);
    }
  };
  /**
   * Check signup verification: validate token and email (e.g. before showing verify button), or check by email only whether the account is verified (e.g. for reactive sign-up page).
   * - With token + email: returns success when token is valid and not yet verified; returns success: false when already verified.
   * - With email only: returns success: true and verified: true/false for that email (for polling from sign-up page).
   */
  checkSignupVerification = async (req, res, next) => {
    try {
      const { token, email: rawEmail } = req.query;
      const email = rawEmail ? normalizeEmail(rawEmail) : void 0;
      if (email && !token) {
        const { userData: userData2 } = await this.userRepository.findFullUserByEmail(email);
        const verified = userData2?.is_email_verified === true;
        res.status(200).json({ success: true, verified });
        return;
      }
      if (!token || !email) {
        res.status(200).json({ success: false, message: "Missing token or email" });
        return;
      }
      const hashedToken = this.emailService.hashToken(token);
      const { userData } = await this.userRepository.findUserByTokenHash(hashedToken);
      if (!userData || userData.length === 0 || !userData[0]) {
        res.status(200).json({ success: false, message: "Token not found or expired" });
        return;
      }
      const user = userData[0];
      if (email && user.email?.toLowerCase() !== email) {
        res.status(200).json({ success: false, message: "Token does not belong to this email" });
        return;
      }
      if (user.is_email_verified) {
        res.status(200).json({ success: false, message: "User is already verified", verified: true });
        return;
      }
      res.status(200).json({ success: true, message: "Token is valid and not expired", verified: false });
    } catch (error) {
      next(error);
    }
  };
  /**
   * Send (resend) verification email for an email address.
   */
  sendVerificationEmail = async (req, res, next) => {
    try {
      const email = normalizeEmail(req.body?.email);
      const { userData } = await this.userRepository.findFullUserByEmail(email);
      if (!userData) {
        res.status(200).json({
          success: true,
          message: "If an account exists with this email, a verification link has been sent"
        });
        return;
      }
      if (userData.is_email_verified) {
        res.status(200).json({
          success: true,
          message: "If an account exists with this email, a verification link has been sent"
        });
        return;
      }
      const token = this.emailService.generateVerificationToken();
      const hashedToken = this.emailService.hashToken(token);
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      const { updateError } = await this.userRepository.updateVerificationToken(
        userData.id,
        hashedToken,
        expiresAt
      );
      if (!updateError && this.emailService.isEnabled) {
        await this.emailService.send(
          new VerifyEmailTemplate(
            serverConfig2.backendDomainUrl ?? "",
            userData.full_name ?? "User",
            userData.email ?? email,
            token
          ),
          userData.email ?? email
        );
        logger.info({ msg: "Verification email sent", email });
      }
      res.status(200).json({
        success: true,
        message: "If an account exists with this email, a verification link has been sent"
      });
    } catch (error) {
      next(error);
    }
  };
  /**
   * Verify signup: token in query, find user by hashed token, mark verified, clear token, send welcome email.
   */
  verifySignup = async (req, res, next) => {
    try {
      const token = req.query.token;
      if (!token) {
        res.status(400).json({ success: false, message: "Missing verification token" });
        return;
      }
      const hashedToken = this.emailService.hashToken(token);
      const { userData } = await this.userRepository.findUserByTokenHash(hashedToken);
      if (!userData || userData.length === 0) {
        res.status(400).json({ success: false, message: "Invalid or expired verification token" });
        return;
      }
      const user = userData[0];
      if (user.is_email_verified) {
        res.status(200).json({ success: true, message: "Email already verified" });
        return;
      }
      await this.userRepository.updateEmailVerification(user.id, true);
      await this.userRepository.updateVerificationToken(user.id, null, null);
      if (this.emailService.isEnabled && user.email) {
        try {
          await this.emailService.send(
            new WelcomeEmailTemplate(user.full_name ?? "User"),
            user.email
          );
          logger.info({ msg: "Welcome email sent after verification", email: user.email });
        } catch (emailErr) {
          logger.warn({
            msg: "Failed to send welcome email",
            email: user.email,
            error: emailErr instanceof Error ? emailErr.message : String(emailErr)
          });
        }
      }
      res.status(200).json({ success: true, message: "Email successfully verified" });
    } catch (error) {
      next(error);
    }
  };
  /**
   * GET /oauth/providers – return list of configured OAuth provider names for the frontend.
   */
  getOAuthProviders = async (_req, res, next) => {
    try {
      const { getConfiguredOAuthProviders: getConfiguredOAuthProviders2 } = await Promise.resolve().then(() => (init_providers(), providers_exports));
      const providers = getConfiguredOAuthProviders2();
      res.status(200).json({ success: true, data: { providers } });
    } catch (error) {
      next(error);
    }
  };
  /**
   * GET /oauth/:provider – return redirect URL for the given OAuth provider (sign-in/sign-up).
   */
  getOAuthRedirectUrl = async (req, res, next) => {
    try {
      const provider = req.params.provider?.toLowerCase();
      if (!provider || !["google", "github", "generic"].includes(provider)) {
        res.status(400).json({ success: false, message: "Invalid or missing provider" });
        return;
      }
      const url = this.oauthService.getRedirectUrl(provider, req.query.state);
      res.status(200).json({ success: true, data: { url } });
    } catch (error) {
      next(error);
    }
  };
  /**
   * GET /oauth/:provider/callback – OAuth callback: exchange code, find/create user, redirect to magic link.
   */
  getOAuthCallback = async (req, res, next) => {
    const frontendUrl = config.server.frontendDomainUrl ?? "";
    const authErrorUrl = (msg) => `${frontendUrl}/auth-error?message=${encodeURIComponent(msg)}`;
    try {
      const provider = req.params.provider?.toLowerCase();
      const code = req.query.code?.trim();
      if (!provider || !["google", "github", "generic"].includes(provider)) {
        res.redirect(authErrorUrl("Invalid provider"));
        return;
      }
      if (!code) {
        res.redirect(authErrorUrl("Missing code"));
        return;
      }
      const { redirectTo } = await this.oauthService.handleCallback(provider, code);
      res.redirect(redirectTo);
    } catch (error) {
      const message = error instanceof Error ? error.message : "OAuth failed";
      const statusCode = error && typeof error.statusCode === "number" ? error.statusCode : 500;
      if (res.headersSent) return next(error);
      res.redirect(authErrorUrl(`${message} (${statusCode})`));
    }
  };
};

// errors/AppError.ts
var AppError = class _AppError extends Error {
  statusCode;
  isOperational = true;
  metadata;
  cause;
  constructor(message, statusCode, options = {}) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.metadata = options.metadata ?? {};
    this.cause = options.cause ?? null;
    if (options.errorCode) {
      this.metadata.errorCode = options.errorCode;
    }
    Object.setPrototypeOf(this, _AppError.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }
};

// errors/UserError.ts
var UserError = class extends AppError {
  constructor(message, statusCode, options = {}) {
    super(message, statusCode, { ...options, errorCode: options.errorCode ?? "USER_ERROR" });
    this.name = "UserError";
  }
};
var UserNotFoundError = class extends UserError {
  constructor(identifier = "") {
    const message = identifier ? `User not found: ${identifier}` : "User not found";
    super(message, 404, { errorCode: "USER_NOT_FOUND", metadata: identifier ? { identifier } : {} });
    this.name = "UserNotFoundError";
  }
};
var UserAuthorizationError = class extends UserError {
  constructor(message = "Not authorized", requiredPermission = null) {
    super(message, 403, {
      errorCode: "FORBIDDEN",
      metadata: requiredPermission != null ? { requiredPermission } : {}
    });
    this.name = "UserAuthorizationError";
  }
};
var UserValidationError = class extends UserError {
  constructor(message = "Invalid request", validationErrors = null) {
    super(message, 400, {
      errorCode: "USER_VALIDATION_ERROR",
      metadata: { validationErrors }
    });
    this.name = "UserValidationError";
  }
};

// controllers/UserController.ts
init_Logger();

// emails/ChangePasswordEmailTemplate.ts
var ChangePasswordEmailTemplate = class extends AbstractEmailTemplate {
  changePasswordLink;
  constructor(frontendDomainUrl, token, email) {
    super();
    const base = frontendDomainUrl.replace(/\/$/, "");
    this.changePasswordLink = `${base}/confirm-change-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&type=recovery`;
  }
  buildSubject() {
    return "Change your Password";
  }
  buildText() {
    return `
Change your Password

We received a request to change your password. Click the link below to change your password.

${this.changePasswordLink}

If you didn't ask to change your password, you can ignore this email.

Visit our help center to learn more about our platform and to share your feedback.
`.trim();
  }
  buildHtml() {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Change your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff;">
    <h1 style="font-size: 1.75rem; font-weight: bold; color: #111; margin: 0 0 24px 0;">Change your Password</h1>
    <p style="margin: 0 0 20px; color: #111;">
        We received a request to change your password. Click the button below to change your password. If you didn't ask to change your password, you can ignore this email.
    </p>
    <p style="margin: 24px 0;">
        <a href="${this.changePasswordLink}" style="display: inline-block; background-color: #111; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Change password \u2192</a>
    </p>
    <p style="margin-top: 32px; font-size: 14px; color: #666;">
        Visit our <a href="#" style="color: #111; text-decoration: underline;">help center</a> to learn more about our platform and to share your feedback.
    </p>
</body>
</html>
`.trim();
  }
};

// controllers/UserController.ts
init_GlobalConfig();

// utils/dtos/UserDTO.ts
function pickProfileFields(row) {
  if (!row?.user_profiles) {
    return { avatarUrl: null, websiteUrl: null };
  }
  const raw = row.user_profiles;
  const p = Array.isArray(raw) ? raw[0] : raw;
  if (!p || typeof p !== "object") {
    return { avatarUrl: null, websiteUrl: null };
  }
  return {
    avatarUrl: p.avatar_url ?? null,
    websiteUrl: p.website_url ?? null
  };
}
function toUserDTO(row) {
  if (!row) return null;
  const { avatarUrl, websiteUrl } = pickProfileFields(row);
  return {
    id: row.id,
    email: row.email ?? null,
    fullName: row.full_name ?? null,
    isEmailVerified: row.is_email_verified === true,
    avatarUrl,
    websiteUrl
  };
}

// controllers/UserController.ts
var serverConfig3 = config.server;
var UserController = class {
  constructor(userService2, authenticationService2, emailService2) {
    this.userService = userService2;
    this.authenticationService = authenticationService2;
    this.emailService = emailService2;
  }
  /**
   * GET /users/me - return the authenticated user's profile.
   */
  getProfile = async (req, res, next) => {
    try {
      const authReq = req;
      const authUserId = authReq.user?.id;
      if (!authUserId) {
        return next(new UserAuthorizationError("Not authenticated"));
      }
      const profile = await this.userService.getProfile(authUserId);
      if (!profile) {
        return next(new UserNotFoundError(authUserId));
      }
      const dto = toUserDTO(profile);
      res.status(200).json({
        success: true,
        data: {
          ...dto,
          roles: authReq.user?.roles ?? [],
          isSuperAdmin: authReq.user?.isSuperAdmin ?? false
        }
      });
    } catch (error) {
      next(error);
    }
  };
  /**
   * PATCH /users/me - update the authenticated user's profile (e.g. fullName).
   */
  updateProfile = async (req, res, next) => {
    try {
      const authReq = req;
      const authUserId = authReq.user?.id;
      if (!authUserId) {
        return next(new UserAuthorizationError("Not authenticated"));
      }
      const { fullName, avatarUrl, websiteUrl } = req.body;
      await this.userService.updateProfile(authUserId, { fullName, avatarUrl, websiteUrl });
      logger.info({ msg: "Profile updated successfully", userId: authUserId });
      res.status(200).json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
      next(error);
    }
  };
  /**
   * PUT /users/me/password - update password for the authenticated user (no userId in URL).
   */
  updatePasswordMe = async (req, res, next) => {
    try {
      const authReq = req;
      const authUserId = authReq.user?.id;
      const { password } = req.body;
      if (!authUserId) {
        return next(new UserAuthorizationError("Not authenticated"));
      }
      const { error } = await this.authenticationService.updatePassword(password ?? "", {
        req: authReq,
        res
      });
      if (error) {
        if (error.code === "same_password") {
          return next(new ValidationError("You cannot use the same password as before."));
        }
        return next(
          new InfraError("Failed to update password", {
            cause: error,
            component: "supabase",
            operation: "updateUser"
          })
        );
      }
      logger.info({ msg: "Password updated successfully", userId: authUserId });
      res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      next(error);
    }
  };
  /**
   * POST /users/me/request-change-password - send "change your password" email to the authenticated user.
   * Link in email points to the protected frontend route where they can set a new password.
   */
  requestChangePasswordEmail = async (req, res, next) => {
    try {
      const authReq = req;
      const authUserId = authReq.user?.id;
      if (!authUserId) {
        return next(new UserAuthorizationError("Not authenticated"));
      }
      const profile = await this.userService.getProfile(authUserId);
      if (!profile?.email) {
        return next(new UserNotFoundError(authUserId));
      }
      const frontendUrl = serverConfig3.frontendDomainUrl ?? "";
      const { token, error: genError } = await this.authenticationService.generateRecoveryLink(
        profile.email,
        { redirectTo: `${frontendUrl}/account/settings/password` }
      );
      if (genError || !token) {
        logger.warn({
          msg: "Change password: failed to generate recovery link",
          userId: authUserId,
          error: genError?.message
        });
        return next(
          new InfraError("Failed to generate secure link. Please try again later.", {
            cause: genError,
            component: "auth",
            operation: "generateRecoveryLink"
          })
        );
      }
      if (this.emailService.isEnabled) {
        try {
          await this.emailService.send(
            new ChangePasswordEmailTemplate(frontendUrl, token, profile.email),
            profile.email
          );
          logger.info({ msg: "Change password email sent", userId: authUserId, email: profile.email });
        } catch (emailErr) {
          logger.warn({
            msg: "Failed to send change password email",
            userId: authUserId,
            error: emailErr instanceof Error ? emailErr.message : String(emailErr)
          });
          return next(
            new InfraError("Failed to send email. Please try again later.", {
              cause: emailErr,
              component: "email",
              operation: "send"
            })
          );
        }
      }
      res.status(200).json({
        success: true,
        message: "If an account exists for this email, you will receive a link to change your password."
      });
    } catch (error) {
      next(error);
    }
  };
  /**
   * GET /admin/users - full users with roles (super-admin only).
   */
  getFullUsersWithRoles = async (_req, res, next) => {
    try {
      const users = await this.userService.getFullUsersWithRoles();
      res.status(200).json({
        success: true,
        data: { users },
        message: "Full users with roles retrieved successfully"
      });
    } catch (error) {
      next(error);
    }
  };
};

// controllers/CompanyController.ts
var CompanyController = class {
  constructor(companyService2, marketingService2) {
    this.companyService = companyService2;
    this.marketingService = marketingService2;
  }
  getInformationByProperties = async (req, res, _next) => {
    const properties = req.parsedQuery?.properties ?? [];
    const companyInformation = Array.isArray(properties) && properties.length > 0 ? await this.companyService.getCompanyInformationByProperties(properties) : {};
    res.status(200).json({
      success: true,
      data: companyInformation,
      message: "Company information by properties fetched successfully"
    });
  };
  getAllInformation = async (_req, res, _next) => {
    const companyInformation = await this.companyService.getAllCompanyInformation();
    res.status(200).json({
      success: true,
      data: companyInformation,
      message: "All Company information fetched successfully"
    });
  };
  getInformationByPropertiesCombined = async (req, res, _next) => {
    const companyProperties = req.parsedQuery?.companyProperties ?? [];
    const marketingProperties = req.parsedQuery?.marketingProperties ?? [];
    const [companyInformation, marketingInformation] = await Promise.all([
      Array.isArray(companyProperties) && companyProperties.length > 0 ? this.companyService.getCompanyInformationByProperties(companyProperties) : Promise.resolve({}),
      Array.isArray(marketingProperties) && marketingProperties.length > 0 ? this.marketingService.getMarketingInformationByProperties(marketingProperties) : Promise.resolve({})
    ]);
    res.status(200).json({
      success: true,
      data: {
        companyInformation,
        marketingInformation
      },
      message: "Company and marketing information by properties fetched successfully"
    });
  };
  getAllInformationCombined = async (_req, res, _next) => {
    const [companyInformation, marketingInformation] = await Promise.all([
      this.companyService.getAllCompanyInformation(),
      this.marketingService.getMarketingInformation()
    ]);
    res.status(200).json({
      success: true,
      data: {
        companyInformation,
        marketingInformation
      },
      message: "Company and marketing information fetched successfully"
    });
  };
};

// errors/OrganizationError.ts
var OrganizationError = class extends AppError {
  constructor(message, statusCode, options = {}) {
    super(message, statusCode, { ...options, errorCode: options.errorCode ?? "ORGANIZATION_ERROR" });
    this.name = "OrganizationError";
  }
};
var OrganizationNotFoundError = class extends OrganizationError {
  constructor(identifier = "") {
    const message = identifier ? `Organization not found: ${identifier}` : "Organization not found";
    super(message, 404, { errorCode: "ORGANIZATION_NOT_FOUND", metadata: identifier ? { identifier } : {} });
    this.name = "OrganizationNotFoundError";
  }
};
var OrganizationForbiddenError = class extends OrganizationError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, 403, { errorCode: "ORGANIZATION_FORBIDDEN" });
    this.name = "OrganizationForbiddenError";
  }
};

// utils/dtos/OrganizationDTO.ts
function toPendingInviteDTO(row) {
  return {
    id: row.id,
    organizationId: row.organization_id,
    organizationName: row.organization_name,
    workspaceRole: row.role,
    expiresAt: row.expires_at
  };
}
function toOrganizationDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    apiKey: row.api_key ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
function toOrganizationWithRoleDTO(org, membership, memberCount) {
  const dto = toOrganizationDTO(org);
  return {
    ...dto,
    workspaceRole: membership.role,
    disabled: membership.disabled,
    memberCount
  };
}
function toOrganizationMemberDTO(uo, user) {
  return {
    id: uo.id,
    userId: uo.user_id,
    organizationId: uo.organization_id,
    workspaceRole: uo.role,
    disabled: uo.disabled,
    email: user?.email ?? null,
    fullName: user?.full_name ?? null,
    createdAt: uo.created_at,
    updatedAt: uo.updated_at
  };
}

// controllers/SettingsController.ts
var SettingsController = class {
  constructor(organizationService2) {
    this.organizationService = organizationService2;
  }
  /** GET /settings — list organizations for the authenticated user. */
  listMine = async (req, res, next) => {
    try {
      const authReq = req;
      const authUserId = authReq.user?.id;
      if (!authUserId) {
        return next(new UserAuthorizationError("Not authenticated"));
      }
      const list = await this.organizationService.listMyOrganizations(authUserId);
      const membershipByOrg = new Map(list.memberships.map((m) => [m.organizationId, m]));
      const data = list.organizations.map(
        (org) => toOrganizationWithRoleDTO(
          org,
          membershipByOrg.get(org.id) ?? { role: "user", disabled: false },
          list.memberCounts[org.id] ?? 0
        )
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
  /** GET /settings/:id — get one organization (must be member). */
  getById = async (req, res, next) => {
    try {
      const authReq = req;
      const authUserId = authReq.user?.id;
      if (!authUserId) {
        return next(new UserAuthorizationError("Not authenticated"));
      }
      const organizationId = req.params.id;
      const result = await this.organizationService.getOrganizationById(authUserId, organizationId);
      if (!result) {
        return next(new OrganizationNotFoundError(organizationId));
      }
      const org = toOrganizationWithRoleDTO(
        result.organization,
        result.membership,
        result.memberCount
      );
      res.status(200).json({ success: true, data: org });
    } catch (error) {
      next(error);
    }
  };
  /** POST /settings — create organization and add current user as superadmin. */
  create = async (req, res, next) => {
    try {
      const authReq = req;
      const authUserId = authReq.user?.id;
      if (!authUserId) {
        return next(new UserAuthorizationError("Not authenticated"));
      }
      const { name, description } = req.body;
      const row = await this.organizationService.createOrganization(authUserId, {
        name,
        description: description ?? null
      });
      const org = toOrganizationDTO(row);
      res.status(201).json({ success: true, data: org });
    } catch (error) {
      next(error);
    }
  };
  /** PATCH /settings/:id — update organization (admin/superadmin only). */
  update = async (req, res, next) => {
    try {
      const authReq = req;
      const authUserId = authReq.user?.id;
      if (!authUserId) {
        return next(new UserAuthorizationError("Not authenticated"));
      }
      const organizationId = req.params.id;
      const { name, description } = req.body;
      const row = await this.organizationService.updateOrganization(authUserId, organizationId, {
        name,
        description
      });
      const org = toOrganizationDTO(row);
      res.status(200).json({ success: true, data: org });
    } catch (error) {
      next(error);
    }
  };
  /** GET /settings/:id/team — get team members. */
  getTeam = async (req, res, next) => {
    try {
      const authReq = req;
      const authUserId = authReq.user?.id;
      if (!authUserId) {
        return next(new UserAuthorizationError("Not authenticated"));
      }
      const organizationId = req.params.id;
      const rows = await this.organizationService.getTeam(authUserId, organizationId);
      const members = rows.map((m) => toOrganizationMemberDTO(m, { email: m.email, full_name: m.full_name }));
      res.status(200).json({ success: true, data: members });
    } catch (error) {
      next(error);
    }
  };
  /** POST /settings/:id/team — add team member (admin/superadmin only). */
  addTeamMember = async (req, res, next) => {
    try {
      const authReq = req;
      const authUserId = authReq.user?.id;
      if (!authUserId) {
        return next(new UserAuthorizationError("Not authenticated"));
      }
      const organizationId = req.params.id;
      const { userId, workspaceRole } = req.body;
      const row = await this.organizationService.addTeamMember(authUserId, organizationId, {
        userId,
        workspaceRole
      });
      const member = toOrganizationMemberDTO(row, { email: row.email, full_name: row.full_name });
      res.status(201).json({ success: true, data: member });
    } catch (error) {
      next(error);
    }
  };
  /** DELETE /settings/:id/team/:userId — remove team member. */
  removeTeamMember = async (req, res, next) => {
    try {
      const authReq = req;
      const authUserId = authReq.user?.id;
      if (!authUserId) {
        return next(new UserAuthorizationError("Not authenticated"));
      }
      const { id: organizationId, userId: targetUserId } = req.params;
      await this.organizationService.removeTeamMember(authUserId, organizationId, targetUserId);
      res.status(200).json({ success: true, message: "Member removed" });
    } catch (error) {
      next(error);
    }
  };
  /** DELETE /settings/:id — delete organization (superadmin only). */
  deleteById = async (req, res, next) => {
    try {
      const authReq = req;
      const authUserId = authReq.user?.id;
      if (!authUserId) {
        return next(new UserAuthorizationError("Not authenticated"));
      }
      const organizationId = req.params.id;
      await this.organizationService.deleteOrganization(authUserId, organizationId);
      res.status(200).json({ success: true, message: "Organization deleted" });
    } catch (error) {
      next(error);
    }
  };
  /** POST /settings/:id/rotate-api-key — rotate API key (admin/superadmin only). */
  rotateApiKey = async (req, res, next) => {
    try {
      const authReq = req;
      const authUserId = authReq.user?.id;
      if (!authUserId) {
        return next(new UserAuthorizationError("Not authenticated"));
      }
      const organizationId = req.params.id;
      const row = await this.organizationService.rotateApiKey(authUserId, organizationId);
      const org = toOrganizationDTO(row);
      res.status(200).json({ success: true, data: org });
    } catch (error) {
      next(error);
    }
  };
  /** POST /settings/:id/invite — invite team member by email (admin/superadmin only). */
  inviteTeamMember = async (req, res, next) => {
    try {
      const authReq = req;
      const authUserId = authReq.user?.id;
      if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
      const organizationId = req.params.id;
      const { email, workspaceRole, sendEmail } = req.body;
      const result = await this.organizationService.inviteTeamMemberByEmail(authUserId, organizationId, {
        email,
        workspaceRole,
        sendEmail
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
  /** POST /settings/join — accept invite token and add current user to the organization. */
  joinByToken = async (req, res, next) => {
    try {
      const authReq = req;
      const authUserId = authReq.user?.id;
      if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
      const { token } = req.body;
      const result = await this.organizationService.joinOrganizationByToken(authUserId, token);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
  /** GET /settings/invite/validate — validate invite token (returns org name and workspaceRole). */
  validateInviteToken = async (req, res, next) => {
    try {
      const token = req.query.token;
      if (!token) return res.status(200).json({ success: true, data: null });
      const data = await this.organizationService.validateInviteToken(token);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
  /** GET /settings/invites/pending — list pending workspace invites for the current user. */
  listPendingInvites = async (req, res, next) => {
    try {
      const authReq = req;
      const authUserId = authReq.user?.id;
      if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
      const list = await this.organizationService.listPendingInvitesForUser(authUserId);
      const data = list.map(toPendingInviteDTO);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
  /** POST /settings/invites/:id/accept — accept a pending invite by id. */
  acceptPendingInvite = async (req, res, next) => {
    try {
      const authReq = req;
      const authUserId = authReq.user?.id;
      if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
      const inviteId = req.params.id;
      const result = await this.organizationService.acceptPendingInvite(authUserId, inviteId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
};

// data/types/rbacTypes.ts
var VALID_PERMISSIONS = ["users.manage_roles"];
var VALID_ROLES = ["editor", "support", "admin"];

// errors/RoleError.ts
var RoleValidationError = class extends AppError {
  constructor(message, options = {}) {
    super(message, 400, { ...options, errorCode: "ROLE_VALIDATION" });
    this.name = "RoleValidationError";
  }
};

// services/RbacService.ts
init_Logger();
var CACHE_KEYS = {
  RBAC_USER_ROLES: "rbac:user:roles",
  RBAC_PERMISSIONS_FOR_ROLE: "rbac:role:permissions",
  RBAC_ALL_ROLE_PERMISSIONS: "rbac:role-permissions:all",
  USER_LIST_FULL_WITH_ROLES: "user:list:full:with_roles"
};
var RBAC_CACHE_TTL_SEC = 300;
var RbacService = class _RbacService {
  constructor(rbacRepository2, cache, cacheInvalidator) {
    this.rbacRepository = rbacRepository2;
    this.cache = cache;
    this.cacheInvalidator = cacheInvalidator;
  }
  async assignRoleByAdmin(userId, role, assignedBy) {
    if (role === "admin") {
      throw new RoleValidationError(
        "Admins cannot assign the admin role. Only super admins can assign admin roles."
      );
    }
    const result = await this.rbacRepository.assignRole(userId, role, assignedBy);
    if (result.roleId) {
      await this._invalidateRbacRelatedCaches();
    }
    return result;
  }
  async assignRoleBySuperAdmin(userId, role, assignedBy) {
    const result = await this.rbacRepository.assignRole(userId, role, assignedBy);
    if (result.roleId) {
      await this._invalidateRbacRelatedCaches();
    }
    return result;
  }
  async removeRole(userId, role, removedBy) {
    if (role === "admin") {
      const isSuperAdmin = await this.rbacRepository.isSuperAdmin(removedBy);
      if (!isSuperAdmin) {
        throw new RoleValidationError(
          "Admins cannot remove the admin role. Only super admins can remove admin roles."
        );
      }
    }
    const result = await this.rbacRepository.removeRole(userId, role, removedBy);
    if (result) {
      await this._invalidateRbacRelatedCaches();
    }
    return result;
  }
  async getUserRoles(userId) {
    const cacheKey = `${CACHE_KEYS.RBAC_USER_ROLES}:${userId}`;
    const factory = () => this.rbacRepository.getUserRoles(userId);
    if (this.cache) {
      return this.cache.getOrSet(cacheKey, factory, RBAC_CACHE_TTL_SEC);
    }
    return factory();
  }
  async getUsersByRole(role) {
    return this.rbacRepository.getUsersByRole(role);
  }
  async getPermissionsForRole(role) {
    const validated = _RbacService.validateRole(role);
    const cacheKey = `${CACHE_KEYS.RBAC_PERMISSIONS_FOR_ROLE}:${validated}`;
    const factory = () => this.rbacRepository.getPermissionsForRole(validated);
    if (this.cache) {
      return this.cache.getOrSet(cacheKey, factory, RBAC_CACHE_TTL_SEC);
    }
    return factory();
  }
  async getAllRolePermissions() {
    const cacheKey = CACHE_KEYS.RBAC_ALL_ROLE_PERMISSIONS;
    const factory = () => this.rbacRepository.getRolePermissions();
    if (this.cache) {
      return this.cache.getOrSet(cacheKey, factory, RBAC_CACHE_TTL_SEC);
    }
    return factory();
  }
  async assignPermissionToRole(role, permission) {
    const validatedRole = _RbacService.validateRole(role);
    const validatedPermission = _RbacService.validatePermission(permission);
    const result = await this.rbacRepository.assignPermissionToRole(validatedRole, validatedPermission);
    if (result?.id) {
      await this._invalidateRbacRelatedCaches();
    }
    return { id: result?.id ?? null };
  }
  async removePermissionFromRole(role, permission) {
    const validatedRole = _RbacService.validateRole(role);
    const validatedPermission = _RbacService.validatePermission(permission);
    await this.rbacRepository.removePermissionFromRole(validatedRole, validatedPermission);
    await this._invalidateRbacRelatedCaches();
  }
  /** Check if the given user (public.users.id) is a super admin. */
  async isSuperAdmin(publicUserId) {
    return this.rbacRepository.isSuperAdmin(publicUserId);
  }
  /**
   * Invalidate caches used by getUserRoles, getPermissionsForRole, getAllRolePermissions,
   * and UserService.getFullUsersWithRoles (USER_LIST_FULL_WITH_ROLES). Same keys as read.
   */
  async _invalidateRbacRelatedCaches() {
    if (!this.cacheInvalidator) return;
    try {
      await this.cacheInvalidator.invalidateKey(CACHE_KEYS.USER_LIST_FULL_WITH_ROLES);
      await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.RBAC_USER_ROLES}:*`);
      await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.RBAC_PERMISSIONS_FOR_ROLE}:*`);
      await this.cacheInvalidator.invalidateKey(CACHE_KEYS.RBAC_ALL_ROLE_PERMISSIONS);
      logger.debug({ msg: "Invalidated RBAC related caches" });
    } catch (error) {
      logger.error({ msg: "Error invalidating RBAC related caches", error: String(error) });
    }
  }
  static isAppRole(role) {
    return VALID_ROLES.includes(role);
  }
  static validateRole(role) {
    if (!_RbacService.isAppRole(role)) {
      throw new RoleValidationError(
        `Invalid role "${role}". Must be one of: ${VALID_ROLES.join(", ")}`
      );
    }
    return role;
  }
  static isAppPermission(permission) {
    return VALID_PERMISSIONS.includes(permission);
  }
  static validatePermission(permission) {
    if (!_RbacService.isAppPermission(permission)) {
      throw new RoleValidationError(
        `Invalid permission "${permission}". Must be one of: ${VALID_PERMISSIONS.join(", ")}`
      );
    }
    return permission;
  }
};

// controllers/RbacController.ts
var RbacController = class {
  constructor(rbacService2, userRepository2) {
    this.rbacService = rbacService2;
    this.userRepository = userRepository2;
  }
  async getPublicUserIdFromAuth(authUserId) {
    const { userId, error } = await this.userRepository.findUserIdByAuthId(authUserId);
    if (error || !userId) {
      throw new UserAuthorizationError("User profile not found");
    }
    return userId;
  }
  assignRole = async (req, res, next) => {
    try {
      const authUserId = req.user?.id;
      if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
      const { userId, role } = req.params;
      if (!userId) return next(new UserAuthorizationError("Missing user ID"));
      if (!role) return next(new RoleValidationError("Missing role"));
      const assignedBy = await this.getPublicUserIdFromAuth(authUserId);
      const validatedRole = RbacService.validateRole(role.trim());
      const isSuperAdmin = await this.rbacService.isSuperAdmin(assignedBy);
      const result = isSuperAdmin ? await this.rbacService.assignRoleBySuperAdmin(userId, validatedRole, assignedBy) : await this.rbacService.assignRoleByAdmin(userId, validatedRole, assignedBy);
      res.status(200).json({
        success: true,
        message: `Role '${validatedRole}' assigned successfully`,
        data: result
      });
    } catch (err) {
      next(err);
    }
  };
  removeRole = async (req, res, next) => {
    try {
      const authUserId = req.user?.id;
      if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
      const { userId, role } = req.params;
      if (!userId) return next(new UserAuthorizationError("Missing user ID"));
      if (!role) return next(new RoleValidationError("Missing role"));
      const removedBy = await this.getPublicUserIdFromAuth(authUserId);
      const validatedRole = RbacService.validateRole(role.trim());
      await this.rbacService.removeRole(userId, validatedRole, removedBy);
      res.status(200).json({
        success: true,
        message: `Role '${validatedRole}' removed successfully`
      });
    } catch (err) {
      next(err);
    }
  };
  getUserRoles = async (req, res, next) => {
    try {
      const { userId } = req.params;
      if (!userId) return next(new UserAuthorizationError("Missing user ID"));
      const result = await this.rbacService.getUserRoles(userId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
  getUsersByRole = async (req, res, next) => {
    try {
      const { role } = req.params;
      const validatedRole = RbacService.validateRole(role?.trim());
      const result = await this.rbacService.getUsersByRole(validatedRole);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
  getPermissionsForRole = async (req, res, next) => {
    try {
      const { role } = req.params;
      const validatedRole = RbacService.validateRole(role?.trim());
      const result = await this.rbacService.getPermissionsForRole(validatedRole);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
  getAllRolePermissions = async (_req, res, next) => {
    try {
      const result = await this.rbacService.getAllRolePermissions();
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
  assignPermissionToRole = async (req, res, next) => {
    try {
      const { role, permission } = req.params;
      const validatedRole = RbacService.validateRole(role?.trim());
      const validatedPermission = RbacService.validatePermission(permission?.trim());
      const result = await this.rbacService.assignPermissionToRole(validatedRole, validatedPermission);
      res.status(200).json({
        success: true,
        message: "Permission assigned to role",
        data: result
      });
    } catch (err) {
      next(err);
    }
  };
  removePermissionFromRole = async (req, res, next) => {
    try {
      const { role, permission } = req.params;
      const validatedRole = RbacService.validateRole(role?.trim());
      const validatedPermission = RbacService.validatePermission(permission?.trim());
      await this.rbacService.removePermissionFromRole(validatedRole, validatedPermission);
      res.status(200).json({
        success: true,
        message: "Permission removed from role"
      });
    } catch (err) {
      next(err);
    }
  };
};

// utils/dtos/FeedbackDTO.ts
function toFeedbackDTO(row) {
  return {
    id: row.id,
    feedbackType: row.feedback_type ?? "",
    url: row.url ?? "",
    description: row.description ?? "",
    email: row.email ?? null,
    isHandled: row.is_handled ?? false,
    createdAt: row.created_at ?? ""
  };
}
function toFeedbackDTOCollection(rows) {
  return (rows ?? []).map(toFeedbackDTO);
}

// controllers/FeedbackController.ts
var FeedbackController = class {
  constructor(feedbackService2) {
    this.feedbackService = feedbackService2;
  }
  createFeedback = async (req, res, next) => {
    try {
      const body = req.body;
      const id = await this.feedbackService.createFeedback(body);
      res.status(201).json({
        success: true,
        data: { id },
        message: "Feedback created successfully"
      });
    } catch (err) {
      next(err);
    }
  };
  handleFeedback = async (req, res, next) => {
    try {
      const { feedbackId } = req.params;
      const isHandled = req.body.is_handled;
      if (!feedbackId || isHandled === void 0) {
        throw new ValidationError(
          "Invalid request. Feedback ID and is_handled are required."
        );
      }
      const id = await this.feedbackService.updateFeedbackIsHandled(feedbackId, isHandled);
      res.status(200).json({
        success: true,
        data: { id },
        message: "Feedback handled successfully"
      });
    } catch (err) {
      next(err);
    }
  };
  getAllFeedbacks = async (_req, res, next) => {
    try {
      const rows = await this.feedbackService.getAllFeedbacks();
      const dtos = toFeedbackDTOCollection(rows);
      res.status(200).json({
        success: true,
        data: dtos,
        message: "Feedback retrieved successfully"
      });
    } catch (err) {
      next(err);
    }
  };
};

// utils/dtos/BlogDTO.ts
function normalizeTopic(topic) {
  if (!topic) return null;
  const t = Array.isArray(topic) ? topic[0] : topic;
  return t ? { id: t.id, name: t.name, slug: t.slug } : null;
}
function normalizeAuthor(author) {
  if (!author) return null;
  const a = Array.isArray(author) ? author[0] : author;
  if (!a) return null;
  const raw = a;
  const profile = Array.isArray(raw.user_profiles) ? raw.user_profiles[0] ?? null : raw.user_profiles ?? null;
  return {
    id: a.id,
    fullName: a.full_name ?? null,
    username: a.username ?? null,
    avatarUrl: profile?.avatar_url ?? a.avatar_url ?? null,
    website: profile?.website_url ?? a.website ?? null,
    tagLine: profile?.tag_line ?? a.tag_line ?? null
  };
}
var BlogDTOMapper = {
  toDTO(row) {
    if (row == null) return null;
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description ?? null,
      slug: row.slug,
      isSponsored: !!row.is_sponsored,
      isFeatured: !!row.is_featured,
      isAdminApproved: !!row.is_admin_approved,
      isUserPublished: !!row.is_user_published,
      heroImageFilename: row.hero_image_filename ?? null,
      readingTimeMinutes: row.reading_time_minutes ?? null,
      createdAt: row.created_at,
      publishedAt: row.published_at ?? null,
      topicId: row.topic_id,
      content: row.content ?? null,
      viewCount: row.view_count ?? null,
      likeCount: row.like_count ?? null,
      updatedAt: row.updated_at ?? null,
      topic: normalizeTopic(row.topic),
      author: normalizeAuthor(row.author)
    };
  },
  toDTOCollection(rows) {
    if (!Array.isArray(rows)) return [];
    return rows.map((r) => BlogDTOMapper.toDTO(r)).filter(Boolean);
  },
  toPublishedBlogAuthorDTO(row) {
    return {
      id: row.id,
      fullName: row.full_name ?? null,
      username: row.username ?? null,
      avatarUrl: row.avatar_url ?? null,
      website: row.website ?? null,
      tagLine: row.tag_line ?? null,
      postCount: Number(row.post_count) ?? 0
    };
  },
  toPublishedBlogAuthorDTOCollection(rows) {
    if (!Array.isArray(rows)) return [];
    return rows.map((r) => BlogDTOMapper.toPublishedBlogAuthorDTO(r));
  },
  toActiveBlogTopicDTO(row) {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description ?? null,
      parentId: row.parent_id ?? null,
      postCount: Number(row.post_count) ?? 0
    };
  },
  toActiveBlogTopicDTOCollection(rows) {
    if (!Array.isArray(rows)) return [];
    return rows.map((r) => BlogDTOMapper.toActiveBlogTopicDTO(r));
  },
  toCommentDTO(row) {
    return {
      id: row.id,
      content: row.content,
      isApproved: row.is_approved,
      createdAt: row.created_at,
      updatedAt: row.updated_at ?? null,
      parentId: row.parent_id ?? null,
      userId: row.user_id,
      author: row.author ? {
        id: row.author.id,
        fullName: row.author.full_name ?? null,
        avatarUrl: row.author.avatar_url ?? null
      } : null
    };
  },
  toCommentDTOCollection(rows) {
    if (!Array.isArray(rows)) return [];
    return rows.map((r) => BlogDTOMapper.toCommentDTO(r));
  },
  toAdminBlogCommentDTO(row) {
    return {
      ...BlogDTOMapper.toCommentDTO(row),
      postId: row.post_id,
      blogPost: row.blog_post ? { id: row.blog_post.id, title: row.blog_post.title, slug: row.blog_post.slug } : null
    };
  },
  toAdminBlogCommentDTOCollection(rows) {
    if (!Array.isArray(rows)) return [];
    return rows.map((r) => BlogDTOMapper.toAdminBlogCommentDTO(r));
  },
  toAdminBlogActivityDTO(row) {
    return {
      id: row.id,
      activityType: row.activity_type,
      createdAt: row.created_at,
      userId: row.user_id ?? null,
      postId: row.post_id,
      author: row.author ? { id: row.author.id, fullName: row.author.full_name ?? null, avatarUrl: row.author.avatar_url ?? null } : null,
      blogPost: row.blog_post ? { id: row.blog_post.id, title: row.blog_post.title, slug: row.blog_post.slug } : null
    };
  },
  toAdminBlogActivityDTOCollection(rows) {
    if (!Array.isArray(rows)) return [];
    return rows.map((r) => BlogDTOMapper.toAdminBlogActivityDTO(r));
  }
};
function buildPublishedBlogCacheKey(options, prefix = "blog:published:blog") {
  const limit = options.limit ?? 10;
  const skipId = options.skipId ?? "none";
  const skip = options.skip ?? 0;
  const searchTerm = options.searchTerm ?? "none";
  const topicId = options.topicId ?? "none";
  const sortBy = options.sortByKey ?? "default";
  const sortOrder = options.sortByOrder ? "asc" : "desc";
  const range = options.range ? `start:${options.range.start}:end:${options.range.end}` : "none";
  const authorId = options.authorId ?? "none";
  return [
    prefix,
    `limit:${limit}`,
    `skipId:${skipId}`,
    `skip:${skip}`,
    `searchTerm:${searchTerm}`,
    `topicId:${topicId}`,
    `sortBy:${sortBy}`,
    `sortOrder:${sortOrder}`,
    `range:${range}`,
    `authorId:${authorId}`
  ].join(":");
}
function buildAdminBlogCacheKey(options, prefix = "blog:admin:list") {
  const limit = options.limit ?? 10;
  const searchTerm = options.searchTerm ?? "none";
  const topicId = options.topicId ?? "none";
  const sortBy = options.sortByKey ?? "default";
  const sortOrder = options.sortByOrder ? "asc" : "desc";
  const range = options.range ? `start:${options.range.start}:end:${options.range.end}` : "none";
  return [
    prefix,
    `limit:${limit}`,
    `searchTerm:${searchTerm}`,
    `topicId:${topicId}`,
    `sortBy:${sortBy}`,
    `sortOrder:${sortOrder}`,
    `range:${range}`
  ].join(":");
}
function buildAdminBlogCommentsCacheKey(options, prefix = "blog:admin:comments:list") {
  const limit = options.limit ?? 10;
  const searchTerm = options.searchTerm ?? "none";
  const sortBy = options.sortByKey ?? "default";
  const sortOrder = options.sortByOrder ? "asc" : "desc";
  const range = options.range ? `start:${options.range.start}:end:${options.range.end}` : "none";
  return [
    prefix,
    `limit:${limit}`,
    `searchTerm:${searchTerm}`,
    `sortBy:${sortBy}`,
    `sortOrder:${sortOrder}`,
    `range:${range}`
  ].join(":");
}
function buildAdminBlogActivitiesCacheKey(options, prefix = "blog:admin:activities:list") {
  const limit = options.limit ?? 10;
  const sortBy = options.sortByKey ?? "default";
  const sortOrder = options.sortByOrder ? "asc" : "desc";
  const range = options.range ? `start:${options.range.start}:end:${options.range.end}` : "none";
  const postId = options.post_id ?? "none";
  const activityType = options.activity_type ?? "none";
  return [
    prefix,
    `limit:${limit}`,
    `sortBy:${sortBy}`,
    `sortOrder:${sortOrder}`,
    `range:${range}`,
    `postId:${postId}`,
    `activityType:${activityType}`
  ].join(":");
}
init_Logger();
var TABLE_NAME = "refresh_tokens";
var RefreshTokenRepository = class {
  constructor(supabase2) {
    this.supabase = supabase2;
  }
  async createToken({
    userId,
    token = null,
    expiresIn = 60 * 60 * 24 * 7,
    ipAddress = null,
    userAgent = null
  }) {
    this._validateId(userId, "userId");
    const tokenValue = token ?? this._generateToken();
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
    const tokenData = {
      id: uuid.v4(),
      user_id: userId,
      token: tokenValue,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      expires_at: expiresAt.toISOString(),
      revoked: false,
      ip_address: ipAddress,
      user_agent: userAgent
    };
    logger.debug({ msg: "Creating refresh token", userId });
    const { data, error } = await this.supabase.from(TABLE_NAME).insert(tokenData).select().single();
    if (error) {
      throw new DatabaseError(`Failed to create refresh token: ${error.message}`, {
        cause: error,
        operation: "createToken",
        resource: { type: "table", name: TABLE_NAME }
      });
    }
    return {
      id: data.id,
      userId: data.user_id,
      token: data.token,
      createdAt: data.created_at,
      expiresAt: data.expires_at
    };
  }
  async validateToken(token) {
    if (!token || typeof token !== "string") {
      throw new ValidationError("Token is required and must be a string");
    }
    logger.debug({ msg: "Validating refresh token" });
    const { data, error } = await this.supabase.from(TABLE_NAME).select("*").eq("token", token).maybeSingle();
    if (error) {
      throw new DatabaseError(`Failed to validate refresh token: ${error.message}`, {
        cause: error,
        operation: "validateToken",
        entityType: TABLE_NAME
      });
    }
    if (!data) {
      throw new DatabaseEntityNotFoundError("refresh_token", { token }, { entityType: TABLE_NAME });
    }
    if (data.revoked) {
      throw new ValidationError("Refresh token has been revoked");
    }
    const expiresAt = new Date(data.expires_at);
    if (expiresAt < /* @__PURE__ */ new Date()) {
      throw new ValidationError("Refresh token has expired");
    }
    return {
      id: data.id,
      userId: data.user_id,
      token: data.token,
      createdAt: data.created_at,
      expiresAt: data.expires_at,
      ipAddress: data.ip_address,
      userAgent: data.user_agent
    };
  }
  async revokeToken(token, replacedBy = null) {
    if (!token || typeof token !== "string") {
      throw new ValidationError("Token is required and must be a string");
    }
    const { data: existingToken, error: findError } = await this.supabase.from(TABLE_NAME).select("id").eq("token", token).maybeSingle();
    if (findError) {
      throw new DatabaseError(`Failed to find refresh token: ${findError.message}`, {
        cause: findError,
        operation: "revokeToken",
        entityType: TABLE_NAME
      });
    }
    if (!existingToken) {
      throw new DatabaseEntityNotFoundError("refresh_token", { token }, { entityType: TABLE_NAME });
    }
    const updateData = {
      revoked: true,
      revoked_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (replacedBy) updateData.replaced_by = replacedBy;
    const { data, error } = await this.supabase.from(TABLE_NAME).update(updateData).eq("token", token).select("id, user_id, revoked, revoked_at, replaced_by").single();
    if (error) {
      throw new DatabaseError(`Failed to revoke refresh token: ${error.message}`, {
        cause: error,
        operation: "revokeToken",
        entityType: TABLE_NAME
      });
    }
    return {
      id: data.id,
      userId: data.user_id,
      revoked: data.revoked,
      revokedAt: data.revoked_at,
      replacedBy: data.replaced_by
    };
  }
  _generateToken() {
    return crypto.randomBytes(40).toString("hex");
  }
  _validateId(id, paramName = "id") {
    if (!id) throw new MissingUserIdError("Missing userId");
    if (typeof id !== "string") {
      throw new IncorrectUserIDError(`${paramName} must be a string`);
    }
  }
};

// repositories/UserRepository.ts
init_Logger();
var TABLE_NAME2 = "users";
var CORE_USER_SELECT = "id, auth_id, email, full_name, is_email_verified, email_verification_token, email_verification_token_expires, created_at, updated_at";
var USER_WITH_PROFILE_SELECT = `${CORE_USER_SELECT}, user_profiles(avatar_url, website_url)`;
var ADMIN_USER_SELECT = "id, email, created_at, is_super_admin";
var UserRepository = class {
  constructor(supabase2) {
    this.supabase = supabase2;
  }
  async findFullUserByUserId(userId) {
    const { data: userData, error: userError } = await this.supabase.from(TABLE_NAME2).select(USER_WITH_PROFILE_SELECT).eq("auth_id", userId).single();
    return { userData, userError };
  }
  /**
   * Insert or update public.user_profiles for the user identified by auth.users id.
   * Only keys present in `fields` are written (partial update when row exists).
   */
  async upsertUserProfileByAuthId(authId, fields) {
    const { userId, error: resolveError } = await this.findUserIdByAuthId(authId);
    if (resolveError || !userId) {
      return { updateError: resolveError ?? new Error("User not found") };
    }
    const updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const payload = {
      updated_at: updatedAt
    };
    if (fields.avatar_url !== void 0) {
      payload.avatar_url = fields.avatar_url;
    }
    if (fields.website_url !== void 0) {
      payload.website_url = fields.website_url;
    }
    const { data: existing } = await this.supabase.from("user_profiles").select("id").eq("owner_id", userId).maybeSingle();
    if (existing) {
      const { error: updateError } = await this.supabase.from("user_profiles").update(payload).eq("owner_id", userId);
      return { updateError };
    }
    const { error: insertError } = await this.supabase.from("user_profiles").insert({
      owner_id: userId,
      avatar_url: fields.avatar_url ?? null,
      website_url: fields.website_url ?? null,
      updated_at: updatedAt
    });
    return { updateError: insertError };
  }
  /** Resolve auth user id (Supabase auth.uid()) to public.users.id. */
  async findUserIdByAuthId(authId) {
    const { data, error } = await this.supabase.from(TABLE_NAME2).select("id").eq("auth_id", authId).single();
    if (error && error.code !== "PGRST116") {
      throw new DatabaseError("Failed to resolve user by auth id", {
        cause: error,
        operation: "findUserIdByAuthId",
        resource: { type: "table", name: TABLE_NAME2 }
      });
    }
    return { userId: data?.id ?? null, error };
  }
  async findFullUserByEmail(email) {
    const normalizedEmail = email.trim().toLowerCase();
    const { data: userData, error } = await this.supabase.from(TABLE_NAME2).select(CORE_USER_SELECT).eq("email", normalizedEmail).single();
    if (error && error.code !== "PGRST116") {
      throw new DatabaseError("Database error during email lookup", {
        cause: error,
        operation: "findByEmail",
        resource: { type: "table", name: TABLE_NAME2 }
      });
    }
    return { userData };
  }
  /**
   * Find all users for admin list (id, email, created_at, is_super_admin).
   * Used with RbacRepository.getUserRoles to build full users with roles.
   */
  async findAllForAdmin() {
    const { data, error } = await this.supabase.from(TABLE_NAME2).select(ADMIN_USER_SELECT).order("created_at", { ascending: false });
    return { data: data ?? [], error };
  }
  async checkIfEmailVerified(email) {
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await this.supabase.from(TABLE_NAME2).select("is_email_verified").eq("email", normalizedEmail).single();
    if (error) {
      if (error.code === "PGRST116" || error.code === "42P01" || error.code === "PGRST205") {
        return false;
      }
      logger.warn({
        msg: "checkIfEmailVerified: treating error as not verified",
        code: error.code,
        details: error.details
      });
      return false;
    }
    return data?.is_email_verified === true;
  }
  async updateEmailVerification(userId, isEmailVerified) {
    const { error: updateError } = await this.supabase.from(TABLE_NAME2).update({
      is_email_verified: isEmailVerified,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", userId);
    return { updateError };
  }
  /** Find users by hashed verification token (non-expired). */
  async findUserByTokenHash(hashedToken) {
    const expiresNow = (/* @__PURE__ */ new Date()).toISOString();
    const { data: userData, error: userError } = await this.supabase.from(TABLE_NAME2).select(CORE_USER_SELECT).eq("email_verification_token", hashedToken).gt("email_verification_token_expires", expiresNow);
    return { userData: userData ?? [], userError };
  }
  /** Set or clear email verification token for a user (by user id). */
  async updateVerificationToken(userId, hashedToken, expiresAt) {
    const { error: updateError } = await this.supabase.from(TABLE_NAME2).update({
      email_verification_token: hashedToken,
      email_verification_token_expires: expiresAt?.toISOString() ?? null,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", userId);
    return { updateError };
  }
  /** Set verification token for a user by email (e.g. after signup). */
  async updateVerificationTokenByEmail(email, hashedToken, expiresAt) {
    const normalizedEmail = email.trim().toLowerCase();
    const { error: updateError } = await this.supabase.from(TABLE_NAME2).update({
      email_verification_token: hashedToken,
      email_verification_token_expires: expiresAt.toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("email", normalizedEmail);
    return { updateError };
  }
  /**
   * Ensure a row exists in public.users for the given auth user (e.g. when DB trigger is not present).
   * Inserts or updates by id so verification token can be stored later.
   */
  async upsertUserFromAuth(params) {
    const { error } = await this.supabase.from(TABLE_NAME2).upsert(
      {
        id: params.id,
        auth_id: params.authId,
        email: params.email,
        full_name: params.fullName,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      { onConflict: "id" }
    );
    return { error };
  }
  /** Update full_name for the user with the given auth_id. */
  async updateFullNameByAuthId(authId, fullName) {
    const { error: updateError } = await this.supabase.from(TABLE_NAME2).update({
      full_name: fullName,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("auth_id", authId);
    return { updateError };
  }
  /** Link an existing user (by id) to an OAuth provider. */
  async updateUserProvider(userId, provider, providerId) {
    const { error: updateError } = await this.supabase.from(TABLE_NAME2).update({
      provider,
      provider_id: providerId,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", userId);
    return { updateError };
  }
  async findUserByProvider(provider, providerId) {
    const { data: userData, error } = await this.supabase.from(TABLE_NAME2).select(CORE_USER_SELECT).eq("provider", provider).eq("provider_id", providerId).single();
    if (error && error.code !== "PGRST116") {
      throw new DatabaseError("Database error during provider lookup", {
        cause: error,
        operation: "findByProvider",
        resource: { type: "table", name: TABLE_NAME2 }
      });
    }
    return { userData };
  }
  /**
   * Insert or update public.users for an OAuth user (after Supabase auth user is created).
   */
  async upsertUserFromOAuth(params) {
    const { error } = await this.supabase.from(TABLE_NAME2).upsert(
      {
        id: params.id,
        auth_id: params.authId,
        email: params.email,
        full_name: params.fullName,
        is_email_verified: true,
        provider: params.provider,
        provider_id: params.providerId,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      { onConflict: "id" }
    );
    return { error };
  }
};

// repositories/ConfigRepository.ts
var ConfigRepository = class _ConfigRepository {
  constructor(supabaseServiceClient) {
    this.supabaseServiceClient = supabaseServiceClient;
  }
  static TABLE_NAME_MODULE_CONFIGS = "module_configs";
  static FULL_CONFIG_PARAMS = `
        module_name,
        config,
        updated_at
    `;
  async getConfigByModuleName(moduleName) {
    const { data, error } = await this.supabaseServiceClient.from(_ConfigRepository.TABLE_NAME_MODULE_CONFIGS).select(_ConfigRepository.FULL_CONFIG_PARAMS).eq("module_name", moduleName).maybeSingle();
    if (error) {
      throw new DatabaseError(
        `Error in getConfigByModuleName: ${moduleName} with message ${error.message}`,
        {
          cause: error,
          operation: "getConfigByModuleName",
          resource: { type: "table", name: _ConfigRepository.TABLE_NAME_MODULE_CONFIGS }
        }
      );
    }
    if (!data) {
      throw new DatabaseEntityNotFoundError(
        _ConfigRepository.TABLE_NAME_MODULE_CONFIGS,
        { moduleName }
      );
    }
    return { data };
  }
  async getConfigByModuleNameAndProperty(params) {
    const { moduleName, property } = params;
    const { data, error } = await this.supabaseServiceClient.from(_ConfigRepository.TABLE_NAME_MODULE_CONFIGS).select(_ConfigRepository.FULL_CONFIG_PARAMS).eq("module_name", moduleName).maybeSingle();
    if (error) {
      throw new DatabaseError(
        `Error in getConfigByModuleNameAndProperty: ${moduleName} with message ${error.message}`,
        {
          cause: error,
          operation: "getConfigByModuleNameAndProperty",
          resource: { type: "table", name: _ConfigRepository.TABLE_NAME_MODULE_CONFIGS }
        }
      );
    }
    const config2 = data?.config;
    if (!data || !config2 || config2[property] === void 0) {
      throw new DatabaseEntityNotFoundError(
        _ConfigRepository.TABLE_NAME_MODULE_CONFIGS,
        { moduleName, property }
      );
    }
    return { result: String(config2[property]) };
  }
  async getConfigByModuleNameAndProperties(params) {
    const { moduleName, properties } = params;
    let result = {};
    const { data, error } = await this.supabaseServiceClient.from(_ConfigRepository.TABLE_NAME_MODULE_CONFIGS).select(_ConfigRepository.FULL_CONFIG_PARAMS).eq("module_name", moduleName).maybeSingle();
    if (error) {
      throw new DatabaseError(
        `Error in getConfigByModuleNameAndProperties: ${moduleName} with message ${error.message}`,
        {
          cause: error,
          operation: "getConfigByModuleNameAndProperties",
          resource: { type: "table", name: _ConfigRepository.TABLE_NAME_MODULE_CONFIGS }
        }
      );
    }
    if (!data) {
      throw new DatabaseEntityNotFoundError(
        _ConfigRepository.TABLE_NAME_MODULE_CONFIGS,
        { moduleName }
      );
    }
    const config2 = data.config;
    if (config2 && properties.length > 0) {
      for (const key of properties) {
        if (key in config2 && config2[key] != null) {
          result[key] = String(config2[key]);
        }
      }
    }
    return { result, error: null };
  }
  async updateConfigByModuleName(params) {
    const { moduleName, newConfig } = params;
    const { error } = await this.supabaseServiceClient.from(_ConfigRepository.TABLE_NAME_MODULE_CONFIGS).update({ config: newConfig }).eq("module_name", moduleName);
    if (error) {
      throw new DatabaseError(
        `Error in updateConfigByModuleName: ${moduleName} with message ${error.message}`,
        {
          cause: error,
          operation: "updateConfigByModuleName",
          resource: { type: "table", name: _ConfigRepository.TABLE_NAME_MODULE_CONFIGS }
        }
      );
    }
    return true;
  }
};

// repositories/OrganizationRepository.ts
var ORGS_TABLE = "organizations";
var USER_ORGS_TABLE = "user_organizations";
var INVITES_TABLE = "organization_invites";
var ORG_SELECT = "id, name, description, api_key, created_at, updated_at";
var USER_ORG_SELECT = "id, user_id, organization_id, role, disabled, created_at, updated_at";
var OrganizationRepository = class {
  constructor(supabase2) {
    this.supabase = supabase2;
  }
  /** Find public.users.id by auth_id (Supabase auth user id). */
  async findUserIdByAuthId(authId) {
    const { data, error } = await this.supabase.from("users").select("id").eq("auth_id", authId).single();
    if (error && error.code !== "PGRST116") {
      throw new DatabaseError("Failed to resolve user by auth id", {
        cause: error,
        operation: "findUserIdByAuthId",
        resource: { type: "table", name: "users" }
      });
    }
    return { userId: data?.id ?? null, error };
  }
  /** List organizations the user belongs to (non-disabled memberships). */
  async findOrganizationsByUserId(userId) {
    const { data: memberships, error: uoError } = await this.supabase.from(USER_ORGS_TABLE).select(USER_ORG_SELECT).eq("user_id", userId).eq("disabled", false);
    if (uoError) {
      throw new DatabaseError("Failed to list user organizations", {
        cause: uoError,
        operation: "findOrganizationsByUserId",
        resource: { type: "table", name: USER_ORGS_TABLE }
      });
    }
    const list = memberships ?? [];
    if (list.length === 0) {
      return { organizations: [], memberships: [], error: null };
    }
    const orgIds = [...new Set(list.map((m) => m.organization_id))];
    const { data: orgs, error: orgError } = await this.supabase.from(ORGS_TABLE).select(ORG_SELECT).in("id", orgIds);
    if (orgError) {
      throw new DatabaseError("Failed to load organizations", {
        cause: orgError,
        operation: "findOrganizationsByUserId",
        resource: { type: "table", name: ORGS_TABLE }
      });
    }
    const orgRows = orgs ?? [];
    const membershipMap = list.map((m) => ({
      organizationId: m.organization_id,
      role: m.role,
      disabled: m.disabled
    }));
    return {
      organizations: orgRows,
      memberships: membershipMap,
      error: null
    };
  }
  /** Get member counts (non-disabled) per organization id. */
  async getMemberCounts(organizationIds) {
    if (organizationIds.length === 0) {
      return {};
    }
    const { data, error } = await this.supabase.from(USER_ORGS_TABLE).select("organization_id").in("organization_id", organizationIds).eq("disabled", false);
    if (error) {
      throw new DatabaseError("Failed to get member counts", {
        cause: error,
        operation: "getMemberCounts",
        resource: { type: "table", name: USER_ORGS_TABLE }
      });
    }
    const rows = data ?? [];
    const counts = {};
    for (const id of organizationIds) {
      counts[id] = 0;
    }
    for (const row of rows) {
      counts[row.organization_id] = (counts[row.organization_id] ?? 0) + 1;
    }
    return counts;
  }
  /** Get a single organization by id. */
  async findOrganizationById(organizationId) {
    const { data, error } = await this.supabase.from(ORGS_TABLE).select(ORG_SELECT).eq("id", organizationId).single();
    return { organization: data, error };
  }
  /** Get membership for a user in an organization. */
  async findMembership(userId, organizationId) {
    const { data, error } = await this.supabase.from(USER_ORGS_TABLE).select(USER_ORG_SELECT).eq("user_id", userId).eq("organization_id", organizationId).single();
    return { membership: data, error };
  }
  /** Create organization and optionally add first member. */
  async createOrganization(params) {
    const { data, error } = await this.supabase.from(ORGS_TABLE).insert({
      name: params.name,
      description: params.description ?? null,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).select(ORG_SELECT).single();
    return { organization: data, error };
  }
  /** Add user to organization with role. */
  async addMember(params) {
    const { data, error } = await this.supabase.from(USER_ORGS_TABLE).insert({
      user_id: params.userId,
      organization_id: params.organizationId,
      role: params.role,
      disabled: false,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).select(USER_ORG_SELECT).single();
    return { membership: data, error };
  }
  /** Update organization. */
  async updateOrganization(organizationId, params) {
    const payload = { updated_at: (/* @__PURE__ */ new Date()).toISOString() };
    if (params.name !== void 0) payload.name = params.name;
    if (params.description !== void 0) payload.description = params.description;
    const { data, error } = await this.supabase.from(ORGS_TABLE).update(payload).eq("id", organizationId).select(ORG_SELECT).single();
    return { organization: data, error };
  }
  /** Get all members of an organization (user_organizations + user profile). */
  async getTeam(organizationId) {
    const { data: uoList, error: uoError } = await this.supabase.from(USER_ORGS_TABLE).select(USER_ORG_SELECT).eq("organization_id", organizationId);
    if (uoError) {
      throw new DatabaseError("Failed to get team", {
        cause: uoError,
        operation: "getTeam",
        resource: { type: "table", name: USER_ORGS_TABLE }
      });
    }
    const rows = uoList ?? [];
    if (rows.length === 0) {
      return { members: [], error: null };
    }
    const userIds = [...new Set(rows.map((r) => r.user_id))];
    const { data: userList, error: userError } = await this.supabase.from("users").select("id, email, full_name").in("id", userIds);
    if (userError) {
      throw new DatabaseError("Failed to get users for team", {
        cause: userError,
        operation: "getTeam",
        resource: { type: "table", name: "users" }
      });
    }
    const userMap = new Map(
      (userList ?? []).map((u) => [
        u.id,
        { email: u.email, full_name: u.full_name }
      ])
    );
    const members = rows.map((r) => ({
      ...r,
      email: userMap.get(r.user_id)?.email ?? null,
      full_name: userMap.get(r.user_id)?.full_name ?? null
    }));
    return { members, error: null };
  }
  /** Remove member from organization. */
  async removeMember(userId, organizationId) {
    const { error } = await this.supabase.from(USER_ORGS_TABLE).delete().eq("user_id", userId).eq("organization_id", organizationId);
    return { error };
  }
  /** Delete organization (cascade deletes user_organizations). */
  async deleteOrganization(organizationId) {
    const { error } = await this.supabase.from(ORGS_TABLE).delete().eq("id", organizationId);
    return { error };
  }
  /** Generate and set a new api_key for the organization. */
  async rotateApiKey(organizationId) {
    const crypto = await import('crypto');
    const newKey = `co_${crypto.randomBytes(24).toString("hex")}`;
    const { data, error } = await this.supabase.from(ORGS_TABLE).update({ api_key: newKey, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", organizationId).select(ORG_SELECT).single();
    return { organization: data, error };
  }
  /** Insert a pending invite (when admin sends invite by email). */
  async insertInvite(params) {
    const { data, error } = await this.supabase.from(INVITES_TABLE).insert({
      email: params.email.toLowerCase().trim(),
      organization_id: params.organizationId,
      role: params.role,
      invited_by_user_id: params.invitedByUserId,
      expires_at: params.expiresAt
    }).select().single();
    return { invite: data, error };
  }
  /** List pending invites for an email (not yet accepted, not expired), with org name. */
  async findPendingInvitesByEmail(email) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const { data, error } = await this.supabase.from(INVITES_TABLE).select().ilike("email", email.trim()).gt("expires_at", now);
    if (error) {
      throw new DatabaseError("Failed to list pending invites", {
        cause: error,
        operation: "findPendingInvitesByEmail",
        resource: { type: "table", name: INVITES_TABLE }
      });
    }
    const rows = data ?? [];
    if (rows.length === 0) return { invites: [], error: null };
    const orgIds = [...new Set(rows.map((r) => r.organization_id))];
    const { data: orgs, error: orgError } = await this.supabase.from(ORGS_TABLE).select("id, name").in("id", orgIds);
    if (orgError) {
      throw new DatabaseError("Failed to load organizations for invites", {
        cause: orgError,
        operation: "findPendingInvitesByEmail",
        resource: { type: "table", name: ORGS_TABLE }
      });
    }
    const nameByOrgId = new Map(
      (orgs ?? []).map((o) => [o.id, o.name])
    );
    const invites = rows.map((r) => ({
      ...r,
      organization_name: nameByOrgId.get(r.organization_id) ?? ""
    }));
    return { invites, error: null };
  }
  /** Get a single invite by id. */
  async findInviteById(inviteId) {
    const { data, error } = await this.supabase.from(INVITES_TABLE).select().eq("id", inviteId).single();
    return { invite: data, error };
  }
  /** Delete one invite by id. */
  async deleteInvite(inviteId) {
    const { error } = await this.supabase.from(INVITES_TABLE).delete().eq("id", inviteId);
    return { error };
  }
  /** Delete all invites for a given email + organization (e.g. after accept via token). */
  async deleteInvitesByEmailAndOrganization(email, organizationId) {
    const { error } = await this.supabase.from(INVITES_TABLE).delete().ilike("email", email.trim()).eq("organization_id", organizationId);
    return { error };
  }
};

// repositories/RbacRepository.ts
var RbacRepository = class _RbacRepository {
  constructor(supabase2) {
    this.supabase = supabase2;
  }
  static TABLE_USER_ROLES = "user_roles";
  static TABLE_ROLE_PERMISSIONS = "role_permissions";
  async getUserRoles(userId) {
    const { data, error } = await this.supabase.from(_RbacRepository.TABLE_USER_ROLES).select("role").eq("user_id", userId);
    if (error) {
      throw new DatabaseError("Error getting user roles", {
        cause: error,
        operation: "select",
        resource: { type: "table", name: _RbacRepository.TABLE_USER_ROLES }
      });
    }
    const roles = (data ?? []).map((row) => row.role);
    return { roles };
  }
  async getUserPermissions(userId) {
    const { data, error } = await this.supabase.rpc("get_user_permissions", {
      user_uuid: userId
    });
    if (error) {
      throw new DatabaseError("Error getting user permissions", {
        cause: error,
        operation: "rpc",
        resource: { type: "function", name: "get_user_permissions" }
      });
    }
    const permissions = (data ?? []).map((row) => row.permission);
    return { permissions };
  }
  async hasRole(userId, role) {
    const { data, error } = await this.supabase.rpc("has_role", {
      user_uuid: userId,
      check_role: role
    });
    if (error) {
      throw new DatabaseError("Error checking user role", {
        cause: error,
        operation: "rpc",
        resource: { type: "function", name: "has_role" }
      });
    }
    return data === true;
  }
  async assignRole(userId, role, assignedBy) {
    const { data, error } = await this.supabase.rpc("assign_user_role", {
      target_user_id: userId,
      role_to_assign: role,
      assigned_by_user_id: assignedBy
    });
    if (error) {
      throw new DatabaseError(`Error assigning role: ${error.message}`, {
        cause: error,
        operation: "rpc",
        resource: { type: "function", name: "assign_user_role" }
      });
    }
    if (data != null) return { roleId: data };
    const { data: existing } = await this.supabase.from(_RbacRepository.TABLE_USER_ROLES).select("id").eq("user_id", userId).eq("role", role).single();
    return { roleId: existing?.id ?? null };
  }
  async removeRole(userId, role, removedBy) {
    const { data, error } = await this.supabase.rpc("remove_user_role", {
      target_user_id: userId,
      role_to_remove: role,
      removed_by_user_id: removedBy
    });
    if (error) {
      throw new DatabaseError("Error removing user role", {
        cause: error,
        operation: "rpc",
        resource: { type: "function", name: "remove_user_role" }
      });
    }
    return data === true;
  }
  async getUsersByRole(role) {
    const { data, error } = await this.supabase.from(_RbacRepository.TABLE_USER_ROLES).select("user_id").eq("role", role);
    if (error) {
      throw new DatabaseError("Error getting users by role", {
        cause: error,
        operation: "select",
        resource: { type: "table", name: _RbacRepository.TABLE_USER_ROLES }
      });
    }
    const userIds = (data ?? []).map((row) => row.user_id);
    return { userIds };
  }
  async getRolePermissions(role) {
    let query = this.supabase.from(_RbacRepository.TABLE_ROLE_PERMISSIONS).select("role, permission");
    if (role) query = query.eq("role", role);
    const { data, error } = await query;
    if (error) {
      throw new DatabaseError("Error getting role permissions", {
        cause: error,
        operation: "select",
        resource: { type: "table", name: _RbacRepository.TABLE_ROLE_PERMISSIONS }
      });
    }
    const permissions = (data ?? []).map((row) => ({
      role: row.role,
      permission: row.permission
    }));
    return { permissions };
  }
  async getPermissionsForRole(role) {
    const { data, error } = await this.supabase.from(_RbacRepository.TABLE_ROLE_PERMISSIONS).select("permission").eq("role", role);
    if (error) {
      throw new DatabaseError("Error getting permissions for role", {
        cause: error,
        operation: "select",
        resource: { type: "table", name: _RbacRepository.TABLE_ROLE_PERMISSIONS }
      });
    }
    const permissions = (data ?? []).map((row) => row.permission);
    return { permissions };
  }
  /** Check if user (public.users.id) is super admin. */
  async isSuperAdmin(publicUserId) {
    const { data, error } = await this.supabase.from("users").select("is_super_admin").eq("id", publicUserId).single();
    if (error) {
      throw new DatabaseError("Error checking super admin", {
        cause: error,
        operation: "select",
        resource: { type: "table", name: "users" }
      });
    }
    return data?.is_super_admin === true;
  }
  async assignPermissionToRole(role, permission) {
    const { data, error } = await this.supabase.from(_RbacRepository.TABLE_ROLE_PERMISSIONS).insert({ role, permission }).select("id").single();
    if (error) {
      if (error.code === "23505") return null;
      throw new DatabaseError("Error assigning permission to role", {
        cause: error,
        operation: "insert",
        resource: { type: "table", name: _RbacRepository.TABLE_ROLE_PERMISSIONS }
      });
    }
    return data ? { id: data.id } : null;
  }
  async removePermissionFromRole(role, permission) {
    const { error } = await this.supabase.from(_RbacRepository.TABLE_ROLE_PERMISSIONS).delete().eq("role", role).eq("permission", permission);
    if (error) {
      throw new DatabaseError("Error removing permission from role", {
        cause: error,
        operation: "delete",
        resource: { type: "table", name: _RbacRepository.TABLE_ROLE_PERMISSIONS }
      });
    }
    return true;
  }
};

// repositories/FeedbackRepository.ts
var TABLE = "feedback";
var COLS = "id, feedback_type, url, description, email, is_handled, created_at";
var FeedbackRepository = class {
  constructor(supabase2) {
    this.supabase = supabase2;
  }
  async insert(feedback) {
    const { data, error } = await this.supabase.from(TABLE).insert({
      feedback_type: feedback.feedback_type,
      url: feedback.url,
      description: feedback.description,
      email: feedback.email ?? null
    }).select(COLS).single();
    if (error || !data) {
      throw new DatabaseError("Error inserting feedback", {
        cause: error,
        operation: "insert",
        resource: { type: "table", name: TABLE }
      });
    }
    return data.id;
  }
  async updateIsHandled(feedbackId, isHandled) {
    const { data, error } = await this.supabase.from(TABLE).update({ is_handled: isHandled }).eq("id", feedbackId).select(COLS).single();
    if (error || !data) {
      throw new DatabaseError("Error updating feedback is_handled", {
        cause: error,
        operation: "update",
        resource: { type: "table", name: TABLE }
      });
    }
    return data.id;
  }
  async findAll() {
    const { data, error } = await this.supabase.from(TABLE).select(COLS).order("created_at", { ascending: false });
    if (error) {
      throw new DatabaseError("Error listing feedback", {
        cause: error,
        operation: "select",
        resource: { type: "table", name: TABLE }
      });
    }
    return (data ?? []).map((row) => ({
      id: row.id,
      feedback_type: row.feedback_type,
      url: row.url,
      description: row.description,
      email: row.email,
      is_handled: row.is_handled,
      created_at: row.created_at
    }));
  }
};

// repositories/BlogRepository.ts
init_Logger();

// utils/slug.ts
function stringToSlug(value) {
  return value.toLowerCase().trim().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "post";
}

// repositories/BlogRepository.ts
var RPC_GET_PUBLISHED_BLOG_AUTHORS = "get_published_blog_authors";
var RPC_GET_ACTIVE_BLOG_TOPICS = "get_active_blog_topics";
var TABLE_NAME_BLOG_POSTS = "blog_posts";
var TABLE_NAME_BLOG_TOPICS = "blog_topics";
var TABLE_NAME_BLOG_COMMENTS = "blog_comments";
var TABLE_NAME_BLOG_ACTIVITIES = "blog_activities";
var SELECT_BLOG_TOPIC = `
  id,
  name,
  slug,
  description,
  parent_id,
  parent:blog_topics(id, name, slug)
`;
var SELECT_BLOG_POST = `
  id,
  user_id,
  title,
  description,
  slug,
  is_sponsored,
  is_featured,
  is_admin_approved,
  is_user_published,
  hero_image_filename,
  reading_time_minutes,
  created_at,
  published_at,
  topic_id,
  content,
  view_count,
  like_count,
  updated_at,
  topic:blog_topics(id, name, slug),
  author:users!user_id(id, full_name, user_profiles(avatar_url, website_url, tag_line))
`;
var SELECT_BLOG_COMMENT = `
  id,
  content,
  is_approved,
  created_at,
  updated_at,
  parent_id,
  user_id,
  author:users!user_id(id, full_name, user_profiles(avatar_url))
`;
var SELECT_BLOG_COMMENT_ADMIN = `
  id,
  content,
  is_approved,
  created_at,
  updated_at,
  parent_id,
  user_id,
  post_id,
  author:users!user_id(id, full_name, user_profiles(avatar_url)),
  blog_post:post_id(id, title, slug)
`;
var SELECT_BLOG_ACTIVITY = `
  id,
  activity_type,
  created_at,
  user_id,
  post_id,
  author:users!user_id(id, full_name, user_profiles(avatar_url)),
  blog_post:post_id(id, title, slug)
`;
var BlogRepository = class {
  constructor(supabase2) {
    this.supabase = supabase2;
  }
  /**
   * Returns published and approved blog posts with optional filters (topicId, searchTerm, authorId, sort, range/skip/limit).
   */
  async findPublishedBlogPosts(options) {
    const {
      limit = 10,
      skipId,
      skip = 0,
      searchTerm,
      topicId,
      sortByKey,
      sortByOrder,
      range,
      authorId
    } = options;
    let query = this.supabase.from(TABLE_NAME_BLOG_POSTS).select(SELECT_BLOG_POST, { count: "exact" }).match({
      is_user_published: true,
      is_admin_approved: true
    });
    if (topicId && topicId !== "all") {
      query = query.eq("topic_id", topicId);
    }
    if (searchTerm) {
      query = query.textSearch("fts", searchTerm.replace(/\s+/g, "+"));
    }
    if (skipId) {
      query = query.not("id", "eq", skipId);
    }
    if (authorId) {
      query = query.eq("user_id", authorId);
    }
    const orderKey = sortByKey?.toString() || "published_at";
    query = query.order(orderKey, { ascending: sortByOrder ?? false });
    if (range) {
      query = query.range(range.start, range.end);
    } else {
      query = query.range(skip, skip + limit - 1);
    }
    const { data, error, count } = await query;
    if (error) {
      const cause = error;
      const detail = cause?.message ? `: ${cause.message}` : "";
      throw new DatabaseError(`Error fetching published blog posts${detail}`, {
        cause,
        operation: "select",
        resource: { type: "table", name: TABLE_NAME_BLOG_POSTS }
      });
    }
    return { data: data ?? [], count: count ?? 0 };
  }
  /**
   * Returns all blog posts for admin listing (no published/approved filter).
   * Supports topicId, searchTerm, limit, range, sortByKey (default created_at), sortByOrder.
   */
  async findAdminBlogPosts(options) {
    const {
      limit = 10,
      searchTerm,
      topicId,
      sortByKey,
      sortByOrder,
      range
    } = options;
    let query = this.supabase.from(TABLE_NAME_BLOG_POSTS).select(SELECT_BLOG_POST, { count: "exact" });
    if (topicId && topicId !== "all") {
      query = query.eq("topic_id", topicId);
    }
    if (searchTerm) {
      query = query.textSearch("fts", searchTerm.replace(/\s+/g, "+"));
    }
    const orderKey = sortByKey?.toString() || "created_at";
    query = query.order(orderKey, { ascending: sortByOrder ?? false });
    if (range) {
      query = query.range(range.start, range.end);
    } else {
      query = query.range(0, limit - 1);
    }
    const { data, error, count } = await query;
    if (error) {
      const cause = error;
      const detail = cause?.message ? `: ${cause.message}` : "";
      throw new DatabaseError(`Error fetching admin blog posts${detail}`, {
        cause,
        operation: "select",
        resource: { type: "table", name: TABLE_NAME_BLOG_POSTS }
      });
    }
    return { data: data ?? [], count: count ?? 0 };
  }
  /**
   * Returns all users who have at least one published and approved blog post.
   * Uses RPC get_published_blog_authors (profile fields from user_profiles).
   */
  async getPublishedBlogAuthors() {
    const { data, error } = await this.supabase.rpc(RPC_GET_PUBLISHED_BLOG_AUTHORS);
    if (error) {
      logger.error({
        msg: "Database error during get_published_blog_authors",
        error: error.message
      });
      throw new DatabaseError("Error getting published blog authors", {
        cause: error,
        operation: "rpc",
        resource: { type: "rpc", name: RPC_GET_PUBLISHED_BLOG_AUTHORS }
      });
    }
    return { data: data ?? [] };
  }
  /**
   * Returns a single published and approved blog post by slug, or null if not found.
   * Used by public GET /posts/:identifier (slug). Treats PGRST116 (no rows) as null.
   * Uses SELECT_BLOG_POST (author id, full_name only) so it works in test DBs without optional user columns.
   */
  async findPublishedBlogPostBySlug(slug) {
    const { data, error } = await this.supabase.from(TABLE_NAME_BLOG_POSTS).select(SELECT_BLOG_POST).match({
      slug,
      is_user_published: true,
      is_admin_approved: true
    }).single();
    if (error) {
      if (error.code === "PGRST116") {
        return { data: null };
      }
      logger.error({
        msg: "Database error during getting published blog post by slug",
        error: error.message
      });
      throw new DatabaseError("Error getting published blog post by slug", {
        cause: error,
        operation: "select",
        resource: { type: "table", name: TABLE_NAME_BLOG_POSTS }
      });
    }
    return { data };
  }
  async findBlogPostByBlogId(id) {
    const { data, error } = await this.supabase.from(TABLE_NAME_BLOG_POSTS).select(SELECT_BLOG_POST).match({ id }).single();
    if (error) {
      if (error.code === "PGRST116") {
        throw new DatabaseEntityNotFoundError("blog_posts", { id });
      }
      logger.error({
        msg: "Database error during getting blog post by id",
        error: error.message
      });
      throw new DatabaseError("Error getting blog post by id", {
        cause: error,
        operation: "select",
        resource: { type: "table", name: TABLE_NAME_BLOG_POSTS }
      });
    }
    return { data };
  }
  async createOne(post, userId, slug, isAdminApproved) {
    const isUserApproved = post.is_user_published === true;
    const row = {
      title: post.title,
      description: post.description,
      content: post.content,
      topic_id: post.topic_id,
      hero_image_filename: post.hero_image_filename,
      is_sponsored: post.is_sponsored ?? false,
      is_featured: post.is_featured ?? false,
      is_user_published: post.is_user_published ?? false,
      is_admin_approved: isAdminApproved,
      user_id: userId,
      slug
    };
    const { data, error } = await this.supabase.from(TABLE_NAME_BLOG_POSTS).insert(row).select("id, title, slug").single();
    if (error || !data?.id) {
      const isDuplicateKey = error?.message?.includes("duplicate key") ?? false;
      if (isDuplicateKey) {
        throw new ValidationError(
          "A blog post with this title already exists. Please choose a different title."
        );
      }
      const causeMsg = error?.message ?? error?.message;
      const detail = causeMsg ? `: ${causeMsg}` : ": no id returned";
      throw new DatabaseError(`Error creating blog post${detail}`, {
        cause: error,
        operation: "insert",
        resource: { type: "table", name: TABLE_NAME_BLOG_POSTS }
      });
    }
    return {
      savedBlogPostId: data.id,
      title: data.title,
      slug: data.slug,
      isAdminApproved,
      isUserApproved
    };
  }
  /**
   * Update an existing blog post by id (Listing-style). Takes form data plus slug, isAdminApproved, updatedAt.
   * Returns savedBlogPostId, title, slug, isAdminApproved, isUserApproved.
   */
  async updateOne(id, post, slug, isAdminApproved, updatedAt) {
    const isUserApproved = post.is_user_published === true;
    const row = {
      title: post.title,
      description: post.description,
      content: post.content,
      topic_id: post.topic_id,
      hero_image_filename: post.hero_image_filename,
      is_sponsored: post.is_sponsored ?? false,
      is_featured: post.is_featured ?? false,
      is_user_published: post.is_user_published ?? false,
      is_admin_approved: isAdminApproved,
      slug,
      updated_at: updatedAt
    };
    const { data, error } = await this.supabase.from(TABLE_NAME_BLOG_POSTS).update(row).eq("id", id).select("id, title, slug").single();
    if (error) {
      throw new DatabaseError("Error updating blog post", {
        cause: error,
        operation: "update",
        resource: { type: "table", name: TABLE_NAME_BLOG_POSTS }
      });
    }
    if (!data?.id) {
      throw new DatabaseError("Error updating blog post: no row returned", {
        operation: "update",
        resource: { type: "table", name: TABLE_NAME_BLOG_POSTS }
      });
    }
    return {
      savedBlogPostId: data.id,
      title: data.title,
      slug: data.slug,
      isAdminApproved,
      isUserApproved
    };
  }
  /**
   * Delete a blog post by id. Ported from template deleteBlogPost. Caller must enforce editor/admin.
   */
  async deleteBlogPost(id) {
    const { error } = await this.supabase.from(TABLE_NAME_BLOG_POSTS).delete().eq("id", id);
    if (error) {
      logger.error({
        msg: "Database error during delete blog post",
        error: error.message
      });
      throw new DatabaseError("Error deleting blog post. Contact Support.", {
        cause: error,
        operation: "delete",
        resource: { type: "table", name: TABLE_NAME_BLOG_POSTS }
      });
    }
  }
  /**
   * Create a blog topic. Slug is derived from name.
   * Returns { id, name }. Throws ValidationError on duplicate name/slug, DatabaseError otherwise.
   */
  async createTopic(payload) {
    const slug = stringToSlug(payload.name);
    const row = {
      name: payload.name,
      description: payload.description,
      parent_id: payload.parent_id ?? null,
      slug
    };
    const { data, error } = await this.supabase.from(TABLE_NAME_BLOG_TOPICS).insert(row).select("id, name").single();
    if (error || !data?.id) {
      const isDuplicateKey = error?.message?.includes("duplicate key") ?? false;
      if (isDuplicateKey) {
        throw new ValidationError(
          "A blog topic with this name already exists. Please choose a different name."
        );
      }
      const causeMsg = error?.message ?? error?.message;
      const detail = causeMsg ? `: ${causeMsg}` : ": no id returned";
      throw new DatabaseError(`Error creating blog topic${detail}`, {
        cause: error,
        operation: "insert",
        resource: { type: "table", name: TABLE_NAME_BLOG_TOPICS }
      });
    }
    return { id: data.id, name: data.name };
  }
  /**
   * Delete a blog topic by id. Fails if any post uses this topic or if topic has child topics.
   * Ported from template deleteBlogTopic.
   */
  async deleteBlogTopic(id) {
    const { data: postsWithTopic, error: postsError } = await this.supabase.from(TABLE_NAME_BLOG_POSTS).select("id").eq("topic_id", id).limit(1);
    if (postsError) {
      logger.error({
        msg: "Database error checking for blog posts with topic",
        error: postsError.message
      });
      throw new DatabaseError("Error checking for blog posts with topic. Contact Support.", {
        cause: postsError,
        operation: "select",
        resource: { type: "table", name: TABLE_NAME_BLOG_POSTS }
      });
    }
    if (postsWithTopic && postsWithTopic.length > 0) {
      throw new ValidationError(
        "Cannot delete topic that is being used by blog posts. Please remove or reassign the blog posts first."
      );
    }
    const { data: childTopics, error: childError } = await this.supabase.from(TABLE_NAME_BLOG_TOPICS).select("id").eq("parent_id", id).limit(1);
    if (childError) {
      logger.error({
        msg: "Database error checking for child topics",
        error: childError.message
      });
      throw new DatabaseError("Error checking for child topics. Contact Support.", {
        cause: childError,
        operation: "select",
        resource: { type: "table", name: TABLE_NAME_BLOG_TOPICS }
      });
    }
    if (childTopics && childTopics.length > 0) {
      throw new ValidationError(
        "Cannot delete topic that has child topics. Please remove or reassign the child topics first."
      );
    }
    const { error: deleteError } = await this.supabase.from(TABLE_NAME_BLOG_TOPICS).delete().eq("id", id);
    if (deleteError) {
      logger.error({
        msg: "Database error during delete blog topic",
        error: deleteError.message
      });
      throw new DatabaseError("Error deleting blog topic. Contact Support.", {
        cause: deleteError,
        operation: "delete",
        resource: { type: "table", name: TABLE_NAME_BLOG_TOPICS }
      });
    }
  }
  /**
   * Update a blog topic by id. Slug is derived from name.
   * Throws DatabaseError on failure.
   */
  async updateTopic(id, payload) {
    const slug = stringToSlug(payload.name);
    const row = {
      name: payload.name,
      description: payload.description,
      parent_id: payload.parent_id ?? null,
      slug,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const { data, error } = await this.supabase.from(TABLE_NAME_BLOG_TOPICS).update(row).eq("id", id).select("id, name").single();
    if (error) {
      logger.error({
        msg: "Database error during update blog topic",
        error: error.message
      });
      throw new DatabaseError("Error updating blog topic. Contact Support.", {
        cause: error,
        operation: "update",
        resource: { type: "table", name: TABLE_NAME_BLOG_TOPICS }
      });
    }
    if (!data?.id) {
      throw new DatabaseError("Error updating blog topic: no row returned", {
        operation: "update",
        resource: { type: "table", name: TABLE_NAME_BLOG_TOPICS }
      });
    }
    return { id: data.id, name: data.name };
  }
  /**
   * Returns all blog topics (id, name, slug, description, parent_id, parent) ordered by name.
   * Used for dropdowns and topic list. Ported from template SELECT_BLOG_TOPIC.
   */
  async findBlogTopics() {
    const { data, error } = await this.supabase.from(TABLE_NAME_BLOG_TOPICS).select(SELECT_BLOG_TOPIC).order("name", { ascending: true });
    if (error) {
      logger.error({
        msg: "Database error during find blog topics",
        error: error.message
      });
      throw new DatabaseError("Error fetching blog topics", {
        cause: error,
        operation: "select",
        resource: { type: "table", name: TABLE_NAME_BLOG_TOPICS }
      });
    }
    const rows = data ?? [];
    const topics = rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description ?? null,
      parent_id: row.parent_id ?? null,
      parent: Array.isArray(row.parent) ? row.parent[0] ?? null : row.parent ?? null
    }));
    return { data: topics };
  }
  /**
   * Returns active blog topics (topics that have at least one published post) with post_count.
   * Ported from template getActiveBlogTopics; uses RPC get_active_blog_topics.
   */
  async findActiveBlogTopics() {
    const { data, error } = await this.supabase.rpc(RPC_GET_ACTIVE_BLOG_TOPICS);
    if (error) {
      logger.error({
        msg: "Database error during find active blog topics",
        error: error.message
      });
      throw new DatabaseError("Error fetching active blog topics", {
        cause: error,
        operation: "rpc",
        resource: { type: "rpc", name: RPC_GET_ACTIVE_BLOG_TOPICS }
      });
    }
    const rows = data ?? [];
    const topics = rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description ?? null,
      parent_id: row.parent_id ?? null,
      post_count: Number(row.post_count) ?? 0
    }));
    return { data: topics };
  }
  /**
   * Returns approved comments for a post, ordered by created_at ascending.
   * Author from users + user_profiles (avatar_url). Ported from template getPostComments.
   */
  async findPostComments(postId) {
    const { data, error } = await this.supabase.from(TABLE_NAME_BLOG_COMMENTS).select(SELECT_BLOG_COMMENT).eq("post_id", postId).eq("is_approved", true).order("created_at", { ascending: true });
    if (error) {
      logger.error({
        msg: "Database error during find post comments",
        error: error.message
      });
      throw new DatabaseError("Error fetching post comments", {
        cause: error,
        operation: "select",
        resource: { type: "table", name: TABLE_NAME_BLOG_COMMENTS }
      });
    }
    const rows = data ?? [];
    const comments = rows.map((row) => {
      const rawAuthor = Array.isArray(row.author) ? row.author[0] ?? null : row.author ?? null;
      const profile = rawAuthor?.user_profiles;
      const avatar_url = profile && typeof profile === "object" && "avatar_url" in profile ? profile.avatar_url : rawAuthor?.avatar_url ?? null;
      return {
        id: row.id,
        content: row.content,
        is_approved: row.is_approved,
        created_at: row.created_at,
        updated_at: row.updated_at ?? null,
        parent_id: row.parent_id ?? null,
        user_id: row.user_id,
        author: rawAuthor ? { id: rawAuthor.id, full_name: rawAuthor.full_name ?? null, avatar_url: avatar_url ?? null } : null
      };
    });
    return { data: comments };
  }
  /**
   * Returns all blog comments for admin listing (no approved filter).
   * Ported from template getAdminBlogComments. Supports searchTerm, limit, range, sortByKey (default created_at), sortByOrder.
   */
  async findAdminBlogComments(options) {
    const {
      limit = 10,
      searchTerm,
      sortByKey,
      sortByOrder,
      range
    } = options;
    let query = this.supabase.from(TABLE_NAME_BLOG_COMMENTS).select(SELECT_BLOG_COMMENT_ADMIN, { count: "exact" });
    if (searchTerm) {
      query = query.ilike("content", `%${searchTerm}%`);
    }
    const orderKey = sortByKey?.toString() || "created_at";
    query = query.order(orderKey, { ascending: sortByOrder ?? false });
    if (range) {
      query = query.range(range.start, range.end);
    } else {
      query = query.range(0, limit - 1);
    }
    const { data, error, count } = await query;
    if (error) {
      logger.error({
        msg: "Database error during find admin blog comments",
        error: error.message
      });
      throw new DatabaseError("Error fetching admin blog comments", {
        cause: error,
        operation: "select",
        resource: { type: "table", name: TABLE_NAME_BLOG_COMMENTS }
      });
    }
    const rows = data ?? [];
    const comments = rows.map((row) => {
      const rawAuthor = Array.isArray(row.author) ? row.author[0] ?? null : row.author ?? null;
      const profile = rawAuthor?.user_profiles;
      const avatar_url = profile && typeof profile === "object" && "avatar_url" in profile ? profile.avatar_url : rawAuthor?.avatar_url ?? null;
      const rawPost = Array.isArray(row.blog_post) ? row.blog_post[0] ?? null : row.blog_post ?? null;
      return {
        id: row.id,
        content: row.content,
        is_approved: row.is_approved,
        created_at: row.created_at,
        updated_at: row.updated_at ?? null,
        parent_id: row.parent_id ?? null,
        user_id: row.user_id,
        post_id: row.post_id,
        author: rawAuthor ? { id: rawAuthor.id, full_name: rawAuthor.full_name ?? null, avatar_url: avatar_url ?? null } : null,
        blog_post: rawPost ? { id: rawPost.id, title: rawPost.title, slug: rawPost.slug } : null
      };
    });
    return { data: comments, count: count ?? 0 };
  }
  /**
   * Create a blog comment. Only content, post_id, parent_id (optional) and user_id.
   * New comments start with is_approved: false.
   */
  async createComment(payload, userId) {
    const row = {
      content: payload.content,
      post_id: payload.post_id,
      parent_id: payload.parent_id ?? null,
      user_id: userId,
      is_approved: false
    };
    const { data, error } = await this.supabase.from(TABLE_NAME_BLOG_COMMENTS).insert(row).select("id").single();
    if (error || !data?.id) {
      const causeMsg = error?.message ?? error?.message;
      const detail = causeMsg ? `: ${causeMsg}` : ": no id returned";
      throw new DatabaseError(`Error creating blog comment${detail}`, {
        cause: error,
        operation: "insert",
        resource: { type: "table", name: TABLE_NAME_BLOG_COMMENTS }
      });
    }
    return { id: data.id };
  }
  /**
   * Update a blog comment by id. Only the comment owner (user_id) can update.
   * Updates content and updated_at. Returns id and post_id for cache invalidation.
   */
  async updateComment(id, userId, payload) {
    const row = {
      content: payload.content,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const { data, error } = await this.supabase.from(TABLE_NAME_BLOG_COMMENTS).update(row).eq("id", id).eq("user_id", userId).select("id, post_id").single();
    if (error) {
      logger.error({
        msg: "Database error during update blog comment",
        error: error.message
      });
      throw new DatabaseError("Error updating blog comment. Contact Support.", {
        cause: error,
        operation: "update",
        resource: { type: "table", name: TABLE_NAME_BLOG_COMMENTS }
      });
    }
    if (!data?.id) {
      throw new DatabaseError("Comment not found or you are not the owner", {
        operation: "update",
        resource: { type: "table", name: TABLE_NAME_BLOG_COMMENTS }
      });
    }
    return { id: data.id, post_id: data.post_id };
  }
  /**
   * Approve a blog comment by id (admin/editor action; no user_id filter).
   * Sets is_approved: true and updated_at. Returns id and post_id for cache invalidation.
   */
  async approveComment(commentId) {
    const row = {
      is_approved: true,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const { data, error } = await this.supabase.from(TABLE_NAME_BLOG_COMMENTS).update(row).eq("id", commentId).select("id, post_id").single();
    if (error) {
      logger.error({
        msg: "Database error during approve blog comment",
        error: error.message
      });
      throw new DatabaseError("Error approving blog comment. Contact Support.", {
        cause: error,
        operation: "update",
        resource: { type: "table", name: TABLE_NAME_BLOG_COMMENTS }
      });
    }
    if (!data?.id) {
      throw new DatabaseError("Comment not found", {
        operation: "update",
        resource: { type: "table", name: TABLE_NAME_BLOG_COMMENTS }
      });
    }
    return { id: data.id, post_id: data.post_id };
  }
  /**
   * Delete a blog comment by id. Admin/editor action; no user_id filter. Returns post_id for cache invalidation.
   * Ported from template deleteComment.
   */
  async deleteComment(commentId) {
    const { data, error } = await this.supabase.from(TABLE_NAME_BLOG_COMMENTS).delete().eq("id", commentId).select("post_id").single();
    if (error) {
      logger.error({
        msg: "Database error during delete blog comment",
        error: error.message
      });
      throw new DatabaseError("Error deleting comment. Contact Support.", {
        cause: error,
        operation: "delete",
        resource: { type: "table", name: TABLE_NAME_BLOG_COMMENTS }
      });
    }
    if (!data?.post_id) {
      throw new DatabaseError("Comment not found", {
        operation: "delete",
        resource: { type: "table", name: TABLE_NAME_BLOG_COMMENTS }
      });
    }
    return { post_id: data.post_id };
  }
  /**
   * Insert a blog activity row (view, like, share, comment). user_id may be null for anonymous.
   * Ported from template trackBlogActivity.
   */
  async insertBlogActivity(postId, activityType, userId) {
    const row = {
      post_id: postId,
      activity_type: activityType,
      user_id: userId ?? null
    };
    const { error } = await this.supabase.from(TABLE_NAME_BLOG_ACTIVITIES).insert(row);
    if (error) {
      logger.error({
        msg: "Database error during insert blog activity",
        error: error.message
      });
      throw new DatabaseError("Error tracking blog activity. Contact Support.", {
        cause: error,
        operation: "insert",
        resource: { type: "table", name: TABLE_NAME_BLOG_ACTIVITIES }
      });
    }
  }
  /**
   * Returns all blog activities for admin listing. Supports post_id, activity_type, limit, range, sortByKey (default created_at), sortByOrder.
   * Ported from template getAdminBlogActivities. Cache tag: BLOG_ACTIVITIES_CACHE (invalidate pattern blog:admin:activities:list:*).
   */
  async findAdminBlogActivities(options) {
    const {
      limit = 10,
      sortByKey,
      sortByOrder,
      range,
      post_id,
      activity_type
    } = options;
    let query = this.supabase.from(TABLE_NAME_BLOG_ACTIVITIES).select(SELECT_BLOG_ACTIVITY, { count: "exact" });
    if (post_id) {
      query = query.eq("post_id", post_id);
    }
    if (activity_type) {
      query = query.eq("activity_type", activity_type);
    }
    const orderKey = sortByKey?.toString() || "created_at";
    query = query.order(orderKey, { ascending: sortByOrder ?? false });
    if (range) {
      query = query.range(range.start, range.end);
    } else {
      query = query.range(0, limit - 1);
    }
    const { data, error, count } = await query;
    if (error) {
      logger.error({
        msg: "Database error during find admin blog activities",
        error: error.message
      });
      throw new DatabaseError("Error fetching admin blog activities", {
        cause: error,
        operation: "select",
        resource: { type: "table", name: TABLE_NAME_BLOG_ACTIVITIES }
      });
    }
    const rows = data ?? [];
    const activities = rows.map((row) => {
      const rawAuthor = Array.isArray(row.author) ? row.author[0] ?? null : row.author ?? null;
      const profile = rawAuthor?.user_profiles;
      const avatar_url = profile && typeof profile === "object" && "avatar_url" in profile ? profile.avatar_url : rawAuthor?.avatar_url ?? null;
      const rawPost = Array.isArray(row.blog_post) ? row.blog_post[0] ?? null : row.blog_post ?? null;
      return {
        id: row.id,
        activity_type: row.activity_type,
        created_at: row.created_at,
        user_id: row.user_id,
        post_id: row.post_id,
        author: rawAuthor ? { id: rawAuthor.id, full_name: rawAuthor.full_name ?? null, avatar_url: avatar_url ?? null } : null,
        blog_post: rawPost ? { id: rawPost.id, title: rawPost.title, slug: rawPost.slug } : null
      };
    });
    return { data: activities, count: count ?? 0 };
  }
};

// repositories/StorageRepository.ts
var DATABASE_NAMES = {
  AVATARS: "avatars",
  BLOG_IMAGES: "blog_images"
};
function isAllowedDatabaseName(name) {
  return typeof name === "string" && Object.values(DATABASE_NAMES).includes(name);
}
var StorageRepository = class {
  constructor(supabaseServiceClient) {
    this.supabaseServiceClient = supabaseServiceClient;
  }
  async getPublicImageUrl(databaseName, imageUrl) {
    const { data } = this.supabaseServiceClient.storage.from(databaseName).getPublicUrl(imageUrl);
    return data.publicUrl;
  }
  async downloadImage(databaseName, path3) {
    const { data, error } = await this.supabaseServiceClient.storage.from(databaseName).download(path3);
    if (error) {
      const rawMsg = error.message;
      const msg = (typeof rawMsg === "string" ? rawMsg : JSON.stringify(rawMsg ?? error) || "Unknown storage error").toLowerCase();
      const isNotFound = msg.includes("not found") || msg.includes("object not found") || msg.includes("nosuchkey") || msg.includes("no such key") || error.error === "ObjectNotFound";
      const messageStr = typeof rawMsg === "string" ? rawMsg : rawMsg ? JSON.stringify(rawMsg) : "Unknown storage error";
      throw new DatabaseError(`Error in downloadImage: ${databaseName} with message ${messageStr}`, {
        cause: error,
        operation: "download",
        resource: { type: "storage", name: databaseName },
        statusCode: isNotFound ? 404 : 500
      });
    }
    return { data, error };
  }
  async uploadImage(databaseName, file, uid) {
    const fileExt = file.originalname.split(".").pop();
    const filePath = `${uid}-${Math.random()}.${fileExt}`;
    const { error: uploadError } = await this.supabaseServiceClient.storage.from(databaseName).upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });
    if (uploadError) {
      throw new DatabaseError(`Error in uploadImage: ${databaseName} with message ${uploadError.message}`, {
        cause: uploadError,
        operation: "upload",
        resource: { type: "storage", name: databaseName }
      });
    }
    return filePath;
  }
  async deleteImage(databaseName, path3) {
    const { data, error } = await this.supabaseServiceClient.storage.from(databaseName).remove([path3]);
    if (error) {
      throw new DatabaseError(`Error in deleteImage: ${databaseName} with message ${error.message}`, {
        cause: error,
        operation: "remove",
        resource: { type: "storage", name: databaseName }
      });
    }
    return { data, error };
  }
};

// repositories/index.ts
var refreshTokenRepository = new RefreshTokenRepository(supabaseServiceClientConnection);
var userRepository = new UserRepository(supabaseServiceClientConnection);
var configRepository = new ConfigRepository(supabaseServiceClientConnection);
var organizationRepository = new OrganizationRepository(supabaseServiceClientConnection);
var rbacRepository = new RbacRepository(supabaseServiceClientConnection);
var feedbackRepository = new FeedbackRepository(supabaseServiceClientConnection);
var blogRepository = new BlogRepository(supabaseServiceClientConnection);
var storageRepository = new StorageRepository(supabaseServiceClientConnection);

// services/AuthenticationService.ts
init_Logger();
var AuthenticationService = class {
  constructor(supabaseServiceClient, refreshTokenRepository2, userRepository2, userService2) {
    this.supabaseServiceClient = supabaseServiceClient;
    this.refreshTokenRepository = refreshTokenRepository2;
    this.userRepository = userRepository2;
    this.userService = userService2;
  }
  createRLSClient = (context) => createSupabaseRLSClient(context);
  async signIn(email, password, context) {
    const normalizedEmail = normalizeEmail(email);
    const supabaseRLSClient = this.createRLSClient(context);
    const { data: signedInUser, error } = await supabaseRLSClient.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });
    if (error) {
      throw new InvalidCredentialsError("Invalid credentials");
    }
    const { userData: dbUser } = await this.userRepository.findFullUserByEmail(normalizedEmail);
    if (!dbUser) {
      logger.error({ msg: "Authenticated user not found in DB", email: normalizedEmail });
      throw new UserNotFoundError(normalizedEmail);
    }
    const isEmailVerified = dbUser.is_email_verified !== false;
    if (!isEmailVerified) {
      throw new NotVerifiedUserError("User is not verified");
    }
    return {
      signedInUser: signedInUser.user,
      userDBdata: dbUser,
      session: signedInUser.session
    };
  }
  async signUp(email, password, fullName, context) {
    const normalizedEmail = normalizeEmail(email);
    const supabaseRLSClient = this.createRLSClient(context);
    const allowSignups = await this.userService.isUserSignUpAllowed();
    if (!allowSignups || allowSignups !== "true") {
      throw new UserAuthorizationError("User signups are not allowed");
    }
    const { data, error } = await supabaseRLSClient.auth.signUp({
      email: normalizedEmail,
      password,
      options: { data: { full_name: fullName || "User" } }
    });
    if (error) {
      const msg = error.message?.toLowerCase() ?? "";
      if (msg.includes("already registered") || msg.includes("user already exists") || msg.includes("already been registered")) {
        throw new UserConflictError("This email is already registered. Please sign in.");
      }
      throw new InvalidCredentialsError("Invalid credentials");
    }
    return {
      newUser: data.user,
      session: data.session
    };
  }
  async signOut(context) {
    const supabaseRLSClient = this.createRLSClient(context);
    await supabaseRLSClient.auth.signOut();
  }
  async refreshToken(refreshToken, options = {}) {
    logger.debug({ msg: "Refreshing access token" });
    if (!refreshToken) {
      throw new AuthValidationError("Refresh token is required");
    }
    await this.refreshTokenRepository.validateToken(refreshToken);
    const { data, error } = await this.supabaseServiceClient.auth.refreshSession({
      refresh_token: refreshToken
    });
    await this.supabaseServiceClient.auth.signOut({ scope: "local" });
    if (error) {
      logger.error({ msg: "Refresh token rejected by Supabase", errorMessage: error.message });
      await this.refreshTokenRepository.revokeToken(refreshToken);
      throw new AuthError(`Failed to refresh session: ${error.message}`, error.status ?? 401, { cause: error });
    }
    const newToken = data.session?.refresh_token;
    if (newToken && data.user?.id) {
      await this.rotateRefreshToken(refreshToken, newToken, {
        userId: data.user.id,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent
      });
    }
    return {
      session: data.session,
      user: data.user ? { id: data.user.id } : void 0
    };
  }
  async generateRefreshToken({
    userId,
    token = null,
    expiresIn = 7 * 24 * 60 * 60,
    ipAddress = null,
    userAgent = null
  }) {
    if (!userId) throw new MissingUserIdError("Missing user ID");
    return this.refreshTokenRepository.createToken({
      userId,
      token,
      expiresIn,
      ipAddress,
      userAgent
    });
  }
  async validateRefreshToken(token) {
    if (!token) throw new AuthValidationError("Refresh token is required for validation");
    try {
      return await this.refreshTokenRepository.validateToken(token);
    } catch (err) {
      if (err instanceof ValidationError) {
        throw new AuthValidationError(`Invalid refresh token: ${err.message}`, { cause: err });
      }
      if (err instanceof DatabaseEntityNotFoundError) {
        throw new AuthNotFoundError("Refresh token", { cause: err });
      }
      throw new AuthError(`Error validating refresh token: ${err.message}`, 401, { cause: err });
    }
  }
  async revokeRefreshToken(token) {
    if (!token) throw new AuthValidationError("Refresh token is required for revocation");
    try {
      return await this.refreshTokenRepository.revokeToken(token);
    } catch (err) {
      if (err instanceof DatabaseEntityNotFoundError) {
        logger.warn({ msg: "Attempted to revoke non-existent token" });
        return { revoked: true };
      }
      throw new AuthError(`Failed to revoke refresh token: ${err.message}`, 500, { cause: err });
    }
  }
  async rotateRefreshToken(oldToken, newToken, options) {
    if (!oldToken || !newToken || !options.userId) {
      throw new AuthValidationError("Old token, new token, and user ID are required for token rotation");
    }
    try {
      await this.refreshTokenRepository.revokeToken(oldToken, newToken);
      return await this.refreshTokenRepository.createToken({
        userId: options.userId,
        token: newToken,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent
      });
    } catch (err) {
      logger.error({ msg: "Failed to rotate refresh token", error: err.message });
      throw new AuthError(`Failed to rotate refresh token: ${err.message}`, 401, { cause: err });
    }
  }
  /**
   * Generate a recovery link/OTP for password reset without sending Supabase's built-in email.
   * Use the returned token in your own email template; the same token is used with verifyOtp(email, token, 'recovery').
   */
  async generateRecoveryLink(email, options = {}) {
    const normalizedEmail = normalizeEmail(email);
    const { data, error } = await this.supabaseServiceClient.auth.admin.generateLink({
      type: "recovery",
      email: normalizedEmail,
      options: { redirectTo: options.redirectTo }
    });
    if (error) {
      return { token: "", error: { message: error.message, code: error.code ?? void 0 } };
    }
    const props = data?.properties;
    const token = props?.email_otp ?? props?.token ?? data?.token ?? "";
    return { token, error: null };
  }
  async verifyOtp(email, code, type) {
    const normalizedEmail = normalizeEmail(email);
    const { data, error } = await this.supabaseServiceClient.auth.verifyOtp({
      email: normalizedEmail,
      token: code,
      type
    });
    if (error || !data.session) {
      throw new AuthError(`Failed to verify OTP: ${error?.message ?? "Unknown"}`, 401, { cause: error });
    }
    return {
      signedInUser: data.user,
      session: data.session
    };
  }
  async updatePassword(password, context) {
    const req = context.req;
    const userId = req.user?.id;
    if (!userId) {
      throw new AuthError("User ID not found in authenticated request", 401);
    }
    const { error } = await this.supabaseServiceClient.auth.admin.updateUserById(userId, {
      password
    });
    return { error };
  }
};

// services/UserService.ts
init_GlobalConfig();
init_Logger();
var CACHE_KEYS2 = {
  USER: "user",
  USER_PROFILE: "user:profile",
  USER_BY_EMAIL: "user:email",
  USER_LIST_FULL_WITH_ROLES: "user:list:full:with_roles"
};
var BLOG_PUBLISHED_AUTHORS_KEY = "blog:published:authors";
var USER_CACHE_TTL_SEC = 300;
var UserService = class {
  constructor(userRepository2, cache, rbacRepository2, cacheInvalidator) {
    this.userRepository = userRepository2;
    this.cache = cache;
    this.rbacRepository = rbacRepository2;
    this.cacheInvalidator = cacheInvalidator;
  }
  /** Returns "true" if signup is allowed, or "false". */
  async isUserSignUpAllowed() {
    const authConfig3 = config.auth;
    if (authConfig3?.disableRegistration === true) {
      return "false";
    }
    return "true";
  }
  /**
   * Get profile row for the given auth user id (Supabase auth.users.id).
   * Returns null if no user row is found. Controller maps to DTO just before response.
   * Uses cache when cache service is available; optionally cross-references by email.
   */
  async getProfile(authUserId) {
    const cacheKey = `${CACHE_KEYS2.USER_PROFILE}:${authUserId}`;
    const factory = async () => {
      const { userData } = await this.userRepository.findFullUserByUserId(authUserId);
      if (this.cache && userData?.email) {
        await this.cache.set(`${CACHE_KEYS2.USER_BY_EMAIL}:${userData.email}`, userData, USER_CACHE_TTL_SEC);
      }
      return userData ?? null;
    };
    if (this.cache) {
      return this.cache.getOrSet(cacheKey, factory, USER_CACHE_TTL_SEC);
    }
    return factory();
  }
  /**
   * Get all users with roles (for admin role manager). Super-admin only.
   * Uses cache when cache service is available (invalidated on user/role changes via USER:list:*).
   */
  async getFullUsersWithRoles() {
    const cacheKey = CACHE_KEYS2.USER_LIST_FULL_WITH_ROLES;
    const factory = async () => {
      logger.debug({ msg: "Getting full users with roles", cacheKey });
      const { data: users, error } = await this.userRepository.findAllForAdmin();
      if (error || !users?.length) {
        return [];
      }
      if (!this.rbacRepository) {
        return users.map((u) => ({
          id: u.id,
          email: u.email ?? "",
          roles: [],
          isSuperAdmin: u.is_super_admin,
          createdAt: u.created_at
        }));
      }
      const withRoles = [];
      for (const u of users) {
        const { roles } = await this.rbacRepository.getUserRoles(u.id);
        withRoles.push({
          id: u.id,
          email: u.email ?? "",
          roles,
          isSuperAdmin: u.is_super_admin,
          createdAt: u.created_at
        });
      }
      return withRoles;
    };
    if (this.cache) {
      return this.cache.getOrSet(cacheKey, factory, USER_CACHE_TTL_SEC);
    }
    return factory();
  }
  /**
   * Update profile fields for the authenticated user (users.full_name and/or user_profiles).
   * Invalidates related caches.
   */
  async updateProfile(authUserId, updates) {
    if (updates.fullName !== void 0) {
      const { updateError } = await this.userRepository.updateFullNameByAuthId(authUserId, updates.fullName);
      if (updateError) {
        throw updateError;
      }
    }
    if (updates.avatarUrl !== void 0 || updates.websiteUrl !== void 0) {
      const fields = {};
      if (updates.avatarUrl !== void 0) {
        fields.avatar_url = updates.avatarUrl;
      }
      if (updates.websiteUrl !== void 0) {
        const w = updates.websiteUrl;
        fields.website_url = w === "" || w === null ? null : w;
      }
      const { updateError } = await this.userRepository.upsertUserProfileByAuthId(authUserId, fields);
      if (updateError) {
        throw updateError;
      }
    }
    const { userData } = await this.userRepository.findFullUserByUserId(authUserId);
    await this._invalidateUserRelatedCaches({
      authUserId,
      userEmail: userData?.email ?? void 0
    });
  }
  /**
   * Invalidate cache entries that may be stale after a user mutation.
   * Uses same invalidate pattern as other services (CacheInvalidationService).
   * Logs errors and does not throw so the request is not failed by cache issues.
   */
  async _invalidateUserRelatedCaches(params) {
    if (!this.cacheInvalidator) return;
    const { authUserId, userEmail } = params;
    try {
      await this.cacheInvalidator.invalidateKey(`${CACHE_KEYS2.USER_PROFILE}:${authUserId}`);
      if (userEmail) {
        await this.cacheInvalidator.invalidateKey(`${CACHE_KEYS2.USER_BY_EMAIL}:${userEmail}`);
      }
      await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS2.USER}:list:*`);
      await this.cacheInvalidator.invalidateKey(BLOG_PUBLISHED_AUTHORS_KEY);
      logger.debug({ msg: "Invalidated user related caches", authUserId });
    } catch (error) {
      logger.error({ msg: "Error invalidating user related caches", authUserId, error: String(error) });
    }
  }
};

// services/EmailService.ts
init_GlobalConfig();
init_Logger();
var emailConfig = config.email;
var serverConfig4 = config.server;
var basicConfig = config.basic;
var awsConfig = config.aws;
var resendConfig = config.resend;
var EmailService = class {
  transporter = null;
  isEnabled;
  constructor(options) {
    this.isEnabled = options?.isEnabled ?? emailConfig?.enabled ?? false;
    if (!this.isEnabled) return;
    const isProduction = serverConfig4?.nodeEnv === "production";
    if (isProduction) {
      if (resendConfig?.secretKey) {
        this.transporter = nodemailer__default.default.createTransport({
          host: "smtp.resend.com",
          secure: true,
          port: 465,
          auth: {
            user: "resend",
            pass: resendConfig.secretKey
          }
        });
      } else {
        logger.warn({ msg: "Email enabled but RESEND_SECRET_KEY not set; emails will not be sent." });
      }
    } else {
      const useLocalSes = serverConfig4?.isEmailServerOffline === true || awsConfig?.accessKeyId === "local" && awsConfig?.secretAccessKey === "local";
      let sesOptions = {
        region: "ap-southeast-1",
        apiVersion: "2019-09-27",
        credentials: {
          accessKeyId: awsConfig?.accessKeyId ?? "",
          secretAccessKey: awsConfig?.secretAccessKey ?? ""
        }
      };
      if (useLocalSes) {
        sesOptions = {
          region: "aws-ses-v2-local",
          apiVersion: "2019-09-27",
          endpoint: "http://127.0.0.1:8005",
          credentials: {
            accessKeyId: awsConfig?.accessKeyId ?? "local",
            secretAccessKey: awsConfig?.secretAccessKey ?? "local"
          }
        };
        logger.info({ msg: "[Email] Using local SES mock", endpoint: "http://127.0.0.1:8005" });
      }
      if (awsConfig?.accessKeyId && awsConfig?.secretAccessKey) {
        const sesClient = new clientSesv2.SESv2Client(sesOptions);
        this.transporter = nodemailer__default.default.createTransport({
          SES: {
            sesClient,
            SendEmailCommand: clientSesv2.SendEmailCommand
          }
        });
      } else {
        logger.warn({
          msg: "Email enabled but AWS credentials not set; emails will not be sent."
        });
      }
    }
  }
  /**
   * Send an email using the given template. No-op when isEnabled is false or transport is not configured.
   */
  async send(template, to) {
    if (!this.isEnabled) return;
    if (!this.transporter) {
      logger.info({
        msg: "Email (skipped \u2013 no transport)",
        to,
        subject: template.buildSubject()
      });
      return;
    }
    try {
      await this.transporter.sendMail({
        from: {
          name: basicConfig?.siteName ?? "Openquok",
          address: basicConfig?.senderEmailAddress ?? "noreply@example.com"
        },
        to,
        subject: template.buildSubject(),
        html: template.buildHtml()
      });
    } catch (err) {
      logger.error({ msg: "Email send failed", to, err });
      throw err;
    }
  }
  generateVerificationToken() {
    return crypto.randomBytes(32).toString("hex");
  }
  hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
};

// services/CompanyService.ts
var CACHE_KEYS3 = {
  CONFIG_COMPANY_INFORMATION: "config:module:company_information"
};
var COMPANY_CACHE_TTL = 300;
var CompanyService = class _CompanyService {
  constructor(configRepository2, cache) {
    this.configRepository = configRepository2;
    this.cache = cache;
  }
  static MODULE_NAME = "company_information";
  async getAllCompanyInformation() {
    const cacheKey = CACHE_KEYS3.CONFIG_COMPANY_INFORMATION;
    return this.cache.getOrSet(cacheKey, async () => {
      const { data } = await this.configRepository.getConfigByModuleName(
        _CompanyService.MODULE_NAME
      );
      return data;
    }, COMPANY_CACHE_TTL);
  }
  async getCompanyInformationByProperties(properties) {
    if (!properties || properties.length === 0) {
      return {};
    }
    const cacheKey = `${CACHE_KEYS3.CONFIG_COMPANY_INFORMATION}:${properties.join(":")}`;
    return this.cache.getOrSet(cacheKey, async () => {
      const { result } = await this.configRepository.getConfigByModuleNameAndProperties({
        moduleName: _CompanyService.MODULE_NAME,
        properties
      });
      return result;
    }, COMPANY_CACHE_TTL);
  }
};

// services/MarketingService.ts
var CACHE_KEYS4 = {
  CONFIG_MARKETING_INFORMATION: "config:module:marketing_information"
};
var MARKETING_CACHE_TTL_SEC = 300;
var MarketingService = class _MarketingService {
  constructor(configRepository2, cache) {
    this.configRepository = configRepository2;
    this.cache = cache;
  }
  static MODULE_NAME = "marketing_information";
  async getMarketingInformation() {
    const cacheKey = CACHE_KEYS4.CONFIG_MARKETING_INFORMATION;
    const factory = async () => {
      const { data } = await this.configRepository.getConfigByModuleName(
        _MarketingService.MODULE_NAME
      );
      return data;
    };
    if (this.cache) {
      return this.cache.getOrSet(cacheKey, factory, MARKETING_CACHE_TTL_SEC);
    }
    return factory();
  }
  async getMarketingInformationByProperties(properties) {
    if (!properties || properties.length === 0) {
      return {};
    }
    const cacheKey = `${CACHE_KEYS4.CONFIG_MARKETING_INFORMATION}:${properties.join(":")}`;
    const factory = async () => {
      const { result } = await this.configRepository.getConfigByModuleNameAndProperties({
        moduleName: _MarketingService.MODULE_NAME,
        properties
      });
      return result;
    };
    if (this.cache) {
      return this.cache.getOrSet(cacheKey, factory, MARKETING_CACHE_TTL_SEC);
    }
    return factory();
  }
};

// services/OAuthService.ts
init_providers();
init_GlobalConfig();
init_Logger();
var serverConfig5 = config.server;
var authConfig2 = config.auth;
var OAuthService = class {
  constructor(supabaseAdmin, userRepository2, userService2, organizationService2) {
    this.supabaseAdmin = supabaseAdmin;
    this.userRepository = userRepository2;
    this.userService = userService2;
    this.organizationService = organizationService2;
  }
  /**
   * Return the redirect URL for the given provider (for sign-in/sign-up).
   */
  getRedirectUrl(provider, state) {
    const p = getOAuthProvider(provider);
    return p.getRedirectUrl(state);
  }
  /**
   * Exchange code for profile, then find or create user and return a magic link URL
   * so the client can complete the session. Redirect the user to that URL.
   */
  async handleCallback(provider, code) {
    const p = getOAuthProvider(provider);
    const profile = await p.exchangeCodeForProfile(code);
    const existingByProvider = await this.userRepository.findUserByProvider(
      provider,
      profile.id
    );
    if (existingByProvider.userData) {
      const magic2 = await this.generateMagicLinkForAuthId(
        existingByProvider.userData.auth_id,
        existingByProvider.userData.email
      );
      return { redirectTo: magic2 };
    }
    const existingByEmail = await this.userRepository.findFullUserByEmail(profile.email);
    if (existingByEmail.userData) {
      await this.userRepository.updateUserProvider(
        existingByEmail.userData.id,
        provider,
        profile.id
      ).catch(() => {
      });
      const magic2 = await this.generateMagicLinkForAuthId(
        existingByEmail.userData.auth_id,
        existingByEmail.userData.email
      );
      return { redirectTo: magic2 };
    }
    const allowSignups = await this.userService.isUserSignUpAllowed();
    if (!allowSignups || allowSignups !== "true") {
      throw new AuthError("Registration is disabled", 403);
    }
    if (authConfig2?.disableRegistration) {
      throw new AuthError("Registration is disabled", 403);
    }
    const { data: createData, error: createError } = await this.supabaseAdmin.auth.admin.createUser({
      email: profile.email,
      email_confirm: true,
      user_metadata: {
        full_name: profile.fullName ?? profile.email,
        provider,
        provider_id: profile.id
      }
    });
    if (createError) {
      if (createError.message?.includes("already") || createError.code === "user_already_exists") {
        const byEmail = await this.userRepository.findFullUserByEmail(profile.email);
        if (byEmail.userData?.auth_id) {
          const magic2 = await this.generateMagicLinkForAuthId(
            byEmail.userData.auth_id,
            profile.email
          );
          return { redirectTo: magic2 };
        }
      }
      logger.error({
        msg: "OAuth: Supabase createUser failed",
        provider,
        email: profile.email,
        error: createError.message
      });
      throw new AuthError(`Could not create account: ${createError.message}`, 400);
    }
    const authUserId = createData.user?.id;
    if (!authUserId) {
      throw new AuthError("Could not create account", 500);
    }
    const { error: upsertError } = await this.userRepository.upsertUserFromOAuth({
      id: authUserId,
      authId: authUserId,
      email: profile.email,
      fullName: profile.fullName ?? profile.email,
      provider,
      providerId: profile.id
    });
    if (upsertError) {
      logger.error({
        msg: "OAuth: upsertUserFromOAuth failed",
        authUserId,
        error: String(upsertError)
      });
      throw new AuthError("Failed to create user record", 500);
    }
    const defaultOrg = await this.organizationService.createDefaultOrganizationForNewUser(authUserId, {
      name: profile.fullName ?? "My Organization"
    });
    if (!defaultOrg) {
      logger.warn({ msg: "OAuth: default organization creation failed for new user", authUserId });
    }
    const magic = await this.generateMagicLinkForAuthId(authUserId, profile.email);
    return { redirectTo: magic };
  }
  async generateMagicLinkForAuthId(authId, email) {
    const frontendUrl = (serverConfig5?.frontendDomainUrl ?? "").replace(/\/$/, "");
    const redirectTo = `${frontendUrl}/auth/callback`;
    const { data, error } = await this.supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo
      }
    });
    if (error || !data?.properties) {
      logger.error({
        msg: "OAuth: generateLink failed",
        email,
        error: error?.message ?? "no properties"
      });
      throw new AuthError("Could not complete sign-in", 500);
    }
    const props = data.properties;
    if (props.action_link) return props.action_link;
    const supabaseUrl = config.supabase.supabaseUrl?.replace(
      /\/$/,
      ""
    );
    return `${supabaseUrl}/auth/v1/verify?token=${props.hashed_token}&type=magiclink&redirect_to=${encodeURIComponent(redirectTo)}`;
  }
};
var ALG = "sha256";
var SEP = ".";
var TTL_MS = 60 * 60 * 1e3;
function base64UrlEncode(buf) {
  return buf.toString("base64url");
}
function base64UrlDecode(str) {
  return Buffer.from(str, "base64url");
}
function signInviteToken(payload, secret) {
  if (!secret) {
    throw new Error("Invite token secret is not configured (set INVITE_TOKEN_SECRET or JWT_SECRET)");
  }
  const expiresAt = new Date(Date.now() + TTL_MS).toISOString();
  const id = crypto.randomBytes(6).toString("hex");
  const full = { ...payload, expiresAt, id };
  const raw = JSON.stringify(full);
  const payloadB64 = base64UrlEncode(Buffer.from(raw, "utf8"));
  const sig = crypto.createHmac(ALG, secret).update(payloadB64).digest();
  return `${payloadB64}${SEP}${base64UrlEncode(sig)}`;
}
function verifyInviteToken(token, secret) {
  if (!secret || !token) return null;
  const idx = token.lastIndexOf(SEP);
  if (idx === -1) return null;
  const payloadB64 = token.slice(0, idx);
  const sigB64 = token.slice(idx + 1);
  try {
    const expectedSig = crypto.createHmac(ALG, secret).update(payloadB64).digest();
    const actualSig = base64UrlDecode(sigB64);
    if (actualSig.length !== expectedSig.length || !crypto.timingSafeEqual(actualSig, expectedSig)) {
      return null;
    }
    const raw = base64UrlDecode(payloadB64).toString("utf8");
    const payload = JSON.parse(raw);
    if (new Date(payload.expiresAt).getTime() < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

// services/OrganizationService.ts
init_GlobalConfig();

// emails/OrganizationInviteEmailTemplate.ts
var OrganizationInviteEmailTemplate = class extends AbstractEmailTemplate {
  inviteLink;
  organizationName;
  role;
  expiresInHours;
  constructor(inviteLink, organizationName, role, expiresInHours = 1) {
    super();
    this.inviteLink = inviteLink;
    this.organizationName = organizationName;
    this.role = role;
    this.expiresInHours = expiresInHours;
  }
  buildSubject() {
    return `You're invited to join ${this.organizationName}`;
  }
  buildText() {
    return `
You have been invited to join ${this.organizationName} as ${this.role}.

Click the link below to accept the invitation:

${this.inviteLink}

This link will expire in ${this.expiresInHours} hour(s).

If you did not expect this invitation, you can ignore this email.

Best regards,
The Team
`.trim();
  }
  buildHtml() {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Organization Invitation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">You're invited to join ${this.organizationName}</h1>
    <p>You have been invited to join <strong>${this.organizationName}</strong> as <strong>${this.role}</strong>.</p>
    <p>Click the button below to accept the invitation:</p>
    <p style="margin: 20px 0;">
        <a href="${this.inviteLink}" style="display: inline-block; background-color: #3498db; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Accept invitation</a>
    </p>
    <p style="color: #7f8c8d; font-size: 14px;">
        Or copy and paste this link into your browser:<br>
        <a href="${this.inviteLink}" style="color: #3498db; word-break: break-all;">${this.inviteLink}</a>
    </p>
    <p style="color: #e74c3c; font-weight: bold;">This link will expire in ${this.expiresInHours} hour(s).</p>
    <p style="color: #7f8c8d; font-size: 14px; margin-top: 30px;">
        If you did not expect this invitation, you can ignore this email.
    </p>
    <p style="margin-top: 30px;">
        Best regards,<br>
        <strong>The Team</strong>
    </p>
</body>
</html>
`.trim();
  }
};

// services/OrganizationService.ts
init_Logger();
var ROLE_LEVEL = { user: 0, admin: 1, superadmin: 2 };
var CACHE_KEYS5 = {
  ORG: "org",
  ORG_LIST_BYUSERID: "org:list:byUserId",
  ORG_BY_IDS: "org:byIds"
};
var ORG_CACHE_TTL_SEC = 300;
var OrganizationService = class {
  constructor(organizationRepository2, userRepository2, emailService2, cache, cacheInvalidator) {
    this.organizationRepository = organizationRepository2;
    this.userRepository = userRepository2;
    this.emailService = emailService2;
    this.cache = cache;
    this.cacheInvalidator = cacheInvalidator;
  }
  /** Invite a team member by email: create signed invite link and optionally send email. */
  async inviteTeamMemberByEmail(authUserId, organizationId, params) {
    const userId = await this.resolveAuthUserToUserId(authUserId);
    const { membership } = await this.organizationRepository.findMembership(userId, organizationId);
    if (!membership || membership.disabled) throw new OrganizationNotFoundError(organizationId);
    if (this.getRoleLevel(membership.role) < 1) throw new OrganizationForbiddenError("Only admins can invite team members");
    const { organization } = await this.organizationRepository.findOrganizationById(organizationId);
    if (!organization) throw new OrganizationNotFoundError(organizationId);
    const secret = config.auth?.inviteTokenSecret ?? "";
    const token = signInviteToken(
      { email: params.email, organizationId, workspaceRole: params.workspaceRole },
      secret
    );
    const frontendUrl = config.server?.frontendDomainUrl ?? "";
    const inviteUrl = `${frontendUrl}/join-org?token=${encodeURIComponent(token)}`;
    const expiresAt = dayjs__default.default().add(1, "hour").toISOString();
    if (params.sendEmail && this.emailService?.isEnabled) {
      try {
        await this.emailService.send(
          new OrganizationInviteEmailTemplate(inviteUrl, organization.name, params.workspaceRole, 1),
          params.email
        );
      } catch (_) {
      }
    }
    try {
      const { error } = await this.organizationRepository.insertInvite({
        email: params.email,
        organizationId,
        role: params.workspaceRole,
        invitedByUserId: userId,
        expiresAt
      });
      if (error) throw new Error(String(error));
    } catch (err) {
      logger.warn({
        msg: "insertInvite failed (pending invites list may be incomplete)",
        organizationId,
        error: err instanceof Error ? err.message : String(err)
      });
    }
    return { url: inviteUrl, expiresAt };
  }
  /** Accept invite token and add current user to the organization. */
  async joinOrganizationByToken(authUserId, token) {
    const secret = config.auth?.inviteTokenSecret ?? "";
    const payload = verifyInviteToken(token, secret);
    if (!payload) throw new OrganizationForbiddenError("Invalid or expired invite token");
    const userId = await this.resolveAuthUserToUserId(authUserId);
    const { userData } = await this.userRepository.findFullUserByUserId(authUserId);
    if (userData?.email && userData.email.toLowerCase() !== payload.email.toLowerCase()) {
      throw new OrganizationForbiddenError("This invite was sent to a different email. Sign in with that account to accept.");
    }
    const { membership: existing } = await this.organizationRepository.findMembership(userId, payload.organizationId);
    if (existing && !existing.disabled) {
      return { organizationId: payload.organizationId, workspaceRole: payload.workspaceRole };
    }
    const { error } = await this.organizationRepository.addMember({
      userId,
      organizationId: payload.organizationId,
      role: payload.workspaceRole
    });
    if (error) throw error;
    await this.organizationRepository.deleteInvitesByEmailAndOrganization(
      payload.email,
      payload.organizationId
    );
    await this._invalidateOrganizationRelatedCaches({ authUserId });
    return { organizationId: payload.organizationId, workspaceRole: payload.workspaceRole };
  }
  /** Validate invite token without consuming; returns org name and role for UI. */
  async validateInviteToken(token) {
    const secret = config.auth?.inviteTokenSecret ?? "";
    const payload = verifyInviteToken(token, secret);
    if (!payload) return null;
    const { organization } = await this.organizationRepository.findOrganizationById(payload.organizationId);
    return organization ? { organizationName: organization.name, workspaceRole: payload.workspaceRole } : null;
  }
  /** List pending workspace invites for the current user (by email). Returns row shape; controller maps to DTO. */
  async listPendingInvitesForUser(authUserId) {
    const userId = await this.resolveAuthUserToUserId(authUserId);
    const { userData } = await this.userRepository.findFullUserByUserId(authUserId);
    const email = userData?.email?.trim();
    if (!email) return [];
    const { invites } = await this.organizationRepository.findPendingInvitesByEmail(email);
    const result = [];
    for (const inv of invites) {
      const { membership } = await this.organizationRepository.findMembership(userId, inv.organization_id);
      if (membership && !membership.disabled) continue;
      result.push(inv);
    }
    return result;
  }
  /** Accept a pending invite by id (current user must match invite email). */
  async acceptPendingInvite(authUserId, inviteId) {
    const userId = await this.resolveAuthUserToUserId(authUserId);
    const { userData } = await this.userRepository.findFullUserByUserId(authUserId);
    const userEmail = userData?.email?.trim();
    if (!userEmail) throw new OrganizationForbiddenError("User email not found");
    const { invite } = await this.organizationRepository.findInviteById(inviteId);
    if (!invite) throw new OrganizationForbiddenError("Invite not found or already used");
    if (invite.email.toLowerCase() !== userEmail.toLowerCase()) {
      throw new OrganizationForbiddenError("This invite was sent to a different email.");
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (invite.expires_at <= now) throw new OrganizationForbiddenError("This invite has expired");
    const { membership: existing } = await this.organizationRepository.findMembership(userId, invite.organization_id);
    if (existing && !existing.disabled) {
      await this.organizationRepository.deleteInvite(inviteId);
      await this._invalidateOrganizationRelatedCaches({ authUserId });
      return { organizationId: invite.organization_id, workspaceRole: invite.role };
    }
    const { error } = await this.organizationRepository.addMember({
      userId,
      organizationId: invite.organization_id,
      role: invite.role
    });
    if (error) throw error;
    await this.organizationRepository.deleteInvite(inviteId);
    await this._invalidateOrganizationRelatedCaches({ authUserId });
    return { organizationId: invite.organization_id, workspaceRole: invite.role };
  }
  /** Resolve auth user id (Supabase auth.uid()) to public.users id. */
  async resolveAuthUserToUserId(authUserId) {
    const { userId } = await this.organizationRepository.findUserIdByAuthId(authUserId);
    if (!userId) {
      throw new UserNotFoundError(authUserId);
    }
    return userId;
  }
  /** Get role level for permission checks. */
  getRoleLevel(role) {
    return ROLE_LEVEL[role] ?? -1;
  }
  /** List organizations for the authenticated user. Returns aggregate; controller maps to DTO. */
  async listMyOrganizations(authUserId) {
    const cacheKey = `${CACHE_KEYS5.ORG_LIST_BYUSERID}:${authUserId}`;
    const factory = async () => {
      const userId = await this.resolveAuthUserToUserId(authUserId);
      const { organizations, memberships } = await this.organizationRepository.findOrganizationsByUserId(userId);
      const orgIds = organizations.map((o) => o.id);
      const memberCounts = await this.organizationRepository.getMemberCounts(orgIds);
      return { organizations, memberships, memberCounts };
    };
    if (this.cache) {
      return this.cache.getOrSet(cacheKey, factory, ORG_CACHE_TTL_SEC);
    }
    return factory();
  }
  /** Get one organization by id; caller must be a member. Returns aggregate or null; controller maps to DTO. */
  async getOrganizationById(authUserId, organizationId) {
    const cacheKey = `${CACHE_KEYS5.ORG_BY_IDS}:${authUserId}:${organizationId}`;
    const factory = async () => {
      const userId = await this.resolveAuthUserToUserId(authUserId);
      const { membership } = await this.organizationRepository.findMembership(userId, organizationId);
      if (!membership || membership.disabled) {
        return null;
      }
      const { organization } = await this.organizationRepository.findOrganizationById(organizationId);
      if (!organization) return null;
      const memberCounts = await this.organizationRepository.getMemberCounts([organizationId]);
      return {
        organization,
        membership: { role: membership.role, disabled: membership.disabled },
        memberCount: memberCounts[organizationId] ?? 0
      };
    };
    if (this.cache) {
      return this.cache.getOrSet(cacheKey, factory, ORG_CACHE_TTL_SEC);
    }
    return factory();
  }
  /** Create organization and add the current user as superadmin. Returns row; controller maps to DTO. */
  async createOrganization(authUserId, params) {
    const userId = await this.resolveAuthUserToUserId(authUserId);
    const { organization, error } = await this.organizationRepository.createOrganization(params);
    if (error) throw error;
    await this.organizationRepository.addMember({
      userId,
      organizationId: organization.id,
      role: "superadmin"
    });
    await this._invalidateOrganizationRelatedCaches({ authUserId });
    return organization;
  }
  /**
   * Create a default organization for a newly registered user (createOrgAndUser-style).
   * Used at signup and OAuth registration so the user has one org and is superadmin.
   * Returns the created org row or null on failure (caller should not fail signup).
   */
  async createDefaultOrganizationForNewUser(authUserId, params) {
    try {
      return await this.createOrganization(authUserId, {
        name: params?.name?.trim() || "My Organization",
        description: null
      });
    } catch (err) {
      logger.warn({
        msg: "createDefaultOrganizationForNewUser failed",
        authUserId,
        error: err instanceof Error ? err.message : String(err)
      });
      return null;
    }
  }
  /** Update organization; requires admin or superadmin. Returns row; controller maps to DTO. */
  async updateOrganization(authUserId, organizationId, params) {
    const userId = await this.resolveAuthUserToUserId(authUserId);
    const { membership } = await this.organizationRepository.findMembership(userId, organizationId);
    if (!membership || membership.disabled) {
      throw new OrganizationNotFoundError(organizationId);
    }
    if (this.getRoleLevel(membership.role) < 1) {
      throw new OrganizationForbiddenError("Only admins can update the organization");
    }
    const { organization, error } = await this.organizationRepository.updateOrganization(
      organizationId,
      params
    );
    if (error) throw error;
    if (!organization) throw new OrganizationNotFoundError(organizationId);
    await this._invalidateOrganizationRelatedCaches({ authUserId, organizationId });
    return organization;
  }
  /** Get team members; requires membership. Returns row shape; controller maps to DTO. */
  async getTeam(authUserId, organizationId) {
    const userId = await this.resolveAuthUserToUserId(authUserId);
    const { membership } = await this.organizationRepository.findMembership(userId, organizationId);
    if (!membership || membership.disabled) {
      throw new OrganizationNotFoundError(organizationId);
    }
    const { members } = await this.organizationRepository.getTeam(organizationId);
    return members;
  }
  /** Add a team member; requires admin or superadmin. Returns added member row; controller maps to DTO. */
  async addTeamMember(authUserId, organizationId, params) {
    const userId = await this.resolveAuthUserToUserId(authUserId);
    const { membership } = await this.organizationRepository.findMembership(userId, organizationId);
    if (!membership || membership.disabled) {
      throw new OrganizationNotFoundError(organizationId);
    }
    if (this.getRoleLevel(membership.role) < 1) {
      throw new OrganizationForbiddenError("Only admins can add team members");
    }
    const { organization } = await this.organizationRepository.findOrganizationById(organizationId);
    if (!organization) throw new OrganizationNotFoundError(organizationId);
    const { membership: newMembership, error } = await this.organizationRepository.addMember({
      userId: params.userId,
      organizationId,
      role: params.workspaceRole
    });
    if (error) throw error;
    const { members } = await this.organizationRepository.getTeam(organizationId);
    const added = members.find((m) => m.user_id === params.userId);
    await this._invalidateOrganizationRelatedCaches({ authUserId, organizationId });
    return added ?? { ...newMembership, email: null, full_name: null };
  }
  /** Remove a team member; requires admin/superadmin (and cannot remove higher role) or self-remove. */
  async removeTeamMember(authUserId, organizationId, targetUserId) {
    const userId = await this.resolveAuthUserToUserId(authUserId);
    const { membership: myMembership } = await this.organizationRepository.findMembership(
      userId,
      organizationId
    );
    if (!myMembership || myMembership.disabled) {
      throw new OrganizationNotFoundError(organizationId);
    }
    const isSelf = userId === targetUserId;
    if (isSelf) {
      await this.organizationRepository.removeMember(targetUserId, organizationId);
      await this._invalidateOrganizationRelatedCaches({ authUserId, organizationId });
      return;
    }
    if (this.getRoleLevel(myMembership.role) < 1) {
      throw new OrganizationForbiddenError("Only admins can remove team members");
    }
    const { membership: targetMembership } = await this.organizationRepository.findMembership(
      targetUserId,
      organizationId
    );
    if (!targetMembership) {
      throw new OrganizationNotFoundError("User is not a member of this organization");
    }
    if (this.getRoleLevel(targetMembership.role) >= this.getRoleLevel(myMembership.role)) {
      throw new OrganizationForbiddenError("You cannot remove a member with equal or higher role");
    }
    const { error } = await this.organizationRepository.removeMember(targetUserId, organizationId);
    if (error) throw error;
    await this._invalidateOrganizationRelatedCaches({ authUserId, organizationId });
  }
  /** Delete organization; requires superadmin. */
  async deleteOrganization(authUserId, organizationId) {
    const userId = await this.resolveAuthUserToUserId(authUserId);
    const { membership } = await this.organizationRepository.findMembership(userId, organizationId);
    if (!membership || membership.disabled) {
      throw new OrganizationNotFoundError(organizationId);
    }
    if (membership.role !== "superadmin") {
      throw new OrganizationForbiddenError("Only the organization superadmin can delete it");
    }
    const { error } = await this.organizationRepository.deleteOrganization(organizationId);
    if (error) throw error;
    await this._invalidateOrganizationRelatedCaches({ authUserId, organizationId });
  }
  /** Rotate API key; requires admin or superadmin. Returns row; controller maps to DTO. */
  async rotateApiKey(authUserId, organizationId) {
    const userId = await this.resolveAuthUserToUserId(authUserId);
    const { membership } = await this.organizationRepository.findMembership(userId, organizationId);
    if (!membership || membership.disabled) {
      throw new OrganizationNotFoundError(organizationId);
    }
    if (this.getRoleLevel(membership.role) < 1) {
      throw new OrganizationForbiddenError("Only admins can rotate the API key");
    }
    const { organization, error } = await this.organizationRepository.rotateApiKey(organizationId);
    if (error) throw error;
    if (!organization) throw new OrganizationNotFoundError(organizationId);
    await this._invalidateOrganizationRelatedCaches({ authUserId, organizationId });
    return organization;
  }
  /**
   * Invalidate caches for list (listMyOrganizations) and by-id (getOrganizationById).
   * Uses same keys as read: ORG_LIST_BYUSERID:authUserId, ORG_BY_IDS:authUserId:organizationId.
   */
  async _invalidateOrganizationRelatedCaches(params) {
    if (!this.cacheInvalidator) return;
    const { authUserId, organizationId } = params;
    try {
      if (authUserId) {
        await this.cacheInvalidator.invalidateKey(
          `${CACHE_KEYS5.ORG_LIST_BYUSERID}:${authUserId}`
        );
      }
      if (organizationId) {
        if (authUserId) {
          await this.cacheInvalidator.invalidateKey(
            `${CACHE_KEYS5.ORG_BY_IDS}:${authUserId}:${organizationId}`
          );
        }
        await this.cacheInvalidator.invalidatePattern(
          `${CACHE_KEYS5.ORG_BY_IDS}:*:${organizationId}`
        );
      }
      logger.debug({
        msg: "Invalidated organization related caches",
        authUserId,
        organizationId
      });
    } catch (error) {
      logger.error({
        msg: "Error invalidating organization related caches",
        authUserId,
        organizationId,
        error: String(error)
      });
    }
  }
};

// services/FeedbackService.ts
init_Logger();
var CACHE_KEYS6 = {
  FEEDBACK: "feedback",
  FEEDBACK_LIST_ALL: "feedback:list:all"
};
var FEEDBACK_CACHE_TTL_SEC = 300;
var FeedbackService = class {
  constructor(feedbackRepository2, cache, cacheInvalidator) {
    this.feedbackRepository = feedbackRepository2;
    this.cache = cache;
    this.cacheInvalidator = cacheInvalidator;
  }
  async createFeedback(feedback) {
    const feedbackId = await this.feedbackRepository.insert(feedback);
    await this._invalidateFeedbackRelatedCaches();
    return feedbackId;
  }
  async updateFeedbackIsHandled(feedbackId, isHandled) {
    const updatedFeedbackId = await this.feedbackRepository.updateIsHandled(
      feedbackId,
      isHandled
    );
    await this._invalidateFeedbackRelatedCaches();
    return updatedFeedbackId;
  }
  /** Returns repository row shape; controller maps to DTO just before response. */
  async getAllFeedbacks() {
    const cacheKey = CACHE_KEYS6.FEEDBACK_LIST_ALL;
    const factory = async () => {
      logger.debug({ msg: "Getting all feedback from repository" });
      const list = await this.feedbackRepository.findAll();
      logger.info({ msg: "All feedback retrieved successfully", count: list.length });
      return list;
    };
    if (this.cache) {
      return this.cache.getOrSet(cacheKey, factory, FEEDBACK_CACHE_TTL_SEC);
    }
    return factory();
  }
  /**
   * Invalidate caches used by getAllFeedbacks (same key: FEEDBACK_LIST_ALL).
   */
  async _invalidateFeedbackRelatedCaches() {
    if (!this.cacheInvalidator) return;
    try {
      await this.cacheInvalidator.invalidateKey(CACHE_KEYS6.FEEDBACK_LIST_ALL);
      await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS6.FEEDBACK}:list:*`);
      logger.debug({ msg: "Invalidated feedback related caches" });
    } catch (error) {
      logger.error({
        msg: "Error invalidating feedback related caches",
        error: String(error)
      });
    }
  }
};

// services/BlogService.ts
init_Logger();

// utils/valueObjects/BlogPostId.ts
var BlogPostId = class _BlogPostId {
  _value;
  constructor(value) {
    const trimmed = value?.trim();
    if (!trimmed || !_BlogPostId.isValid(trimmed)) {
      throw new ValidationError(`Invalid blog post ID: ${value ?? ""}`);
    }
    this._value = trimmed;
    Object.freeze(this);
  }
  get value() {
    return this._value;
  }
  static isValid(id) {
    return typeof id === "string" && isValidUUID(id.trim());
  }
  /**
   * Create a BlogPostId or return null if invalid (Listing-style factory).
   */
  static create(id) {
    try {
      return new _BlogPostId(id);
    } catch {
      return null;
    }
  }
  toString() {
    return this._value;
  }
};

// services/BlogService.ts
var CACHE_KEYS7 = {
  BLOG: "blog",
  BLOG_BYID: "blog:byBlogId",
  BLOG_PUBLISHED: "blog:published:blog",
  BLOG_PUBLISHED_BY_SLUG: "blog:published:bySlug",
  BLOG_PUBLISHED_AUTHORS: "blog:published:authors",
  /** Public metadata shown in the blog overview (from public.module_configs). */
  BLOG_INFORMATION: "config:module:blog:information",
  /** Admin list (all posts); cache key built from options via buildAdminBlogCacheKey; invalidate pattern blog:admin:list:* */
  BLOG_ADMIN_LIST: "blog:admin:list",
  /** Admin list (all comments); cache key built from options via buildAdminBlogCommentsCacheKey; invalidate pattern blog:admin:comments:list:* */
  BLOG_ADMIN_COMMENTS_LIST: "blog:admin:comments:list",
  /** Admin list (all activities); cache key via buildAdminBlogActivitiesCacheKey; tag BLOG_ACTIVITIES_CACHE; invalidate pattern blog:admin:activities:list:* */
  BLOG_ADMIN_ACTIVITIES_LIST: "blog:admin:activities:list",
  /** All blog topics list (id, name, slug); invalidated on topic create/update */
  BLOG_TOPICS_LIST: "blog:topics:list",
  /** Active blog topics (with post_count); same scope as BLOG_POSTS_CACHE — invalidated on post or topic create/update */
  BLOG_ACTIVE_TOPICS: "blog:topics:active",
  /** Comments for a post; key blog:comments:byPostId:${postId}; invalidated on comment create/update for that post */
  BLOG_COMMENTS_POST: "blog:comments:byPostId"
};
var BLOG_CACHE_TTL_SEC = 300;
var BlogService = class {
  constructor(blogRepository3, cache, cacheInvalidator, configRepository2) {
    this.blogRepository = blogRepository3;
    this.cache = cache;
    this.cacheInvalidator = cacheInvalidator;
    this.configRepository = configRepository2;
  }
  /**
   * Public blog overview metadata (from public.module_configs where module_name = 'blog').
   * Used for SSR SEO (title/description/keywords).
   */
  async getBlogInformation() {
    const moduleName = "blog";
    const properties = [
      "BLOG_POST_SEO_META_TITLE",
      "BLOG_POST_SEO_META_DESCRIPTION",
      "BLOG_POST_SEO_META_TAGS"
    ];
    const cacheKey = CACHE_KEYS7.BLOG_INFORMATION;
    const factory = async () => {
      if (!this.configRepository) return {};
      const { result } = await this.configRepository.getConfigByModuleNameAndProperties({
        moduleName,
        properties
      });
      return result;
    };
    if (this.cache) {
      return this.cache.getOrSet(cacheKey, factory, BLOG_CACHE_TTL_SEC);
    }
    return factory();
  }
  /**
   * Get a single blog post by id. Used for edit/detail (authorized by route).
   * Caller must ensure the user is allowed to read (owner or editor/admin).
   * Uses cache when available; invalidator clears by-id key on create/update (Listing-style).
   */
  async getBlogPostById(id) {
    const idVO = id instanceof BlogPostId ? id : BlogPostId.create(id);
    if (!idVO) {
      throw new ValidationError(`Invalid blog post ID: ${id}`);
    }
    const cacheKey = `${CACHE_KEYS7.BLOG_BYID}:${idVO.value}`;
    const factory = async () => {
      logger.debug({ msg: "Getting blog post by ID", blogPostId: idVO.value });
      const { data } = await this.blogRepository.findBlogPostByBlogId(idVO.value);
      return data;
    };
    if (this.cache) {
      return this.cache.getOrSet(cacheKey, factory, BLOG_CACHE_TTL_SEC);
    }
    return factory();
  }
  /**
   * Get published blog posts with filters (limit, skipId, skip, searchTerm, topicId, sortByKey, sortByOrder, range, authorId).
   */
  async getPublishedBlogPosts(options) {
    const normalizedOptions = {
      limit: options.limit ?? 10,
      skipId: options.skipId ?? null,
      skip: options.skip ?? 0,
      searchTerm: options.searchTerm ?? null,
      topicId: options.topicId ?? null,
      sortByKey: options.sortByKey ?? "published_at",
      sortByOrder: options.sortByOrder ?? false,
      range: options.range ?? null,
      authorId: options.authorId ?? null
    };
    const cacheKey = buildPublishedBlogCacheKey(normalizedOptions, CACHE_KEYS7.BLOG_PUBLISHED);
    const factory = async () => {
      logger.debug({ msg: "Getting published blog posts", options: normalizedOptions });
      const { data: postsResult, count: countResult } = await this.blogRepository.findPublishedBlogPosts(normalizedOptions);
      return { postsResult, countResult };
    };
    if (this.cache) {
      return this.cache.getOrSet(cacheKey, factory, BLOG_CACHE_TTL_SEC);
    }
    return factory();
  }
  /**
   * Get all blog posts for admin listing (no published/approved filter).
   * Cached per options (same TTL as published); invalidated on blog create/update via pattern blog:admin:list:*.
   */
  async getAdminBlogPosts(options) {
    const normalizedOptions = {
      limit: options.limit ?? 10,
      searchTerm: options.searchTerm ?? null,
      topicId: options.topicId ?? null,
      sortByKey: options.sortByKey ?? "created_at",
      sortByOrder: options.sortByOrder ?? false,
      range: options.range ?? null
    };
    const cacheKey = buildAdminBlogCacheKey(normalizedOptions, CACHE_KEYS7.BLOG_ADMIN_LIST);
    const factory = async () => {
      logger.debug({ msg: "Getting admin blog posts", options: normalizedOptions });
      const { data: postsResult, count: countResult } = await this.blogRepository.findAdminBlogPosts(normalizedOptions);
      return { postsResult, countResult };
    };
    if (this.cache) {
      return this.cache.getOrSet(cacheKey, factory, BLOG_CACHE_TTL_SEC);
    }
    return factory();
  }
  /**
   * Get all blog comments for admin listing (no approved filter).
   * Cached per options; invalidated on comment create/update/approve via pattern blog:admin:comments:list:*.
   */
  async getAdminBlogComments(options) {
    const normalizedOptions = {
      limit: options.limit ?? 10,
      searchTerm: options.searchTerm ?? null,
      sortByKey: options.sortByKey ?? "created_at",
      sortByOrder: options.sortByOrder ?? false,
      range: options.range ?? null
    };
    const cacheKey = buildAdminBlogCommentsCacheKey(normalizedOptions, CACHE_KEYS7.BLOG_ADMIN_COMMENTS_LIST);
    const factory = async () => {
      logger.debug({ msg: "Getting admin blog comments", options: normalizedOptions });
      const { data: commentsResult, count: countResult } = await this.blogRepository.findAdminBlogComments(normalizedOptions);
      return { commentsResult, countResult };
    };
    if (this.cache) {
      return this.cache.getOrSet(cacheKey, factory, BLOG_CACHE_TTL_SEC);
    }
    return factory();
  }
  /**
   * Get all blog activities for admin listing. Cached per options; tag BLOG_ACTIVITIES_CACHE.
   * Invalidated on any trackBlogActivity (pattern blog:admin:activities:list:*).
   */
  async getAdminBlogActivities(options) {
    const normalizedOptions = {
      limit: options.limit ?? 10,
      sortByKey: options.sortByKey ?? "created_at",
      sortByOrder: options.sortByOrder ?? false,
      range: options.range ?? null,
      post_id: options.post_id ?? null,
      activity_type: options.activity_type ?? null
    };
    const cacheKey = buildAdminBlogActivitiesCacheKey(
      normalizedOptions,
      CACHE_KEYS7.BLOG_ADMIN_ACTIVITIES_LIST
    );
    const factory = async () => {
      logger.debug({ msg: "Getting admin blog activities", options: normalizedOptions });
      const { data: activitiesResult, count: countResult } = await this.blogRepository.findAdminBlogActivities(normalizedOptions);
      return { activitiesResult, countResult };
    };
    if (this.cache) {
      return this.cache.getOrSet(cacheKey, factory, BLOG_CACHE_TTL_SEC);
    }
    return factory();
  }
  /**
   * Record a blog activity (view, like, share, comment). user_id may be null for anonymous.
   * Invalidates BLOG_ACTIVITIES_CACHE (pattern blog:admin:activities:list:*). Ported from template trackBlogActivity.
   */
  async trackBlogActivity(postId, activityType, userId) {
    await this.blogRepository.insertBlogActivity(postId, activityType, userId);
    await this._invalidateBlogActivitiesCaches();
  }
  /**
   * Get all users who have at least one published and approved blog post.
   * Uses RPC get_published_blog_authors; profile fields come from user_profiles.
   * Cached; invalidated on blog create/update (Listing-style).
   */
  async getPublishedBlogAuthors() {
    const cacheKey = CACHE_KEYS7.BLOG_PUBLISHED_AUTHORS;
    const factory = async () => {
      logger.debug({ msg: "Getting published blog authors" });
      const { data } = await this.blogRepository.getPublishedBlogAuthors();
      return data;
    };
    if (this.cache) {
      return this.cache.getOrSet(cacheKey, factory, BLOG_CACHE_TTL_SEC);
    }
    return factory();
  }
  /**
   * Get a single published blog post by slug (public). Returns null if not found.
   * Cached per slug; slug caches invalidated on any blog create/update (Listing-style).
   */
  async getPublishedBlogPostBySlug(slug) {
    const cacheKey = `${CACHE_KEYS7.BLOG_PUBLISHED_BY_SLUG}:${slug}`;
    const factory = async () => {
      const { data } = await this.blogRepository.findPublishedBlogPostBySlug(slug);
      return data;
    };
    if (this.cache) {
      return this.cache.getOrSet(cacheKey, factory, BLOG_CACHE_TTL_SEC);
    }
    return factory();
  }
  /**
   * Get all blog topics (id, name, slug) for dropdowns and topic list.
   * Cached; invalidated on topic create/update.
   */
  async getBlogTopics() {
    const cacheKey = CACHE_KEYS7.BLOG_TOPICS_LIST;
    const factory = async () => {
      logger.debug({ msg: "Getting blog topics" });
      const { data } = await this.blogRepository.findBlogTopics();
      return data;
    };
    if (this.cache) {
      return this.cache.getOrSet(cacheKey, factory, BLOG_CACHE_TTL_SEC);
    }
    return factory();
  }
  /**
   * Get active blog topics (topics that have at least one published post) with post_count.
   * Cached; invalidated on post or topic create/update (same scope as template BLOG_POSTS_CACHE).
   */
  async getActiveBlogTopics() {
    const cacheKey = CACHE_KEYS7.BLOG_ACTIVE_TOPICS;
    const factory = async () => {
      logger.debug({ msg: "Getting active blog topics" });
      const { data } = await this.blogRepository.findActiveBlogTopics();
      return data;
    };
    if (this.cache) {
      return this.cache.getOrSet(cacheKey, factory, BLOG_CACHE_TTL_SEC);
    }
    return factory();
  }
  /**
   * Create a blog post. Requires editor or admin role (enforced by route).
   * Returns id, title, slug and approval flags. Fetches saved post for cache invalidation (Listing-style).
   */
  async createBlogPost(post, userId, isSuperAdmin) {
    const slug = stringToSlug(post.title);
    const isUserApproved = post.is_user_published === true;
    const isAdminApproved = isSuperAdmin && isUserApproved;
    const createPayload = {
      ...post,
      is_user_published: isUserApproved,
      is_admin_approved: isAdminApproved
    };
    const { savedBlogPostId, isAdminApproved: approvedByAdmin, isUserApproved: approvedByUser } = await this.blogRepository.createOne(
      createPayload,
      userId,
      slug,
      isAdminApproved
    );
    const { data: savedPost } = await this.blogRepository.findBlogPostByBlogId(savedBlogPostId);
    await this._invalidatePostMutationCaches({ postId: savedBlogPostId });
    return {
      id: savedBlogPostId,
      title: savedPost.title,
      slug: savedPost.slug,
      isAdminApproved: approvedByAdmin,
      isUserApproved: approvedByUser
    };
  }
  /**
   * Update a blog post. Requires editor or admin role (enforced by route).
   * Post must contain id (controller merges from URL or body). No id validation here—same as updateListing; repo/DB surfaces errors.
   */
  async updateBlogPost(post, isSuperAdmin) {
    const isUserApproved = post.is_user_published === true;
    const isAdminApproved = isSuperAdmin && isUserApproved;
    const slug = stringToSlug(post.title);
    const updatePayload = {
      ...post,
      is_user_published: isUserApproved,
      is_admin_approved: isAdminApproved
    };
    const { savedBlogPostId } = await this.blogRepository.updateOne(
      post.id,
      updatePayload,
      slug,
      isAdminApproved,
      (/* @__PURE__ */ new Date()).toISOString()
    );
    const { data: savedPost } = await this.blogRepository.findBlogPostByBlogId(savedBlogPostId);
    await this._invalidatePostMutationCaches({ postId: savedBlogPostId });
    return {
      id: savedBlogPostId,
      title: savedPost.title,
      slug: savedPost.slug,
      isAdminApproved,
      isUserApproved
    };
  }
  /**
   * Create a blog topic. Requires editor or admin role (enforced by route).
   * Returns id and name. Duplicate name/slug throws ValidationError.
   * Invalidates topic list and post lists (they embed topic name/slug).
   */
  async createBlogTopic(payload) {
    const result = await this.blogRepository.createTopic(payload);
    await this._invalidateBlogTopicRelatedCaches();
    return result;
  }
  /**
   * Update a blog topic. Requires editor or admin role (enforced by route).
   * Topic must contain id (controller merges from URL or body). No id validation here—same as updateListing; repo/DB surfaces errors.
   */
  async updateBlogTopic(topic) {
    const result = await this.blogRepository.updateTopic(topic.id, topic);
    await this._invalidateBlogTopicRelatedCaches();
    return result;
  }
  /**
   * Create a blog comment. Any authenticated user (enforced by route).
   * Payload must contain post_id (schema refine enforces on create). No id validation here—repo/DB surfaces errors.
   * Invalidates the post's by-id cache so post detail (e.g. with comments) stays fresh.
   */
  async createBlogComment(payload, userId) {
    const postId = payload.post_id;
    const result = await this.blogRepository.createComment(
      { post_id: postId, parent_id: payload.parent_id ?? void 0, content: payload.content },
      userId
    );
    await this._invalidatePostCacheForComment({ postId });
    await this._invalidateAdminCommentsListCaches();
    await this.trackBlogActivity(postId, "comment", userId);
    return result;
  }
  /**
   * Update a blog comment. Comment must contain id (controller merges from URL or body). Owner-only (repo filters by user_id).
   * No id validation here—same as updateListing; repo/DB surfaces errors.
   * Invalidates the post's by-id cache so post detail (e.g. with comments) stays fresh.
   */
  async updateBlogComment(comment, userId) {
    const result = await this.blogRepository.updateComment(
      comment.id,
      userId,
      { content: comment.content }
    );
    if (result.post_id) {
      await this._invalidatePostCacheForComment({ postId: result.post_id });
    }
    await this._invalidateAdminCommentsListCaches();
    return { id: result.id };
  }
  /**
   * Approve a blog comment by id (admin/editor only; route enforces). Invalidates post and comments cache.
   */
  async approveBlogComment(commentId) {
    const result = await this.blogRepository.approveComment(commentId);
    if (result.post_id) {
      await this._invalidatePostCacheForComment({ postId: result.post_id });
    }
    await this._invalidateAdminCommentsListCaches();
    return { id: result.id };
  }
  /**
   * Delete a blog post by id (editor/admin only; route enforces). Invalidates post, lists, authors, topics, admin comments and activities (BLOG_POSTS_CACHE).
   * Ported from template deleteBlogPost.
   */
  async deleteBlogPost(postId) {
    await this.blogRepository.deleteBlogPost(postId);
    await this._invalidatePostMutationCaches({ postId });
    await this._invalidateAdminCommentsListCaches();
    await this._invalidateBlogActivitiesCaches();
  }
  /**
   * Delete a blog topic by id (editor/admin only). Fails if any post uses the topic or topic has children. Invalidates topic-related caches (BLOG_TOPICS_CACHE).
   * Ported from template deleteBlogTopic.
   */
  async deleteBlogTopic(topicId) {
    await this.blogRepository.deleteBlogTopic(topicId);
    await this._invalidateBlogTopicRelatedCaches();
  }
  /**
   * Delete a blog comment by id (editor/admin only; route enforces). Invalidates that post's cache and admin comments list (BLOG_COMMENTS_CACHE).
   * Ported from template deleteComment.
   */
  async deleteBlogComment(commentId) {
    const { post_id } = await this.blogRepository.deleteComment(commentId);
    await this._invalidatePostCacheForComment({ postId: post_id });
    await this._invalidateAdminCommentsListCaches();
  }
  /**
   * Get approved comments for a post (public). Cached per postId; invalidated when a comment is created or updated for that post.
   */
  async getPostComments(postId) {
    const cacheKey = `${CACHE_KEYS7.BLOG_COMMENTS_POST}:${postId}`;
    const factory = async () => {
      logger.debug({ msg: "Getting post comments", postId });
      const { data } = await this.blogRepository.findPostComments(postId);
      return data;
    };
    if (this.cache) {
      return this.cache.getOrSet(cacheKey, factory, BLOG_CACHE_TTL_SEC);
    }
    return factory();
  }
  /**
   * Invalidate caches when a blog post is created or updated.
   * Covers: post by-id, entity, published lists (and slug), authors, admin list, active topics.
   */
  async _invalidatePostMutationCaches(params) {
    if (!this.cacheInvalidator) return false;
    const { postId } = params;
    if (!postId) {
      logger.warn({ msg: "No post ID provided for blog cache invalidation", postId });
      return false;
    }
    await this.cacheInvalidator.invalidateKey(`${CACHE_KEYS7.BLOG_BYID}:${postId}`);
    await this.cacheInvalidator.invalidateEntity(CACHE_KEYS7.BLOG, postId);
    await this._invalidatePublishedAndAdminListCaches();
    await this.cacheInvalidator.invalidateKey(CACHE_KEYS7.BLOG_PUBLISHED_AUTHORS);
    await this.cacheInvalidator.invalidateKey(CACHE_KEYS7.BLOG_ACTIVE_TOPICS);
    logger.debug({ msg: "Invalidated caches for blog post mutation", postId });
    return true;
  }
  /**
   * Invalidate caches when a comment is created, updated, or approved.
   * Post by-id and that post's comments list, plus admin comments list pattern.
   */
  async _invalidatePostCacheForComment(params) {
    if (!this.cacheInvalidator) return;
    const { postId } = params;
    if (!postId) return;
    await this.cacheInvalidator.invalidateKey(`${CACHE_KEYS7.BLOG_BYID}:${postId}`);
    await this.cacheInvalidator.invalidateKey(`${CACHE_KEYS7.BLOG_COMMENTS_POST}:${postId}`);
    logger.debug({ msg: "Invalidated post and comments cache for comment", postId });
  }
  /**
   * Invalidate admin comments list caches (all keys under blog:admin:comments:list:*).
   * Called when any comment is created, updated, or approved.
   */
  async _invalidateAdminCommentsListCaches() {
    if (!this.cacheInvalidator) return;
    await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS7.BLOG_ADMIN_COMMENTS_LIST}:*`);
    logger.debug({ msg: "Invalidated admin comments list caches" });
  }
  /**
   * Invalidate admin activities list caches (BLOG_ACTIVITIES_CACHE; pattern blog:admin:activities:list:*).
   * Called when any activity is tracked (e.g. comment created, view, like, share).
   */
  async _invalidateBlogActivitiesCaches() {
    if (!this.cacheInvalidator) return;
    await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS7.BLOG_ADMIN_ACTIVITIES_LIST}:*`);
    logger.debug({ msg: "Invalidated admin blog activities list caches" });
  }
  /**
   * Invalidate caches when a topic is created or updated.
   * Topics list, active topics, and all published/admin list patterns (posts embed topic).
   */
  async _invalidateBlogTopicRelatedCaches() {
    if (!this.cacheInvalidator) return;
    await this.cacheInvalidator.invalidateKey(CACHE_KEYS7.BLOG_TOPICS_LIST);
    await this.cacheInvalidator.invalidateKey(CACHE_KEYS7.BLOG_ACTIVE_TOPICS);
    await this._invalidatePublishedAndAdminListCaches();
    logger.debug({ msg: "Invalidated blog topic related caches" });
  }
  /**
   * Shared: invalidate published post list patterns and admin list pattern.
   * Used by post mutation and topic mutation (both affect what appears in lists).
   */
  async _invalidatePublishedAndAdminListCaches() {
    if (!this.cacheInvalidator) return;
    await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS7.BLOG_PUBLISHED}:*`);
    await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS7.BLOG_PUBLISHED_BY_SLUG}:*`);
    await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS7.BLOG_ADMIN_LIST}:*`);
  }
};

// services/ConfigService.ts
var CACHE_KEYS8 = {
  CONFIG: "config",
  BLOG_INFORMATION: "config:module:blog:information"
};
var CONFIG_CACHE_TTL_SEC = 300;
var ConfigService = class {
  constructor(configRepository2, cache, cacheInvalidator) {
    this.configRepository = configRepository2;
    this.cache = cache;
    this.cacheInvalidator = cacheInvalidator;
  }
  async getModuleConfig(moduleName) {
    const cacheKey = `${CACHE_KEYS8.CONFIG}:${moduleName}`;
    const factory = async () => {
      const { data } = await this.configRepository.getConfigByModuleName(moduleName);
      return data.config ?? {};
    };
    if (this.cache) {
      return this.cache.getOrSet(cacheKey, factory, CONFIG_CACHE_TTL_SEC);
    }
    return factory();
  }
  async updateModuleConfig(params) {
    const { moduleName, newConfig } = params;
    const isSaved = await this.configRepository.updateConfigByModuleName({ moduleName, newConfig });
    if (isSaved) {
      await this.invalidateConfigRelatedCaches();
    }
    return { isSaved };
  }
  async invalidateConfigRelatedCaches() {
    if (!this.cacheInvalidator) return;
    await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS8.CONFIG}:*`);
    await this.cacheInvalidator.invalidateKey(CACHE_KEYS8.BLOG_INFORMATION);
  }
};

// services/index.ts
init_GlobalConfig();
var userService = new UserService(
  userRepository,
  cacheServiceConnection,
  rbacRepository,
  cacheInvalidationServiceConnection
);
var emailService = new EmailService({
  isEnabled: config.email?.enabled ?? false
});
var authenticationService = new AuthenticationService(
  supabaseServiceClientConnection,
  refreshTokenRepository,
  userRepository,
  userService
);
var organizationService = new OrganizationService(
  organizationRepository,
  userRepository,
  emailService,
  cacheServiceConnection,
  cacheInvalidationServiceConnection
);
var oauthService = new OAuthService(
  supabaseServiceClientConnection,
  userRepository,
  userService,
  organizationService
);
var companyService = new CompanyService(configRepository, cacheServiceConnection);
var marketingService = new MarketingService(configRepository, cacheServiceConnection);
var rbacService = new RbacService(
  rbacRepository,
  cacheServiceConnection,
  cacheInvalidationServiceConnection
);
var feedbackService = new FeedbackService(
  feedbackRepository,
  cacheServiceConnection,
  cacheInvalidationServiceConnection
);
var blogService = new BlogService(
  blogRepository,
  cacheServiceConnection,
  cacheInvalidationServiceConnection,
  configRepository
);
var configService = new ConfigService(
  configRepository,
  cacheServiceConnection,
  cacheInvalidationServiceConnection
);

// utils/generateBlogRSSFeed.ts
async function generateBlogRSSFeed(posts) {
  const companyInfo = await companyService.getCompanyInformationByProperties(["URL", "NAME"]);
  const marketingInfo = await marketingService.getMarketingInformationByProperties([
    "META_DESCRIPTION"
  ]);
  const URL2 = companyInfo.URL ?? "";
  const NAME = companyInfo.NAME ?? "Blog";
  const META_DESCRIPTION = marketingInfo.META_DESCRIPTION || `Latest blog posts from ${NAME}`;
  const URLtoIMAGES = `${process.env.PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog_images/`;
  const blogURL = `${URL2.replace(/\/$/, "")}/blog`;
  const feed$1 = new feed.Feed({
    title: `${NAME} Blog`,
    description: META_DESCRIPTION,
    id: blogURL,
    link: blogURL,
    language: "en",
    favicon: `${URL2.replace(/\/$/, "")}/favicon.ico`,
    copyright: `All rights reserved ${(/* @__PURE__ */ new Date()).getFullYear()}, ${NAME}`,
    generator: "Openquok Blog System",
    feedLinks: {
      rss2: `${blogURL}/rss.xml`,
      json: `${blogURL}/feed.json`,
      atom: `${blogURL}/atom.xml`
    }
  });
  posts.forEach((post) => {
    const author = Array.isArray(post.author) ? post.author[0] : post.author;
    const postUrl = `${blogURL}/${post.slug}`;
    feed$1.addItem({
      title: post.title,
      id: postUrl,
      link: postUrl,
      description: post.description ?? "",
      content: post.content ?? "",
      author: [
        {
          name: author?.full_name ?? "Anonymous",
          link: author?.website ?? void 0
        }
      ],
      date: post.published_at ? new Date(post.published_at) : /* @__PURE__ */ new Date(),
      image: post.hero_image_filename ? `${URLtoIMAGES}${post.hero_image_filename}` : void 0
    });
  });
  return {
    rss2: feed$1.rss2(),
    atom: feed$1.atom1(),
    json: feed$1.json1()
  };
}

// controllers/BlogController.ts
var BlogController = class {
  constructor(blogService2) {
    this.blogService = blogService2;
  }
  createBlogPost = async (req, res, next) => {
    try {
      const authReq = req;
      const userId = authReq.user?.publicId;
      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const isSuperAdmin = authReq.user?.isSuperAdmin === true;
      const result = await this.blogService.createBlogPost(
        req.body,
        userId,
        isSuperAdmin
      );
      res.status(201).json({
        success: true,
        data: { id: result.id },
        message: "Blog post created successfully"
      });
    } catch (err) {
      next(err);
    }
  };
  updateBlogPost = async (req, res, next) => {
    try {
      const authReq = req;
      if (!authReq.user?.publicId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const isSuperAdmin = authReq.user?.isSuperAdmin === true;
      const id = req.params.id;
      const post = { ...req.body, id };
      const result = await this.blogService.updateBlogPost(post, isSuperAdmin);
      res.status(200).json({
        success: true,
        data: { id: result.id },
        message: "Blog post updated successfully"
      });
    } catch (err) {
      next(err);
    }
  };
  createBlogTopic = async (req, res, next) => {
    try {
      const authReq = req;
      if (!authReq.user?.publicId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const result = await this.blogService.createBlogTopic(
        req.body
      );
      res.status(201).json({
        success: true,
        data: { id: result.id },
        message: "Blog topic created successfully"
      });
    } catch (err) {
      next(err);
    }
  };
  updateBlogTopic = async (req, res, next) => {
    try {
      const authReq = req;
      if (!authReq.user?.publicId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const id = req.params.id;
      const topic = { ...req.body, id };
      const result = await this.blogService.updateBlogTopic(topic);
      res.status(200).json({
        success: true,
        data: { id: result.id },
        message: "Blog topic updated successfully"
      });
    } catch (err) {
      next(err);
    }
  };
  /** Delete a blog post (editor/admin). Ported from template deleteBlogPost. Invalidates BLOG_POSTS_CACHE. */
  deleteBlogPost = async (req, res, next) => {
    try {
      const id = req.params.id;
      await this.blogService.deleteBlogPost(id);
      res.status(200).json({
        success: true,
        message: "Blog post has been deleted successfully."
      });
    } catch (err) {
      next(err);
    }
  };
  /** Delete a blog topic (editor/admin). Ported from template deleteBlogTopic. Fails if in use. Invalidates BLOG_TOPICS_CACHE. */
  deleteBlogTopic = async (req, res, next) => {
    try {
      const id = req.params.id;
      await this.blogService.deleteBlogTopic(id);
      res.status(200).json({
        success: true,
        message: "Blog topic has been deleted successfully."
      });
    } catch (err) {
      next(err);
    }
  };
  createBlogComment = async (req, res, next) => {
    try {
      const authReq = req;
      const userId = authReq.user?.publicId;
      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const result = await this.blogService.createBlogComment(
        req.body,
        userId
      );
      res.status(201).json({
        success: true,
        data: { id: result.id },
        message: "Blog comment created successfully"
      });
    } catch (err) {
      next(err);
    }
  };
  updateBlogComment = async (req, res, next) => {
    try {
      const authReq = req;
      const userId = authReq.user?.publicId;
      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const id = req.params.id;
      const comment = { ...req.body, id };
      const result = await this.blogService.updateBlogComment(comment, userId);
      res.status(200).json({
        success: true,
        data: { id: result.id },
        message: "Blog comment updated successfully"
      });
    } catch (err) {
      next(err);
    }
  };
  /** Approve a blog comment (admin only). Ported from template approveComment. */
  approveBlogComment = async (req, res, next) => {
    try {
      const commentId = req.params.id;
      const result = await this.blogService.approveBlogComment(commentId);
      res.status(200).json({
        success: true,
        data: { id: result.id },
        message: "Blog comment approved successfully"
      });
    } catch (err) {
      next(err);
    }
  };
  /** Delete a blog comment (editor/admin). Ported from template deleteComment. Invalidates BLOG_COMMENTS_CACHE. */
  deleteBlogComment = async (req, res, next) => {
    try {
      const commentId = req.params.id;
      await this.blogService.deleteBlogComment(commentId);
      res.status(200).json({
        success: true,
        message: "Comment has been deleted successfully."
      });
    } catch (err) {
      next(err);
    }
  };
  /** Public blog overview metadata (from public.module_configs; no auth required). */
  getBlogInformation = async (_req, res, next) => {
    try {
      const info = await this.blogService.getBlogInformation();
      res.status(200).json({
        success: true,
        data: info,
        message: "Blog information retrieved successfully"
      });
    } catch (err) {
      next(err);
    }
  };
  getBlogTopics = async (req, res, next) => {
    try {
      const topics = await this.blogService.getBlogTopics();
      res.status(200).json({
        success: true,
        data: topics,
        message: "Blog topics retrieved successfully"
      });
    } catch (err) {
      next(err);
    }
  };
  /** Public: active blog topics (with post_count). Ported from template getActiveBlogTopics. */
  getActiveBlogTopics = async (req, res, next) => {
    try {
      const topics = await this.blogService.getActiveBlogTopics();
      const dtos = BlogDTOMapper.toActiveBlogTopicDTOCollection(topics);
      res.status(200).json({
        success: true,
        data: dtos,
        message: "Active blog topics retrieved successfully"
      });
    } catch (err) {
      next(err);
    }
  };
  /** Public: approved comments for a post. Cached per postId; invalidated on comment create/update. */
  getPostComments = async (req, res, next) => {
    try {
      const postId = req.params.postId;
      const comments = await this.blogService.getPostComments(postId);
      const dtos = BlogDTOMapper.toCommentDTOCollection(comments);
      res.status(200).json({
        success: true,
        data: dtos,
        message: "Post comments retrieved successfully"
      });
    } catch (err) {
      next(err);
    }
  };
  /**
   * Track blog activity (view, like, share, comment). Auth optional: user_id recorded when authenticated.
   * Ported from template trackBlogActivity; supports UI triggers for like, view, share.
   */
  trackBlogActivity = async (req, res, next) => {
    try {
      const authReq = req;
      const postId = req.params.postId;
      const body = req.body;
      const userId = authReq.user?.publicId ?? null;
      await this.blogService.trackBlogActivity(postId, body.activity_type, userId);
      res.status(200).json({
        success: true,
        data: { success: true },
        message: "Blog activity recorded successfully"
      });
    } catch (err) {
      next(err);
    }
  };
  getBlogPostById = async (req, res, next) => {
    try {
      const id = req.params.id;
      const post = await this.blogService.getBlogPostById(id);
      const dto = BlogDTOMapper.toDTO(post);
      res.status(200).json({
        success: true,
        data: dto,
        message: "Blog post fetched successfully"
      });
    } catch (err) {
      next(err);
    }
  };
  getPublishedBlogPostBySlug = async (req, res, next) => {
    try {
      const identifier = req.params.identifier;
      if (!identifier) {
        throw new ValidationError("Identifier is required");
      }
      const publishedPost = await this.blogService.getPublishedBlogPostBySlug(identifier);
      if (!publishedPost) {
        throw new DatabaseEntityNotFoundError("Blog post not found", { slug: identifier });
      }
      const dto = BlogDTOMapper.toDTO(publishedPost);
      res.status(200).json({
        success: true,
        data: dto,
        message: "Published blog post retrieved successfully"
      });
    } catch (err) {
      next(err);
    }
  };
  /**
   * Public list of authors who have at least one published and approved blog post.
   * Profile fields (avatar_url, website, tag_line) come from user_profiles.
   */
  getPublishedBlogAuthors = async (req, res, next) => {
    try {
      const authors = await this.blogService.getPublishedBlogAuthors();
      const dtos = BlogDTOMapper.toPublishedBlogAuthorDTOCollection(authors);
      res.status(200).json({
        success: true,
        data: dtos,
        message: "Published blog authors retrieved successfully"
      });
    } catch (err) {
      next(err);
    }
  };
  /**
   * Public published blog posts list with filters (limit, skipId, skip, searchTerm, topicId, sortByKey, sortByOrder, range, authorId).
   * Expects req.parsedQuery (ParsedPublishedBlogPostsQuery) from createPublishedBlogPostsParser middleware.
   */
  getPublishedBlogPosts = async (req, res, next) => {
    try {
      const parsedQuery = req.parsedQuery;
      const opts = parsedQuery ?? {};
      const limit = opts.limit ?? 10;
      const result = await this.blogService.getPublishedBlogPosts({
        limit: Number.isNaN(Number(limit)) ? 10 : Math.min(Math.max(Number(limit), 1), 100),
        skipId: opts.skipId ?? null,
        skip: opts.skip ?? 0,
        searchTerm: opts.searchTerm ?? null,
        topicId: opts.topicId ?? null,
        sortByKey: opts.sortByKey ?? void 0,
        sortByOrder: opts.sortByOrder ?? false,
        range: opts.range ?? null,
        authorId: opts.authorId ?? null
      });
      if (!result) {
        res.status(404).json({
          success: false,
          message: "Published blog posts not found"
        });
        return;
      }
      const { postsResult, countResult } = result;
      const listingDtos = BlogDTOMapper.toDTOCollection(postsResult);
      res.status(200).json({
        success: true,
        data: {
          postsResult: listingDtos,
          countResult
        },
        message: "Published blog posts retrieved successfully"
      });
    } catch (err) {
      next(err);
    }
  };
  /**
   * Admin list of all blog posts (no published/approved filter).
   * Expects req.parsedQuery (ParsedAdminBlogPostsQuery) from createAdminBlogPostsParser middleware.
   * Requires admin or super admin.
   */
  getAdminBlogPosts = async (req, res, next) => {
    try {
      const parsedQuery = req.parsedQuery;
      const opts = parsedQuery ?? {};
      const limit = opts.limit ?? 10;
      const result = await this.blogService.getAdminBlogPosts({
        limit: Number.isNaN(Number(limit)) ? 10 : Math.min(Math.max(Number(limit), 1), 100),
        searchTerm: opts.searchTerm ?? null,
        topicId: opts.topicId ?? null,
        sortByKey: opts.sortByKey ?? void 0,
        sortByOrder: opts.sortByOrder ?? false,
        range: opts.range ?? null
      });
      const { postsResult, countResult } = result;
      const listingDtos = BlogDTOMapper.toDTOCollection(postsResult);
      res.status(200).json({
        success: true,
        data: {
          postsResult: listingDtos,
          countResult
        },
        message: "Admin blog posts retrieved successfully"
      });
    } catch (err) {
      next(err);
    }
  };
  /**
   * Admin list of all blog comments (no approved filter).
   * Expects req.parsedQuery (ParsedAdminBlogCommentsQuery) from createAdminBlogCommentsParser middleware.
   * Ported from template getAdminBlogComments.
   */
  getAdminBlogComments = async (req, res, next) => {
    try {
      const parsedQuery = req.parsedQuery;
      const opts = parsedQuery ?? {};
      const limit = opts.limit ?? 10;
      const result = await this.blogService.getAdminBlogComments({
        limit: Number.isNaN(Number(limit)) ? 10 : Math.min(Math.max(Number(limit), 1), 100),
        searchTerm: opts.searchTerm ?? null,
        sortByKey: opts.sortByKey ?? void 0,
        sortByOrder: opts.sortByOrder ?? false,
        range: opts.range ?? null
      });
      const { commentsResult, countResult } = result;
      const dtos = BlogDTOMapper.toAdminBlogCommentDTOCollection(commentsResult);
      res.status(200).json({
        success: true,
        data: {
          commentsResult: dtos,
          countResult
        },
        message: "Admin blog comments retrieved successfully"
      });
    } catch (err) {
      next(err);
    }
  };
  /**
   * GET admin blog activities list. Ported from template getAdminBlogActivities.
   * Requires editor, admin or super admin. Cache tag: BLOG_ACTIVITIES_CACHE.
   */
  getAdminBlogActivities = async (req, res, next) => {
    try {
      const parsedQuery = req.parsedQuery;
      const opts = parsedQuery ?? {};
      const limit = opts.limit ?? 10;
      const activityType = opts.activity_type ?? null;
      const validType = activityType && ["view", "like", "share", "comment"].includes(activityType) ? activityType : null;
      const result = await this.blogService.getAdminBlogActivities({
        limit: Number.isNaN(Number(limit)) ? 10 : Math.min(Math.max(Number(limit), 1), 100),
        sortByKey: opts.sortByKey ?? void 0,
        sortByOrder: opts.sortByOrder ?? false,
        range: opts.range ?? null,
        post_id: opts.post_id ?? null,
        activity_type: validType
      });
      const { activitiesResult, countResult } = result;
      const dtos = BlogDTOMapper.toAdminBlogActivityDTOCollection(activitiesResult);
      res.status(200).json({
        success: true,
        data: {
          activitiesResult: dtos,
          countResult
        },
        message: "Admin blog activities retrieved successfully"
      });
    } catch (err) {
      next(err);
    }
  };
  /**
   * RSS/Atom/JSON feed. Uses parsed query when available (same filters as getPublishedBlogPosts); default limit 20 for feed.
   */
  getRSSFeed = async (req, res, next) => {
    try {
      const format = req.query.format ?? "rss";
      const parsedQuery = req.parsedQuery;
      const opts = parsedQuery ?? {};
      const limitParam = opts.limit ?? 20;
      const limit = Number.isNaN(Number(limitParam)) ? 20 : Math.min(Math.max(Number(limitParam), 1), 100);
      const result = await this.blogService.getPublishedBlogPosts({
        limit,
        skipId: opts.skipId ?? null,
        skip: opts.skip ?? 0,
        searchTerm: opts.searchTerm ?? null,
        topicId: opts.topicId ?? null,
        sortByKey: opts.sortByKey ?? void 0,
        sortByOrder: opts.sortByOrder ?? false,
        range: opts.range ?? null,
        authorId: opts.authorId ?? null
      });
      const posts = result?.postsResult ?? [];
      const feed = await generateBlogRSSFeed(posts);
      let contentType = "application/xml";
      let content = feed.rss2;
      switch (format) {
        case "atom":
          content = feed.atom;
          break;
        case "json":
          content = feed.json;
          contentType = "application/json";
          break;
        default:
          content = feed.rss2;
      }
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.status(200).send(content);
    } catch (err) {
      next(err);
    }
  };
};
var ImageController = class {
  constructor(storageRepository2) {
    this.storageRepository = storageRepository2;
  }
  getByUrl = async (req, res, next) => {
    try {
      const { databaseName, imageUrl } = req.query;
      if (!imageUrl || !databaseName) {
        throw new UserValidationError("ImageUrl and databaseName are required");
      }
      if (!isAllowedDatabaseName(databaseName)) {
        throw new UserValidationError("Invalid databaseName");
      }
      const { data } = await this.storageRepository.downloadImage(databaseName, imageUrl);
      if (!data) {
        throw new Error("No data returned from storage");
      }
      const buffer = data instanceof Buffer ? data : Buffer.from(await data.arrayBuffer());
      const contentType = data.type ?? "application/octet-stream";
      res.set("Content-Type", contentType);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  };
  /**
   * Uses Supabase auth user id from JWT (req.user.id), not body.uid.
   * Client `currentUser.id` from GET /users/me is public.users.id and may differ from auth.uid.
   */
  upload = async (req, res, next) => {
    try {
      const databaseName = req.body?.databaseName;
      const authUser = req.user;
      const authUid = authUser?.id;
      if (!req.file || !databaseName) {
        throw new UserValidationError("Image file and databaseName are required");
      }
      if (!authUid) {
        throw new UserValidationError("Authentication required");
      }
      if (!isAllowedDatabaseName(databaseName)) {
        throw new UserValidationError("Invalid databaseName");
      }
      const filePath = await this.storageRepository.uploadImage(
        databaseName,
        req.file,
        authUid
      );
      res.status(200).json({
        success: true,
        data: { filePath },
        message: "Image uploaded successfully"
      });
    } catch (error) {
      next(error);
    }
  };
  delete = async (req, res, next) => {
    try {
      const { databaseName, imagePath } = req.body ?? {};
      if (!imagePath || !databaseName) {
        throw new UserValidationError("ImagePath and databaseName are required");
      }
      if (!isAllowedDatabaseName(databaseName)) {
        throw new UserValidationError("Invalid databaseName");
      }
      await this.storageRepository.deleteImage(databaseName, imagePath);
      res.status(200).json({
        success: true,
        message: "Image deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  };
  proxyImage = async (req, res, next) => {
    try {
      const { url } = req.query;
      if (!url || typeof url !== "string") {
        throw new UserValidationError("URL parameter is required");
      }
      const imageUrl = new URL(url);
      if (!["http:", "https:"].includes(imageUrl.protocol)) {
        throw new UserValidationError("Invalid URL protocol. Only HTTP and HTTPS are allowed.");
      }
      const httpModule = imageUrl.protocol === "https:" ? https__default.default : http__default.default;
      await new Promise((resolve, reject) => {
        const request = httpModule.get(
          url,
          {
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; ImageProxy/1.0)"
            },
            timeout: 1e4
          },
          (response) => {
            if (response.statusCode && response.statusCode >= 400) {
              reject(new Error(`Failed to fetch image: ${response.statusCode} ${response.statusMessage}`));
              return;
            }
            const contentType = response.headers["content-type"];
            if (!contentType || !contentType.startsWith("image/")) {
              reject(new UserValidationError("URL does not point to a valid image"));
              return;
            }
            res.set("Content-Type", contentType);
            res.set("Cache-Control", "public, max-age=3600");
            response.pipe(res);
            response.on("end", () => resolve());
          }
        );
        request.on("error", (error) => reject(error));
        request.on("timeout", () => {
          request.destroy();
          reject(new Error("Request timeout"));
        });
      });
    } catch (error) {
      next(error);
    }
  };
};

// controllers/ConfigController.ts
var ConfigController = class {
  constructor(configService2) {
    this.configService = configService2;
  }
  getModuleConfig = async (req, res, next) => {
    try {
      const moduleName = String(req.query.moduleName ?? "");
      const moduleConfig = await this.configService.getModuleConfig(moduleName);
      res.status(200).json({
        success: true,
        data: moduleConfig,
        message: "Module config fetched successfully"
      });
    } catch (error) {
      next(error);
    }
  };
  updateModuleConfig = async (req, res, next) => {
    try {
      const { moduleName, newConfig } = req.body;
      const resultPm = await this.configService.updateModuleConfig({ moduleName, newConfig });
      res.status(200).json({
        success: true,
        data: resultPm,
        message: "Module config updated successfully"
      });
    } catch (error) {
      next(error);
    }
  };
};

// controllers/index.ts
var authController = new AuthController(authenticationService, userRepository, emailService, oauthService, organizationService);
var userController = new UserController(userService, authenticationService, emailService);
var companyController = new CompanyController(companyService, marketingService);
var settingsController = new SettingsController(organizationService);
var rbacController = new RbacController(rbacService, userRepository);
var feedbackController = new FeedbackController(feedbackService);
var blogController = new BlogController(blogService);
var imageController = new ImageController(storageRepository);
var configController = new ConfigController(configService);

// errors/RequestError.ts
var RequestError = class extends Error {
  statusCode = 400;
  errorList;
  constructor(errorList) {
    super("Request validation failed");
    this.name = "RequestError";
    this.errorList = errorList;
  }
};

// middlewares/validateRequest.ts
function convertToErrorList(fieldErrors) {
  const errorList = [];
  Object.entries(fieldErrors).forEach(([key, value]) => {
    const first = value?.[0];
    if (first) errorList.push({ param: key, type: first });
  });
  return errorList;
}
function concatErrors(errorList, parsedError) {
  const { fieldErrors } = parsedError.flatten((i) => i.code);
  return errorList.concat(convertToErrorList(fieldErrors));
}
var validateRequest = (schemas) => (req, _res, next) => {
  let errorList = [];
  if (schemas.params) {
    const parsed = schemas.params.safeParse(req.params);
    if (!parsed.success) errorList = concatErrors(errorList, parsed.error);
  }
  if (schemas.query) {
    const parsed = schemas.query.safeParse(req.query);
    if (!parsed.success) errorList = concatErrors(errorList, parsed.error);
  }
  if (schemas.body) {
    const parsed = schemas.body.safeParse(req.body);
    if (!parsed.success) errorList = concatErrors(errorList, parsed.error);
  }
  if (errorList.length) {
    next(new RequestError(errorList));
    return;
  }
  next();
};

// data/schemas/authSchemas.ts
var emailRequirements = zod.z.string().email({ message: "Please enter a valid email." }).trim();
var passwordRequirements = zod.z.string().min(8, { message: "Password must be at least 8 characters long." }).max(72, { message: "Password must be at most 72 characters long." }).trim();
var fullNameRequirements = zod.z.string().min(2, { message: "Full name must be at least 2 characters long." }).max(100, { message: "Full name must be at most 100 characters long." }).trim();
var codeRequirements = zod.z.string().min(6, { message: "Code must be at least 6 characters long." }).max(6, { message: "Code must be at most 6 characters long." }).trim();
var tokenRequirements = zod.z.string().regex(/^[a-f0-9]{64}$/i, { message: "Token must be a 32-byte hex string." });
var SignUpFormSchema = zod.z.object({
  email: emailRequirements,
  password: passwordRequirements,
  fullName: fullNameRequirements.optional()
});
var validateSignUpRequest = validateRequest({ body: SignUpFormSchema });
var SignInFormSchema = zod.z.object({
  email: emailRequirements,
  password: passwordRequirements
});
var validateSignInRequest = validateRequest({ body: SignInFormSchema });
var ResetPasswordSchema = zod.z.object({
  email: emailRequirements
});
var validateResetPasswordRequest = validateRequest({ body: ResetPasswordSchema });
var VerifyResetSchema = zod.z.object({
  email: emailRequirements,
  code: codeRequirements,
  type: zod.z.string()
});
var validateVerifyResetRequest = validateRequest({ query: VerifyResetSchema });
var TokenAndEmailSchema = zod.z.object({
  token: tokenRequirements,
  email: emailRequirements
});
var validateTokenAndEmailRequest = validateRequest({ query: TokenAndEmailSchema });
var EmailVerificationSchema = zod.z.object({
  token: tokenRequirements
});
var validateEmailVerificationRequest = validateRequest({ query: EmailVerificationSchema });
var EmailOnlySchema = zod.z.object({
  email: emailRequirements
});
var validateEmailRequest = validateRequest({ body: EmailOnlySchema });
var RefreshTokenSchema = zod.z.object({
  refreshToken: zod.z.string().trim().min(1).optional()
}).passthrough();
var validateRefreshTokenRequest = validateRequest({ body: RefreshTokenSchema });
var authSchemas = {
  validateSignUpRequest,
  validateSignInRequest,
  validateResetPasswordRequest,
  validateVerifyResetRequest,
  validateRefreshTokenRequest,
  validateTokenAndEmailRequest,
  validateEmailVerificationRequest,
  validateEmailRequest
};
var authSchemas_default = authSchemas;

// routes/AuthRoute.ts
var authRouter = express2.Router();
authRouter.post("/sign-up", authSchemas_default.validateSignUpRequest, authController.signUp);
authRouter.post("/sign-in", authSchemas_default.validateSignInRequest, authController.signIn);
authRouter.post("/sign-out", authController.signOut);
authRouter.post("/refresh", authSchemas_default.validateRefreshTokenRequest, authController.refreshToken);
authRouter.get("/oauth/providers", authController.getOAuthProviders);
authRouter.get("/oauth/:provider", authController.getOAuthRedirectUrl);
authRouter.get("/oauth/:provider/callback", authController.getOAuthCallback);
authRouter.get(
  "/request-verify-signup",
  authSchemas_default.validateTokenAndEmailRequest,
  authController.requestSignupVerification
);
authRouter.get("/check-signup-verification", authController.checkSignupVerification);
authRouter.get(
  "/verify-signup",
  authSchemas_default.validateEmailVerificationRequest,
  authController.verifySignup
);
authRouter.post(
  "/send-verification-email",
  authSchemas_default.validateEmailRequest,
  authController.sendVerificationEmail
);
authRouter.post("/ask-reset", authSchemas_default.validateResetPasswordRequest, authController.askPasswordReset);
authRouter.get("/verify-reset", authSchemas_default.validateVerifyResetRequest, authController.verifyReset);
authRouter.get("/status", authController.status);
var passwordRequirements2 = zod.z.string().min(8, { message: "Password must be at least 8 characters long." }).max(72, { message: "Password must be at most 72 characters long." }).trim();
var updatePasswordBodySchema = zod.z.object({
  password: passwordRequirements2
});
var optionalWebsiteUrl = zod.z.union([zod.z.string().max(2048).trim(), zod.z.null(), zod.z.literal("")]).optional().refine(
  (val) => val === void 0 || val === null || val === "" || typeof val === "string" && /^https?:\/\//i.test(val),
  { message: "Website must be empty or a valid http(s) URL." }
);
var updateProfileBodySchema = zod.z.object({
  fullName: zod.z.string().min(1, { message: "Full name is required." }).max(256, { message: "Full name must be at most 256 characters." }).trim().optional(),
  avatarUrl: zod.z.union([zod.z.string(), zod.z.null()]).optional(),
  websiteUrl: optionalWebsiteUrl
}).refine(
  (data) => data.fullName !== void 0 || data.avatarUrl !== void 0 || data.websiteUrl !== void 0,
  { message: "At least one of fullName, avatarUrl, or websiteUrl is required." }
);
var validateUpdateProfileRequest = validateRequest({
  body: updateProfileBodySchema
});
var validateUpdatePasswordMeRequest = validateRequest({
  body: updatePasswordBodySchema
});

// middlewares/authenticateUser.ts
init_Logger();
function parseBearerToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new TokenError("No token provided or invalid format");
  }
  const token = authHeader.split(" ")[1];
  if (!token) throw new TokenError("No token provided");
  if (token.startsWith("{")) {
    let parsed;
    try {
      parsed = JSON.parse(token);
    } catch {
      throw new TokenError("Invalid token format");
    }
    if (!parsed?.value || typeof parsed.value !== "string") {
      throw new TokenError("Invalid token format");
    }
    return parsed.value;
  }
  return token.trim();
}
function requireFullAuth(supabase2) {
  return async (req, _res, next) => {
    try {
      const accessToken = parseBearerToken(req);
      if (!supabase2) {
        logger.error({ msg: "Supabase client was not provided to requireFullAuth" });
        throw new AuthError("Authentication configuration error", 500);
      }
      const { data, error } = await supabase2.auth.getUser(accessToken);
      if (error) {
        logger.debug({ msg: "Token verification failed", error: error.message });
        if (error.message?.includes("expired") || error.code === "PGRST301") {
          throw new TokenError("Token expired", true);
        }
        throw new TokenError(`Invalid token: ${error.message}`);
      }
      if (!data?.user) {
        throw new TokenError("Invalid token: no user data returned");
      }
      req.user = { id: data.user.id };
      next();
    } catch (err) {
      next(err);
    }
  };
}
function requireFullAuthWithRoles(supabase2, userRepository2, rbacRepository2) {
  return async (req, _res, next) => {
    try {
      const accessToken = parseBearerToken(req);
      if (!supabase2) {
        logger.error({ msg: "Supabase client was not provided to requireFullAuthWithRoles" });
        throw new AuthError("Authentication configuration error", 500);
      }
      const { data, error } = await supabase2.auth.getUser(accessToken);
      if (error) {
        logger.debug({ msg: "Token verification failed", error: error.message });
        if (error.message?.includes("expired") || error.code === "PGRST301") {
          throw new TokenError("Token expired", true);
        }
        throw new TokenError(`Invalid token: ${error.message}`);
      }
      if (!data?.user) {
        throw new TokenError("Invalid token: no user data returned");
      }
      const authId = data.user.id;
      const { userId: publicId, error: resolveError } = await userRepository2.findUserIdByAuthId(authId);
      if (resolveError || !publicId) {
        throw new TokenError("User profile not found");
      }
      const [rolesResult, permissionsResult] = await Promise.all([
        rbacRepository2.getUserRoles(publicId),
        rbacRepository2.getUserPermissions(publicId)
      ]);
      const isSuperAdmin = await rbacRepository2.isSuperAdmin(publicId);
      req.user = {
        id: authId,
        publicId,
        roles: rolesResult.roles,
        permissions: permissionsResult.permissions,
        isSuperAdmin
      };
      next();
    } catch (err) {
      next(err);
    }
  };
}
function optionalAuthWithRoles(supabase2, userRepository2, rbacRepository2) {
  return async (req, _res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        next();
        return;
      }
      const token = authHeader.split(" ")[1]?.trim();
      if (!token) {
        next();
        return;
      }
      if (!supabase2) {
        logger.error({ msg: "Supabase client was not provided to optionalAuthWithRoles" });
        next();
        return;
      }
      const { data, error } = await supabase2.auth.getUser(token);
      if (error || !data?.user) {
        next();
        return;
      }
      const authId = data.user.id;
      const { userId: publicId, error: resolveError } = await userRepository2.findUserIdByAuthId(authId);
      if (resolveError || !publicId) {
        next();
        return;
      }
      const [rolesResult, permissionsResult] = await Promise.all([
        rbacRepository2.getUserRoles(publicId),
        rbacRepository2.getUserPermissions(publicId)
      ]);
      const isSuperAdmin = await rbacRepository2.isSuperAdmin(publicId);
      req.user = {
        id: authId,
        publicId,
        roles: rolesResult.roles,
        permissions: permissionsResult.permissions,
        isSuperAdmin
      };
      next();
    } catch {
      next();
    }
  };
}
function requireEditor(req, _res, next) {
  if (!req.user?.id) {
    next(new TokenError("Authentication required"));
    return;
  }
  const hasEditor = req.user.roles?.includes("editor");
  const hasAdmin = req.user.roles?.includes("admin");
  if (!req.user.isSuperAdmin && !hasAdmin && !hasEditor) {
    next(new PermissionError("editor"));
    return;
  }
  next();
}
function requireSupport(req, _res, next) {
  if (!req.user?.id) {
    next(new TokenError("Authentication required"));
    return;
  }
  const hasSupport = req.user.roles?.includes("support");
  const hasAdmin = req.user.roles?.includes("admin");
  if (!req.user.isSuperAdmin && !hasAdmin && !hasSupport) {
    next(new PermissionError("support"));
    return;
  }
  next();
}
function requireAdmin(req, _res, next) {
  if (!req.user?.id) {
    next(new TokenError("Authentication required"));
    return;
  }
  const hasAdmin = req.user.roles?.includes("admin");
  if (!req.user.isSuperAdmin && !hasAdmin) {
    next(new PermissionError("admin"));
    return;
  }
  next();
}
function requireSuperAdmin(req, _res, next) {
  if (!req.user?.id) {
    next(new TokenError("Authentication required"));
    return;
  }
  if (!req.user.isSuperAdmin) {
    next(new PermissionError("super_admin"));
    return;
  }
  next();
}
function requirePermission(permission) {
  return (req, _res, next) => {
    if (!req.user?.id) {
      next(new TokenError("Authentication required"));
      return;
    }
    if (req.user.isSuperAdmin) {
      next();
      return;
    }
    const hasPermission = req.user.permissions?.includes(permission);
    if (!hasPermission) {
      logger.debug({
        msg: "Permission denied",
        userId: req.user.publicId ?? req.user.id,
        permission
      });
      next(new PermissionError(permission));
      return;
    }
    next();
  };
}

// routes/UserRoute.ts
var userRouter = express2.Router();
var authWithRoles = requireFullAuthWithRoles(
  supabaseServiceClientConnection,
  userRepository,
  rbacRepository
);
var requireManageRoles = requirePermission("users.manage_roles");
userRouter.get("/me", authWithRoles, userController.getProfile);
userRouter.patch("/me", authWithRoles, validateUpdateProfileRequest, userController.updateProfile);
userRouter.put("/me/password", authWithRoles, validateUpdatePasswordMeRequest, userController.updatePasswordMe);
userRouter.post("/me/request-change-password", authWithRoles, userController.requestChangePasswordEmail);
userRouter.get("/:userId/roles", authWithRoles, requireAdmin, rbacController.getUserRoles);
userRouter.post(
  "/:userId/roles/:role",
  authWithRoles,
  requireManageRoles,
  rbacController.assignRole
);
userRouter.delete(
  "/:userId/roles/:role",
  authWithRoles,
  requireManageRoles,
  rbacController.removeRole
);
var getModuleConfigQuerySchema = zod.z.object({
  moduleName: zod.z.string().min(1)
});
var updateModuleConfigBodySchema = zod.z.object({
  moduleName: zod.z.string().min(1),
  newConfig: zod.z.record(zod.z.unknown())
});
var validateGetModuleConfigQuery = validateRequest({
  query: getModuleConfigQuerySchema
});
var validateUpdateModuleConfigRequest = validateRequest({
  body: updateModuleConfigBodySchema
});
var configSchemas = {
  validateGetModuleConfigQuery,
  validateUpdateModuleConfigRequest
};
var configSchemas_default = configSchemas;

// routes/AdminRoute.ts
var adminRouter = express2.Router();
var authWithRoles2 = requireFullAuthWithRoles(
  supabaseServiceClientConnection,
  userRepository,
  rbacRepository
);
adminRouter.get("/users", authWithRoles2, requireSuperAdmin, userController.getFullUsersWithRoles);
adminRouter.get(
  "/config",
  authWithRoles2,
  requireSuperAdmin,
  configSchemas_default.validateGetModuleConfigQuery,
  configController.getModuleConfig
);
adminRouter.put(
  "/config",
  authWithRoles2,
  requireSuperAdmin,
  configSchemas_default.validateUpdateModuleConfigRequest,
  configController.updateModuleConfig
);

// middlewares/generateSitemap.ts
init_Logger();
var EXCLUDED_PATHS = ["/robots.txt", "/sitemap.xml"];
var CUSTOM_CHANGEFREQ = {
  "/blog": "daily"
};
var MANIFEST_EXCLUDED = /* @__PURE__ */ new Set(["sitemap.xml", "robots.txt", "api", "favicon.ico"]);
function readFolderStructure(dirPath, previousFolder = "") {
  const urls = [];
  const disabledIncludes = ["(protected)", "(auth)", "not-found"];
  const disabledStartsWith = ["_", "["];
  try {
    const dirents = fs__default.default.readdirSync(dirPath, { withFileTypes: true });
    for (const dirent of dirents) {
      if (!dirent.isDirectory()) continue;
      const dirName = dirent.name;
      if (disabledIncludes.some((d) => dirName.includes(d)) || disabledStartsWith.some((d) => dirName.startsWith(d)) || MANIFEST_EXCLUDED.has(dirName)) {
        continue;
      }
      const fullPath = path2__default.default.join(dirPath, dirName);
      const isRouteGroup = dirName.match(/^\(.*\)$/);
      if (!isRouteGroup) {
        const urlPath = previousFolder === "" ? `/${dirName}` : `/${previousFolder}/${dirName}`;
        if (!EXCLUDED_PATHS.some((ex) => urlPath === ex || urlPath.startsWith(ex + "/"))) {
          urls.push({
            url: urlPath,
            lastMod: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
            changeFreq: "weekly"
          });
        }
      }
      const childUrls = readFolderStructure(
        fullPath,
        isRouteGroup ? previousFolder : previousFolder ? `${previousFolder}/${dirName}` : dirName
      );
      urls.push(...childUrls);
    }
  } catch (error) {
    logger.error({
      msg: "Error reading folder structure for sitemap",
      error: error instanceof Error ? error.message : String(error),
      dirPath
    });
  }
  return urls;
}
function loadRoutesFromManifest(manifestPath) {
  try {
    const manifestData = fs__default.default.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(manifestData);
    logger.info({
      msg: "Loaded routes from manifest",
      manifestPath,
      routeCount: manifest.routes.length,
      generated: manifest.generated
    });
    return manifest.routes.map((route) => ({
      url: route.path,
      lastMod: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      changeFreq: route.changeFreq || "monthly"
    }));
  } catch (error) {
    logger.error({ msg: "Error loading routes manifest", error, manifestPath });
    return [];
  }
}
function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function dedupeByUrl(urls) {
  const seen = /* @__PURE__ */ new Map();
  for (const u of urls) {
    if (!seen.has(u.url)) seen.set(u.url, u);
  }
  return [...seen.values()];
}
var POST_PAGE_SIZE = 1e3;
async function fetchPublishedPostSlugs(supabase2) {
  const rows = [];
  let from = 0;
  for (; ; ) {
    const { data, error } = await supabase2.from("blog_posts").select("slug, updated_at").match({ is_user_published: true, is_admin_approved: true }).order("published_at", { ascending: false }).range(from, from + POST_PAGE_SIZE - 1);
    if (error) {
      logger.error({
        msg: "Error fetching blog posts for sitemap",
        error: error.message,
        code: error.code
      });
      break;
    }
    const batch = data ?? [];
    for (const row of batch) {
      if (row.slug) {
        rows.push({ slug: row.slug, updated_at: row.updated_at ?? null });
      }
    }
    if (batch.length < POST_PAGE_SIZE) break;
    from += POST_PAGE_SIZE;
  }
  return rows;
}
async function generateSitemapUrls(options) {
  const { supabaseClient, routesPath, routesManifestPath } = options;
  const urls = [];
  urls.push({
    url: "/",
    lastMod: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    changeFreq: "weekly"
  });
  if (routesManifestPath && fs__default.default.existsSync(routesManifestPath)) {
    logger.info({ msg: "Using routes manifest for static pages", path: routesManifestPath });
    urls.push(...loadRoutesFromManifest(routesManifestPath));
  } else if (routesPath && fs__default.default.existsSync(routesPath)) {
    logger.info({ msg: "Scanning file system for routes", path: routesPath });
    try {
      urls.push(...readFolderStructure(routesPath));
    } catch (error) {
      logger.error({ msg: "Error reading routes folder for sitemap", error, routesPath });
    }
  } else {
    logger.warn({
      msg: "No routes source available for static pages",
      manifestPath: routesManifestPath,
      routesPath
    });
  }
  try {
    const posts = await fetchPublishedPostSlugs(supabaseClient);
    for (const p of posts) {
      urls.push({
        url: `/blog/${p.slug}`,
        lastMod: p.updated_at ? new Date(p.updated_at).toISOString().slice(0, 10) : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        changeFreq: "weekly"
      });
    }
    logger.info({ msg: `Added ${posts.length} blog post URLs to sitemap` });
  } catch (error) {
    logger.error({
      msg: "Error processing blog posts for sitemap",
      error: error instanceof Error ? error.message : String(error)
    });
  }
  try {
    const { data: topicRows, error: topicsError } = await supabaseClient.rpc("get_active_blog_topics");
    if (topicsError) {
      logger.error({
        msg: "Error fetching topics for sitemap",
        error: topicsError.message,
        code: topicsError.code
      });
    } else if (topicRows && topicRows.length > 0) {
      for (const t of topicRows) {
        if (t.slug) {
          urls.push({
            url: `/blog/topic/${encodeURIComponent(t.slug)}`,
            lastMod: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
            changeFreq: "weekly"
          });
        }
      }
      logger.info({ msg: `Added ${topicRows.length} blog topic URLs to sitemap` });
    }
  } catch (error) {
    logger.error({
      msg: "Error processing blog topics for sitemap",
      error: error instanceof Error ? error.message : String(error)
    });
  }
  try {
    const { data: authorRows, error: authorsError } = await supabaseClient.rpc("get_published_blog_authors");
    if (authorsError) {
      logger.error({
        msg: "Error fetching authors for sitemap",
        error: authorsError.message,
        code: authorsError.code
      });
    } else if (authorRows && authorRows.length > 0) {
      for (const a of authorRows) {
        const segment = a.username && a.username.trim() || a.id;
        urls.push({
          url: `/blog/author/${encodeURIComponent(segment)}`,
          lastMod: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
          changeFreq: "monthly"
        });
      }
      logger.info({ msg: `Added ${authorRows.length} blog author URLs to sitemap` });
    }
  } catch (error) {
    logger.error({
      msg: "Error processing blog authors for sitemap",
      error: error instanceof Error ? error.message : String(error)
    });
  }
  const filtered = urls.filter((u) => {
    const exclude = EXCLUDED_PATHS.some(
      (excluded) => u.url === excluded || u.url.startsWith(excluded + "/")
    );
    return !exclude;
  });
  const withChangefreq = filtered.map((u) => {
    for (const [pattern, changefreq] of Object.entries(CUSTOM_CHANGEFREQ)) {
      if (u.url === pattern) {
        return { ...u, changeFreq: changefreq };
      }
    }
    return u;
  });
  return dedupeByUrl(withChangefreq);
}
function toSitemapXml(urls, baseURL) {
  const base = baseURL.replace(/\/$/, "");
  const urlEntries = urls.map((u) => {
    const pathPart = u.url.startsWith("/") ? u.url : `/${u.url}`;
    const loc = escapeXml(`${base}${pathPart}`);
    const lastmod = u.lastMod ? `<lastmod>${escapeXml(u.lastMod)}</lastmod>` : "";
    const cf = u.changeFreq ? `<changefreq>${escapeXml(u.changeFreq)}</changefreq>` : "";
    return `  <url><loc>${loc}</loc>${lastmod}${cf}</url>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}
function generateSitemapMiddleware(options) {
  const { baseURL } = options;
  return async (_req, res) => {
    try {
      const urls = await generateSitemapUrls(options);
      const xml = toSitemapXml(urls, baseURL);
      logger.info({ msg: "Sitemap generated", urlCount: urls.length });
      res.type("application/xml").send(xml);
    } catch (error) {
      logger.error({
        msg: "Sitemap generation error",
        error: error instanceof Error ? error.message : String(error)
      });
      const fallback = toSitemapXml(
        [{ url: "/", changeFreq: "daily", lastMod: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) }],
        baseURL
      );
      res.type("application/xml").send(fallback);
    }
  };
}

// middlewares/queryParsers.ts
var QueryParsers = {
  string: (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value[0] ?? null;
    return null;
  },
  number: (value) => {
    if (!value) return void 0;
    const str = Array.isArray(value) ? value[0] : value;
    if (typeof str !== "string") return void 0;
    const parsed = Number.parseInt(str, 10);
    return Number.isNaN(parsed) ? void 0 : parsed;
  },
  boolean: (value) => {
    if (!value) return null;
    const str = Array.isArray(value) ? value[0] : value;
    if (typeof str !== "string") return null;
    return str.toLowerCase() === "true";
  },
  json: (value) => {
    if (!value) return null;
    const str = Array.isArray(value) ? value[0] : value;
    if (typeof str !== "string") return null;
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  }
};
var stringArray = (value) => {
  if (!value) return null;
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      if (value.includes(",")) {
        return value.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
      }
      return [value];
    }
  }
  return null;
};
function createQueryParser(rules) {
  return (req, _res, next) => {
    try {
      const parsedQuery = {};
      for (const [key, parser] of Object.entries(rules)) {
        parsedQuery[key] = parser(
          req.query[key]
        );
      }
      req.parsedQuery = parsedQuery;
      next();
    } catch (error) {
      next(error);
    }
  };
}
function createConfigPropertiesParser() {
  return createQueryParser({
    properties: stringArray
  });
}
function createCombinedConfigPropertiesParser() {
  return createQueryParser({
    companyProperties: stringArray,
    marketingProperties: stringArray
  });
}
var combineParsers = (...parserSets) => parserSets.reduce((combined, parsers) => ({ ...combined, ...parsers }), {});
var CommonQueryParsers = {
  pagination: { limit: QueryParsers.number, skipId: QueryParsers.string },
  skip: { skip: QueryParsers.number },
  search: { searchTerm: QueryParsers.string },
  blogFiltering: { topicId: QueryParsers.string, authorId: QueryParsers.string },
  sorting: { sortByKey: QueryParsers.string, sortByOrder: QueryParsers.boolean },
  range: { range: QueryParsers.json }
};
var publishedBlogPostsRules = combineParsers(
  CommonQueryParsers.pagination,
  CommonQueryParsers.skip,
  CommonQueryParsers.search,
  CommonQueryParsers.blogFiltering,
  CommonQueryParsers.sorting,
  CommonQueryParsers.range
);
function createPublishedBlogPostsParser() {
  return createQueryParser(publishedBlogPostsRules);
}
var adminBlogPostsRules = combineParsers(
  CommonQueryParsers.pagination,
  CommonQueryParsers.search,
  CommonQueryParsers.blogFiltering,
  CommonQueryParsers.sorting,
  CommonQueryParsers.range
);
function createAdminBlogPostsParser() {
  return createQueryParser(adminBlogPostsRules);
}
var adminBlogCommentsRules = combineParsers(
  CommonQueryParsers.pagination,
  CommonQueryParsers.search,
  CommonQueryParsers.sorting,
  CommonQueryParsers.range
);
function createAdminBlogCommentsParser() {
  return createQueryParser(adminBlogCommentsRules);
}
var adminBlogActivitiesRules = combineParsers(
  CommonQueryParsers.pagination,
  CommonQueryParsers.sorting,
  CommonQueryParsers.range,
  { post_id: QueryParsers.string, activity_type: QueryParsers.string }
);
function createAdminBlogActivitiesParser() {
  return createQueryParser(adminBlogActivitiesRules);
}

// routes/CompanyRoute.ts
var companyRouter = express2.Router();
companyRouter.get(
  "/information/properties",
  createConfigPropertiesParser(),
  companyController.getInformationByProperties
);
companyRouter.get("/information", companyController.getAllInformation);
companyRouter.get("/information/combined", companyController.getAllInformationCombined);
companyRouter.get(
  "/information/properties/combined",
  createCombinedConfigPropertiesParser(),
  companyController.getInformationByPropertiesCombined
);
var workspaceMembershipRoleSchema = zod.z.enum(["user", "admin", "superadmin"]);
var createOrganizationBodySchema = zod.z.object({
  name: zod.z.string().min(1, "Name is required").max(256).trim(),
  description: zod.z.string().max(2e3).trim().optional()
});
var updateOrganizationBodySchema = zod.z.object({
  name: zod.z.string().min(1).max(256).trim().optional(),
  description: zod.z.string().max(2e3).trim().nullable().optional()
});
var addTeamMemberBodySchema = zod.z.object({
  userId: zod.z.string().uuid("Invalid user id"),
  workspaceRole: workspaceMembershipRoleSchema.default("user")
});
var inviteRoleSchema = zod.z.enum(["user", "admin"]);
var inviteTeamMemberBodySchema = zod.z.object({
  email: zod.z.string().email("Invalid email"),
  workspaceRole: inviteRoleSchema.default("user"),
  sendEmail: zod.z.boolean().default(true)
});
var joinOrganizationBodySchema = zod.z.object({
  token: zod.z.string().min(1, "Invite token is required")
});
var organizationIdParamSchema = zod.z.object({ id: zod.z.string().uuid("Invalid organization id") });
var teamUserIdParamSchema = zod.z.object({ userId: zod.z.string().uuid("Invalid user id") });
var validateOrganizationIdParam = validateRequest({
  params: organizationIdParamSchema
});
var validateOrganizationIdAndUserIdParam = validateRequest({
  params: organizationIdParamSchema.merge(teamUserIdParamSchema)
});
var validateCreateOrganizationRequest = validateRequest({
  body: createOrganizationBodySchema
});
var validateUpdateOrganizationRequest = validateRequest({
  body: updateOrganizationBodySchema
});
var validateAddTeamMemberRequest = validateRequest({
  body: addTeamMemberBodySchema
});
var validateInviteTeamMemberRequest = validateRequest({
  body: inviteTeamMemberBodySchema
});
var validateJoinOrganizationRequest = validateRequest({
  body: joinOrganizationBodySchema
});

// routes/SettingsRoute.ts
var settingsRouter = express2.Router();
var auth = requireFullAuth(supabaseServiceClientConnection);
settingsRouter.get("/", auth, settingsController.listMine);
settingsRouter.get("/invite/validate", settingsController.validateInviteToken);
settingsRouter.post("/join", auth, validateJoinOrganizationRequest, settingsController.joinByToken);
settingsRouter.get("/invites/pending", auth, settingsController.listPendingInvites);
settingsRouter.post("/invites/:id/accept", auth, settingsController.acceptPendingInvite);
settingsRouter.get("/:id", auth, validateOrganizationIdParam, settingsController.getById);
settingsRouter.post("/", auth, validateCreateOrganizationRequest, settingsController.create);
settingsRouter.patch(
  "/:id",
  auth,
  validateOrganizationIdParam,
  validateUpdateOrganizationRequest,
  settingsController.update
);
settingsRouter.delete(
  "/:id",
  auth,
  validateOrganizationIdParam,
  settingsController.deleteById
);
settingsRouter.post(
  "/:id/invite",
  auth,
  validateOrganizationIdParam,
  validateInviteTeamMemberRequest,
  settingsController.inviteTeamMember
);
settingsRouter.get(
  "/:id/team",
  auth,
  validateOrganizationIdParam,
  settingsController.getTeam
);
settingsRouter.post(
  "/:id/team",
  auth,
  validateOrganizationIdParam,
  validateAddTeamMemberRequest,
  settingsController.addTeamMember
);
settingsRouter.delete(
  "/:id/team/:userId",
  auth,
  validateOrganizationIdAndUserIdParam,
  settingsController.removeTeamMember
);
settingsRouter.post(
  "/:id/rotate-api-key",
  auth,
  validateOrganizationIdParam,
  settingsController.rotateApiKey
);
var rbacRouter = express2.Router();
var authWithRoles3 = requireFullAuthWithRoles(
  supabaseServiceClientConnection,
  userRepository,
  rbacRepository
);
var requireManageRoles2 = requirePermission("users.manage_roles");
rbacRouter.get("/permissions", authWithRoles3, requireAdmin, rbacController.getAllRolePermissions);
rbacRouter.get("/:role/permissions", authWithRoles3, requireAdmin, rbacController.getPermissionsForRole);
rbacRouter.get("/:role/users", authWithRoles3, requireAdmin, rbacController.getUsersByRole);
rbacRouter.post(
  "/:role/permissions/:permission",
  authWithRoles3,
  requireManageRoles2,
  rbacController.assignPermissionToRole
);
rbacRouter.delete(
  "/:role/permissions/:permission",
  authWithRoles3,
  requireManageRoles2,
  rbacController.removePermissionFromRole
);
var feedbackSchema = zod.z.object({
  feedback_type: zod.z.enum(["propose", "report", "feedback"]),
  url: zod.z.string().url("Invalid URL").min(3),
  description: zod.z.string().min(10, "Description must be at least 10 characters"),
  email: zod.z.string().optional().refine((v) => v === void 0 || v === "" || v.length >= 2 && v.includes("@"), {
    message: "Email must be valid if provided"
  })
});

// routes/FeedbackRoute.ts
var feedbackRouter = express2.Router();
var authWithRoles4 = requireFullAuthWithRoles(
  supabaseServiceClientConnection,
  userRepository,
  rbacRepository
);
feedbackRouter.post(
  "/",
  validateRequest({ body: feedbackSchema }),
  feedbackController.createFeedback
);
feedbackRouter.get("/", authWithRoles4, requireSupport, feedbackController.getAllFeedbacks);
feedbackRouter.patch("/:feedbackId", authWithRoles4, requireSupport, feedbackController.handleFeedback);

// middlewares/resourceAuth.ts
init_Logger();
function authorizeResource(options) {
  const {
    resourceType,
    paramName = "id",
    action = "read",
    getResourceOwner
  } = options;
  return async (req, _res, next) => {
    try {
      if (!req.user?.publicId) {
        next(new UserAuthorizationError("Authentication required"));
        return;
      }
      const userId = req.user.publicId;
      const resourceId = req.params[paramName];
      if (!resourceId) {
        next(
          new UserAuthorizationError(
            `Resource ID not provided in parameter: ${paramName}`
          )
        );
        return;
      }
      let resourceOwnerId;
      if (typeof getResourceOwner === "function") {
        try {
          resourceOwnerId = await getResourceOwner(resourceId);
        } catch (error) {
          logger.error({
            msg: "Error retrieving resource owner",
            error: error.message,
            resourceType,
            resourceId
          });
          next(error);
          return;
        }
      } else {
        resourceOwnerId = resourceId;
      }
      const isOwner = userId === resourceOwnerId;
      const isSuperAdmin = req.user.isSuperAdmin === true;
      const hasEditor = req.user.roles?.includes("editor") === true;
      const hasAdmin = req.user.roles?.includes("admin") === true;
      const canAccessAsRole = isSuperAdmin || hasAdmin || hasEditor;
      if (isOwner) {
        next();
        return;
      }
      if (action === "read" && canAccessAsRole) {
        next();
        return;
      }
      if (action !== "read" && isSuperAdmin) {
        next();
        return;
      }
      next(
        new UserAuthorizationError(
          "You don't have permission to access this resource"
        )
      );
    } catch (error) {
      next(error);
    }
  };
}
var blogPostFields = {
  id: zod.z.string().uuid("Invalid post id").optional(),
  title: zod.z.string().min(1, "Title is required"),
  description: zod.z.string().min(1, "Description is required"),
  content: zod.z.string().min(1, "Content is required"),
  topic_id: zod.z.string().min(1, "Topic is required").uuid("Invalid topic id"),
  hero_image_filename: zod.z.string().optional(),
  is_sponsored: zod.z.boolean().default(false),
  is_featured: zod.z.boolean().default(false),
  is_user_published: zod.z.boolean().default(false),
  is_admin_approved: zod.z.boolean().default(false)
};
var blogPostCreateSchema = zod.z.object(blogPostFields);
var blogPostUpdateSchema = zod.z.object(blogPostFields);
var blogPostIdParamSchema = zod.z.object({
  id: zod.z.string().uuid("Invalid post id")
});
zod.z.object({
  slug: zod.z.string().min(1, "Slug is required")
});
var blogPostIdentifierParamSchema = zod.z.object({
  identifier: zod.z.string().min(1, "Identifier is required")
});
zod.z.object(blogPostFields);
var blogTopicFields = {
  id: zod.z.string().uuid("Invalid topic id").optional(),
  name: zod.z.string().min(1, "Name is required"),
  description: zod.z.string().min(1, "Description is required"),
  parent_id: zod.z.string().uuid("Invalid parent topic id").optional()
};
var blogTopicCreateSchema = zod.z.object(blogTopicFields);
var blogTopicUpdateSchema = zod.z.object(blogTopicFields);
var blogTopicIdParamSchema = zod.z.object({
  id: zod.z.string().uuid("Invalid topic id")
});
var blogCommentContent = zod.z.string().min(1, "Comment content is required").max(1e3, "Comment cannot be longer than 1000 characters");
var blogCommentFields = {
  id: zod.z.string().uuid("Invalid comment id").optional(),
  post_id: zod.z.string().min(1, "Post id is required").uuid("Invalid post id").optional(),
  parent_id: zod.z.string().uuid("Invalid parent comment id").optional(),
  content: blogCommentContent
};
var blogCommentCreateSchema = zod.z.object(blogCommentFields).refine((data) => data.post_id != null, { message: "Post id is required", path: ["post_id"] });
var blogCommentUpdateSchema = zod.z.object(blogCommentFields);
var blogCommentIdParamSchema = zod.z.object({
  id: zod.z.string().uuid("Invalid comment id")
});
var blogPostCommentsParamSchema = zod.z.object({
  postId: zod.z.string().uuid("Invalid post id")
});
var blogPostActivityParamSchema = zod.z.object({
  postId: zod.z.string().uuid("Invalid post id")
});
var blogTrackActivitySchema = zod.z.object({
  activity_type: zod.z.enum(["view", "like", "share", "comment"], {
    errorMap: () => ({ message: "activity_type must be one of: view, like, share, comment" })
  })
});

// routes/BlogRoute.ts
var blogRouter = express2.Router();
var authWithRoles5 = requireFullAuthWithRoles(
  supabaseServiceClientConnection,
  userRepository,
  rbacRepository
);
var optionalAuth = optionalAuthWithRoles(
  supabaseServiceClientConnection,
  userRepository,
  rbacRepository
);
var parsePublishedBlogPostsQuery = createPublishedBlogPostsParser();
var parseAdminBlogPostsQuery = createAdminBlogPostsParser();
var parseAdminBlogCommentsQuery = createAdminBlogCommentsParser();
var parseAdminBlogActivitiesQuery = createAdminBlogActivitiesParser();
blogRouter.get("/authors", blogController.getPublishedBlogAuthors);
blogRouter.get("/topics/active", blogController.getActiveBlogTopics);
blogRouter.get("/topics", blogController.getBlogTopics);
blogRouter.get("/information", blogController.getBlogInformation);
blogRouter.get("/posts", parsePublishedBlogPostsQuery, blogController.getPublishedBlogPosts);
blogRouter.get(
  "/posts/:postId/comments",
  validateRequest({ params: blogPostCommentsParamSchema }),
  blogController.getPostComments
);
blogRouter.put(
  "/posts/:postId/activity",
  optionalAuth,
  validateRequest({ params: blogPostActivityParamSchema, body: blogTrackActivitySchema }),
  blogController.trackBlogActivity
);
blogRouter.get(
  "/admin/posts",
  authWithRoles5,
  requireEditor,
  parseAdminBlogPostsQuery,
  blogController.getAdminBlogPosts
);
blogRouter.get(
  "/admin/comments",
  authWithRoles5,
  requireEditor,
  parseAdminBlogCommentsQuery,
  blogController.getAdminBlogComments
);
blogRouter.get(
  "/admin/activities",
  authWithRoles5,
  requireEditor,
  parseAdminBlogActivitiesQuery,
  blogController.getAdminBlogActivities
);
blogRouter.get("/rss", parsePublishedBlogPostsQuery, blogController.getRSSFeed);
var whenIdentifierIsId = (req, _res, next) => {
  const identifier = req.params.identifier;
  if (identifier && isValidUUID(identifier)) {
    req.params.id = identifier;
    next();
  } else {
    next("route");
  }
};
blogRouter.get(
  "/posts/:identifier",
  whenIdentifierIsId,
  authWithRoles5,
  requireEditor,
  authorizeResource({
    resourceType: "blog_posts",
    paramName: "id",
    action: "read"
    // getResourceOwner: getBlogPostResourceOwner,
  }),
  validateRequest({ params: blogPostIdParamSchema }),
  blogController.getBlogPostById
);
blogRouter.get(
  "/posts/:identifier",
  validateRequest({ params: blogPostIdentifierParamSchema }),
  blogController.getPublishedBlogPostBySlug
);
blogRouter.post(
  "/posts",
  authWithRoles5,
  requireEditor,
  validateRequest({ body: blogPostCreateSchema }),
  blogController.createBlogPost
);
blogRouter.put(
  "/posts/:id",
  authWithRoles5,
  requireEditor,
  validateRequest({ params: blogPostIdParamSchema, body: blogPostUpdateSchema }),
  blogController.updateBlogPost
);
blogRouter.delete(
  "/posts/:id",
  authWithRoles5,
  requireEditor,
  validateRequest({ params: blogPostIdParamSchema }),
  blogController.deleteBlogPost
);
blogRouter.post(
  "/topics",
  authWithRoles5,
  requireEditor,
  validateRequest({ body: blogTopicCreateSchema }),
  blogController.createBlogTopic
);
blogRouter.put(
  "/topics/:id",
  authWithRoles5,
  requireEditor,
  validateRequest({ params: blogTopicIdParamSchema, body: blogTopicUpdateSchema }),
  blogController.updateBlogTopic
);
blogRouter.delete(
  "/topics/:id",
  authWithRoles5,
  requireEditor,
  validateRequest({ params: blogTopicIdParamSchema }),
  blogController.deleteBlogTopic
);
blogRouter.post(
  "/comments",
  authWithRoles5,
  validateRequest({ body: blogCommentCreateSchema }),
  blogController.createBlogComment
);
blogRouter.put(
  "/comments/:id",
  authWithRoles5,
  validateRequest({ params: blogCommentIdParamSchema, body: blogCommentUpdateSchema }),
  blogController.updateBlogComment
);
blogRouter.patch(
  "/comments/:id/approve",
  authWithRoles5,
  requireEditor,
  validateRequest({ params: blogCommentIdParamSchema }),
  blogController.approveBlogComment
);
blogRouter.delete(
  "/comments/:id",
  authWithRoles5,
  requireEditor,
  validateRequest({ params: blogCommentIdParamSchema }),
  blogController.deleteBlogComment
);
var MAX_IMAGE_UPLOAD_BYTES = 4 * 1024 * 1024;
var upload = multer__default.default({
  storage: multer__default.default.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_UPLOAD_BYTES }
});
var authWithRoles6 = requireFullAuthWithRoles(
  supabaseServiceClientConnection,
  userRepository,
  rbacRepository
);
var imageRouter = express2.Router();
imageRouter.get("/download", imageController.getByUrl);
imageRouter.post(
  "/upload",
  authWithRoles6,
  requireEditor,
  upload.single("imageFile"),
  imageController.upload
);
imageRouter.delete("/delete", authWithRoles6, requireEditor, imageController.delete);
imageRouter.get("/proxy", authWithRoles6, requireEditor, imageController.proxyImage);

// routes/index.ts
init_Logger();
async function mountAllRoutes(app2, config2) {
  const api = config2.api;
  const prefix = api?.prefix ?? "/api/v1";
  const apiRouter = express2__default.default.Router();
  apiRouter.use("/auth", authRouter);
  apiRouter.use("/users", userRouter);
  apiRouter.use("/admin", adminRouter);
  apiRouter.use("/company", companyRouter);
  apiRouter.use("/settings", settingsRouter);
  apiRouter.use("/roles", rbacRouter);
  apiRouter.use("/feedback", feedbackRouter);
  apiRouter.use("/blog-system", blogRouter);
  apiRouter.use("/image", imageRouter);
  app2.use(prefix, apiRouter);
  logger.info({
    msg: "[Routes] Mounted",
    prefix,
    auth: `${prefix}/auth`,
    users: `${prefix}/users`,
    admin: `${prefix}/admin`,
    company: `${prefix}/company`,
    settings: `${prefix}/settings`,
    roles: `${prefix}/roles`,
    feedback: `${prefix}/feedback`,
    blog: `${prefix}/blog-system`,
    image: `${prefix}/image`
  });
  return true;
}

// controllers/ErrorController.ts
init_Logger();
function errorHandler(err, _req, res, _next) {
  if (err instanceof RequestError) {
    res.status(400).json({
      success: false,
      error: err.errorList
    });
    return;
  }
  if (err instanceof AuthError) {
    const errorDetails = {
      msg: "AuthError occurred",
      name: err.name,
      message: err.message,
      statusCode: err.statusCode,
      path: _req.path ?? _req.url,
      method: _req.method
    };
    if (err.metadata && Object.keys(err.metadata).length > 0) {
      errorDetails.metadata = err.metadata;
    }
    if (err.statusCode === 401) {
      errorDetails.msg = "401 Unauthorized - Authentication failed";
      logger.warn(errorDetails);
    } else {
      logger.warn(errorDetails);
    }
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        type: err.name,
        message: err.message,
        ...err.metadata
      }
    });
    return;
  }
  if (err instanceof ValidationError) {
    logger.warn({ msg: "ValidationError", name: err.name, message: err.message });
    res.status(400).json({
      success: false,
      message: err.message,
      error: { type: err.name, message: err.message }
    });
    return;
  }
  if (err instanceof AppError) {
    logger.warn({
      msg: "AppError",
      name: err.name,
      message: err.message,
      statusCode: err.statusCode,
      ...Object.keys(err.metadata).length > 0 ? { metadata: err.metadata } : {}
    });
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        type: err.name,
        message: err.message,
        ...Object.keys(err.metadata).length > 0 ? err.metadata : {}
      }
    });
    return;
  }
  if (err instanceof InfraError) {
    logger.error({
      msg: "InfraError occurred",
      name: err.name,
      message: err.message,
      statusCode: err.statusCode,
      component: err.component,
      operation: err.operation,
      cause: err.cause instanceof Error ? { message: err.cause.message, stack: err.cause.stack } : err.cause
    });
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        type: err.name ?? "InfrastructureError",
        message: err.message
      }
    });
    return;
  }
  if (err instanceof DatabaseError) {
    logger.error({
      msg: "DatabaseError occurred",
      name: err.name,
      message: err.message,
      statusCode: err.statusCode,
      metadata: err.metadata
    });
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        type: err.name ?? "DatabaseError",
        message: err.message,
        ...err.metadata && Object.keys(err.metadata).length > 0 ? err.metadata : {}
      }
    });
    return;
  }
  const message = err instanceof Error ? err.message : "Internal server error";
  const status = err.statusCode ?? 500;
  logger.error({ msg: "Unexpected error", error: message, status });
  const eventId = Sentry__namespace.captureException(err);
  if (eventId) {
    logger.info({
      msg: "Sentry event captured",
      eventId,
      hint: "If the event does not appear in Sentry: disable 'Filter out events from localhost' in Project Settings \u2192 Inbound Filters, then search by this eventId in Issues."
    });
  } else {
    logger.warn({ msg: "Sentry did not capture event (filtered or SDK not inited)" });
  }
}

// middlewares/rateLimit.ts
init_GlobalConfig();
init_Logger();
var createRateLimiter = (options) => {
  let skipFunction;
  if (options.skip !== void 0) {
    if (typeof options.skip === "boolean") {
      skipFunction = () => options.skip;
    } else {
      skipFunction = options.skip;
    }
  }
  return rateLimit__default.default({
    handler: (req, res, _next, options2) => {
      logger.warn({
        msg: "Rate limit reached",
        path: req.path,
        method: req.method,
        ip: req.ip,
        limit: options2.max,
        windowMs: options2.windowMs
      });
      res.status(429).json({
        status: "error",
        message: "Too many requests, please try again later.",
        retryAfter: Math.ceil(options2.windowMs / 1e3)
      });
    },
    standardHeaders: options.standardHeaders,
    legacyHeaders: options.legacyHeaders,
    windowMs: options.windowMs,
    max: options.max,
    message: options.message,
    skip: skipFunction
  });
};
var shouldSkipRateLimit = () => {
  const rateLimitConfig = config.rateLimit;
  return !rateLimitConfig?.enabled;
};
var globalLimiter = createRateLimiter({
  ...config.rateLimit.global,
  skip: (req) => {
    if (shouldSkipRateLimit()) return true;
    const path3 = req.path;
    const originalUrl = req.originalUrl || req.url;
    const isWebhook = path3.includes("/webhooks/") || originalUrl.includes("/webhooks/");
    const isBypass = path3 === "/health" || path3.startsWith("/health") || path3 === "/sitemap.xml" || path3.startsWith("/sitemap.xml");
    return isWebhook || isBypass;
  }
});
var authLimiter = createRateLimiter({
  ...config.rateLimit.auth,
  skip: shouldSkipRateLimit
});
var applyRateLimiting = (app2) => {
  const rateLimitConfig = config.rateLimit;
  if (!rateLimitConfig?.enabled) {
    logger.info({ msg: "API rate limiting is disabled" });
    return;
  }
  const apiPrefix = config.api?.prefix ?? "/api/v1";
  const globalConfig = config.rateLimit.global;
  const authConfig3 = config.rateLimit.auth;
  app2.use(apiPrefix, globalLimiter);
  logger.info({
    msg: "Applied global rate limiting to all API routes",
    windowMs: globalConfig?.windowMs,
    max: globalConfig?.max
  });
  app2.use(`${apiPrefix}/auth`, authLimiter);
  logger.info({
    msg: "Applied authentication rate limiting",
    windowMs: authConfig3?.windowMs,
    max: authConfig3?.max
  });
};

// middlewares/core.ts
init_Logger();
function configureCoreMiddleware(app2, config2, supabase2) {
  logger.info({ msg: "[Setup] Configuring core middleware..." });
  applyRateLimiting(app2);
  app2.use((req, res, next) => {
    if (req._skipJsonParsing) return next();
    const limit = config2.server?.bodyLimit ?? "10mb";
    return express2__default.default.json({ limit })(req, res, next);
  });
  app2.use((req, res, next) => {
    if (req._skipJsonParsing) return next();
    const limit = config2.server?.bodyLimit ?? "10mb";
    return express2__default.default.urlencoded({ extended: true, limit })(req, res, next);
  });
  app2.use(cookieParser__default.default());
  app2.use((req, res, next) => {
    req.id = uuid.v4();
    res.setHeader("X-Request-Id", req.id);
    next();
  });
  try {
    if (!supabase2) {
      throw new Error("Supabase client not provided for auth middleware");
    }
    const authMiddleware = requireFullAuth(supabase2);
    const apiPrefix = config2.api?.prefix ?? "/api/v1";
    const publicPaths = ["/auth", "/company", "/feedback"];
    const publicPathsExact = [
      "/blog-system/posts",
      "/blog-system/rss",
      "/blog-system/authors",
      "/blog-system/topics",
      "/blog-system/topics/active"
    ];
    const bypassPaths = ["/health", "/sitemap.xml"];
    app2.use((req, res, next) => {
      const pathName = req.path;
      if (bypassPaths.some((p) => pathName.startsWith(p))) return next();
      if (pathName.startsWith(apiPrefix)) {
        const routePath = pathName.slice(apiPrefix.length) || "/";
        const isPublicExact = publicPathsExact.some((p) => routePath === p);
        const isPublicBlogPostBySlug = req.method === "GET" && routePath.startsWith("/blog-system/posts/") && routePath.length > "/blog-system/posts/".length;
        const isPublicTrackActivity = req.method === "PUT" && /^\/blog-system\/posts\/[^/]+\/activity$/.test(routePath);
        const dbName = typeof req.query.databaseName === "string" ? req.query.databaseName : "";
        const imageUrlParam = typeof req.query.imageUrl === "string" ? req.query.imageUrl : "";
        const isPublicBlogImageDownload = req.method === "GET" && routePath === "/image/download" && dbName === DATABASE_NAMES.BLOG_IMAGES && imageUrlParam.length > 0;
        const isPublic = isPublicExact || isPublicBlogPostBySlug || isPublicTrackActivity || isPublicBlogImageDownload || publicPaths.some((p) => routePath === p || routePath.startsWith(p + "/"));
        if (isPublic) return next();
        return authMiddleware(req, res, next);
      }
      next();
    });
    logger.info({ msg: "[Setup] Core middleware configured" });
  } catch (error) {
    logger.error({
      msg: "[Setup] CRITICAL: Failed to configure auth middleware",
      error: error instanceof Error ? error.message : String(error)
    });
    app2.use((_req, _res, next) => {
      next(new Error("Authentication middleware setup failed"));
    });
  }
}

// app.ts
init_Logger();
init_GlobalConfig();
var checkConfigIsValid = () => {
  const criticalConfigKeys = ["server", "api", "cors"];
  const missingKeys = [];
  criticalConfigKeys.forEach((key) => {
    if (!config[key]) missingKeys.push(key);
  });
  if (missingKeys.length > 0) {
    logger.error({ msg: "[Config] Critical config is invalid", missingKeys, config: Object.keys(config) });
    throw new Error(`Critical config missing: ${missingKeys.join(", ")}`);
  }
  logger.info({ msg: "[Config] Configuration validation passed" });
};
try {
  checkConfigIsValid();
} catch (error) {
  logger.error({
    msg: "[Config] CRITICAL: Configuration validation failed",
    error: error instanceof Error ? error.message : "Unknown error"
  });
  throw error;
}
var getCorsOptions = () => {
  const c = config.cors;
  return {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const origins = c.allowedOrigins;
      if (origins === "*" || Array.isArray(origins) && origins.includes("*")) return callback(null, true);
      if (Array.isArray(origins) && origins.includes(origin)) return callback(null, true);
      if (Array.isArray(origins)) {
        for (const allowed of origins) {
          if (allowed.includes("*")) {
            const escaped = allowed.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
            if (new RegExp(`^${escaped}$`).test(origin)) return callback(null, true);
          }
        }
      }
      logger.warn({ msg: "[CORS] Origin rejected", origin });
      return callback(new Error(`Origin ${origin} not allowed by CORS policy`), false);
    },
    methods: c.methods ?? ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: c.allowedHeaders ?? [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-CSRF-Token",
      "Accept",
      "Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers"
    ],
    credentials: c.credentials !== false,
    maxAge: c.maxAge ?? 86400,
    optionsSuccessStatus: 204
  };
};
var app = express2__default.default();
async function createApp() {
  const { config: config2 } = await Promise.resolve().then(() => (init_GlobalConfig(), GlobalConfig_exports));
  app.set("trust proxy", 1);
  app.use(
    helmet__default.default({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );
  const corsOptions = getCorsOptions();
  app.use(cors__default.default(corsOptions));
  app.options("/{*path}", cors__default.default(corsOptions));
  app.use((req, res, next) => {
    if (req._skipJsonParsing) return next();
    return express2.json()(req, res, next);
  });
  configureCoreMiddleware(app, config2, supabaseServiceClientConnection);
  try {
    const isProduction = config2.server.nodeEnv === "production";
    const currentDir = process.cwd();
    const manifestPath = path2__default.default.join(currentDir, "static", "routes-manifest.json");
    const sitemapMiddleware = generateSitemapMiddleware({
      supabaseClient: supabaseServiceClientConnection,
      baseURL: config2.server.frontendDomainUrl ?? "http://localhost:5173",
      routesPath: isProduction ? void 0 : path2__default.default.join(currentDir, "../web/src/routes"),
      routesManifestPath: isProduction ? manifestPath : void 0
    });
    app.get("/sitemap.xml", sitemapMiddleware);
    logger.info({ msg: "[Setup] Sitemap endpoint mounted at /sitemap.xml" });
  } catch (error) {
    logger.error({
      msg: "[Setup] Failed to mount sitemap (non-fatal)",
      error: error instanceof Error ? error.message : String(error)
    });
  }
  app.get("/", (_req, res) => {
    res.status(200).json({
      success: true,
      message: "API is running",
      version: "1.0.0",
      health: "/health",
      sitemap: "/sitemap.xml"
    });
  });
  app.get("/health", (_req, res) => {
    res.status(200).json({ server: "ok" });
  });
  app.get("/debug-sentry", function mainHandler(_req, res) {
    throw new Error("My first Sentry error!");
  });
  const mounted = await mountAllRoutes(app, config2);
  if (!mounted) {
    logger.error({ msg: "[Setup] Failed to mount API routes" });
    throw new Error("Failed to mount API routes");
  }
  Sentry__namespace.setupExpressErrorHandler(app);
  app.use(errorHandler);
  logger.info({ msg: "[App] Application initialized successfully." });
  return app;
}
if (!process.env.VERCEL) {
  createApp().then(async (configuredApp) => {
    const { config: config2 } = await Promise.resolve().then(() => (init_GlobalConfig(), GlobalConfig_exports));
    const port = config2.server.port ?? 3e3;
    if (process.env.JEST_WORKER_ID) {
      return;
    }
    const server2 = http__default.default.createServer(configuredApp);
    server2.maxHeaderSize = 32 * 1024;
    server2.listen(port, () => {
      logger.info({ msg: "[server] Server is running", port });
    });
  }).catch((error) => {
    logger.error({ msg: "[App] CRITICAL: Failed to initialize application", error: error instanceof Error ? error.message : String(error) });
    logger.error({
      msg: "[App] Error stack",
      stack: error instanceof Error ? error.stack : "No stack trace"
    });
    process.exit(1);
  });
}

// handler/index.ts
var appPromise = null;
function getApp() {
  if (!appPromise) {
    appPromise = createApp();
  }
  return appPromise;
}
async function handler(req, res) {
  const app2 = await getApp();
  app2(req, res);
}

module.exports = handler;
