-- ---------------------------
-- MODULE NAME: User Auth
-- MODULE DATE: 20260227
-- MODULE SCOPE: Functions
-- ---------------------------

BEGIN;

-- ---------------------------
-- Sync auth.users -> public.users
-- ---------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, auth_id, email, full_name)
  VALUES (
    new.id,
    new.id,
    new.email,
    COALESCE((new.raw_user_meta_data->>'full_name')::text, new.email)
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
