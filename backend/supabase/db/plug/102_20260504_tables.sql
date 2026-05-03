-- ---------------------------
-- MODULE NAME: plug
-- MODULE DATE: 20260504
-- MODULE SCOPE: Tables (allow multiple global plug rows per integration + plug_function)
-- ---------------------------
-- Drops unique (integration_id, plug_function) so channels can stack several rules of the same type
-- (e.g. multiple auto-threshold replies). Identity is `plugs.id`.

BEGIN;

ALTER TABLE public.plugs DROP CONSTRAINT IF EXISTS uq_plugs_integration_function;

COMMIT;

-- ---------------------------
-- END OF FILE
-- ---------------------------
