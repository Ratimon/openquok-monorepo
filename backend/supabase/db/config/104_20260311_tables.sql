-- ---------------------------
-- MODULE NAME: CONFIG
-- MODULE DATE: 20260311
-- MODULE SCOPE: Tables
-- ---------------------------

BEGIN;

-- ---------------------------
-- MODULE CONFIGS
-- ---------------------------

CREATE TABLE IF NOT EXISTS public.module_configs (
  module_name TEXT PRIMARY KEY,
  config JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
