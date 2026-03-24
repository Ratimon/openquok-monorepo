-- ---------------------------
-- MODULE NAME: User Auth
-- MODULE DATE: 20260227
-- MODULE SCOPE: Seed
-- ---------------------------

BEGIN;

-- ---------------------------
-- User Auth Config (optional: ensure module_configs exists)
-- ---------------------------


INSERT INTO public.module_configs (module_name, config) VALUES
('user_auth', '{
  "ALLOW_USER_SIGNUPS": "true"
}'::jsonb);


-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
