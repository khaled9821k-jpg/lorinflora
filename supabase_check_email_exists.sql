-- Supabase RPC Function: check_email_exists
-- Purpose: Securely checks if an email is registered in auth.users without exposing sensitive auth tables.
-- Used by: Lorin Flora Smart Email Detection (lorin-auth.js)

CREATE OR REPLACE FUNCTION public.check_email_exists(email_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Return true if email matches any active user in auth.users (case-insensitive)
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE LOWER(email) = LOWER(TRIM(email_input))
  );
END;
$$;

-- Grant execution rights to anon (visitors) and authenticated users
GRANT EXECUTE ON FUNCTION public.check_email_exists(text) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.check_email_exists(text) IS 'Checks whether an email is registered in Lorin Flora auth.users for smart login routing.';
