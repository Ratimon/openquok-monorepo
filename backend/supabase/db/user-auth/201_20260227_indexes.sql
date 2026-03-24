-- ---------------------------
-- MODULE NAME: User Auth
-- MODULE DATE: 20260227
-- MODULE SCOPE: Indexes
-- ---------------------------

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON public.refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON public.refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON public.refresh_tokens(expires_at);

-- OAuth: unique (provider, provider_id) on public.users
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_provider_id
ON public.users (provider, provider_id)
WHERE provider IS NOT NULL AND provider_id IS NOT NULL;
