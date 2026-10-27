-- Block members from granting themselves privileges, paid plans or discounts.
--
-- Before this migration:
--   * "Users can update own profile" had no column restriction, so a member could set
--     role = 'admin', plan, status or reputation_score on their own row.
--   * "Admins and Elite can update other profiles" let anyone with reputation_score > 80
--     update ANY profile, including role. Combined with the point above, any member could
--     raise their own score and then take over other accounts.
--   * "System can manage user_plans" / "System can manage user_matches" let a member
--     insert or change their own plan rows and monthly match counts. Match counts drive the
--     plan discount (up to 30%) in the calculate-plan-price function.
--   * increment_user_match_count was SECURITY DEFINER and executable by any role, for any user.
--
-- Server-side code is not affected: Edge Functions use the service role, and SECURITY DEFINER
-- functions run as their owner, so both pass the checks below. Admins keep full access.

-- 1. Privileged profile columns can only be changed by admins or server-side code.
-- SECURITY INVOKER on purpose: current_user must reflect the caller, not the function owner.
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Server-side code (service_role, postgres, SECURITY DEFINER functions) and admins are allowed.
  IF current_user NOT IN ('authenticated', 'anon') OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    -- A client-side insert can never create a privileged profile.
    NEW.role := 'user';
    NEW.plan := 'Free';
    NEW.status := 'pending_validation';
    NEW.reputation_score := 0;
    NEW.suggestion_points := 0;
    NEW.discount_tier := NULL;
    NEW.validated_by := NULL;
    NEW.validation_date := NULL;
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.plan IS DISTINCT FROM OLD.plan
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.reputation_score IS DISTINCT FROM OLD.reputation_score
     OR NEW.suggestion_points IS DISTINCT FROM OLD.suggestion_points
     OR NEW.discount_tier IS DISTINCT FROM OLD.discount_tier
     OR NEW.referral_code IS DISTINCT FROM OLD.referral_code
     OR NEW.referred_by_id IS DISTINCT FROM OLD.referred_by_id
     OR NEW.validated_by IS DISTINCT FROM OLD.validated_by
     OR NEW.validation_date IS DISTINCT FROM OLD.validation_date
  THEN
    RAISE EXCEPTION 'Not allowed to change privileged profile fields'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_privileged_columns ON public.profiles;
CREATE TRIGGER trg_protect_profile_privileged_columns
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileged_columns();

-- 2. Elite members no longer get blanket UPDATE on other profiles.
--    "Admins can update all profiles" (public.is_admin()) remains for admins.
DROP POLICY IF EXISTS "Admins and Elite can update other profiles" ON public.profiles;

-- 3. Member validation by elite members goes through a checked function instead.
CREATE OR REPLACE FUNCTION public.validate_member(p_target_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_is_admin boolean := public.is_admin();
  v_caller_score integer;
  v_target public.profiles%ROWTYPE;
  v_new_score integer;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  SELECT reputation_score INTO v_caller_score FROM public.profiles WHERE id = v_caller;

  IF NOT v_is_admin AND COALESCE(v_caller_score, 0) <= 80 THEN
    RAISE EXCEPTION 'Reputation too low to validate members' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_target FROM public.profiles WHERE id = p_target_id FOR UPDATE;

  IF NOT FOUND OR v_target.status <> 'pending_validation' THEN
    RAISE EXCEPTION 'Member is not pending validation' USING ERRCODE = 'P0001';
  END IF;

  -- Non-admins can only validate members who signed up with their own referral code.
  IF NOT v_is_admin AND v_target.referral_code IS DISTINCT FROM v_caller::text THEN
    RAISE EXCEPTION 'You can only validate members you invited' USING ERRCODE = '42501';
  END IF;

  UPDATE public.profiles
     SET status = 'active',
         validated_by = v_caller,
         validation_date = now()
   WHERE id = p_target_id;

  UPDATE public.profiles
     SET reputation_score = COALESCE(reputation_score, 0) + 5
   WHERE id = v_caller
  RETURNING reputation_score INTO v_new_score;

  RETURN v_new_score;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.validate_member(uuid) TO authenticated;

-- 4. Plans and monthly match counts are read-only for members.
DROP POLICY IF EXISTS "System can manage user_plans" ON public.user_plans;
DROP POLICY IF EXISTS "Admins can manage user_plans" ON public.user_plans;
CREATE POLICY "Admins can manage user_plans" ON public.user_plans
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "System can manage user_matches" ON public.user_matches;
DROP POLICY IF EXISTS "Admins can manage user_matches" ON public.user_matches;
CREATE POLICY "Admins can manage user_matches" ON public.user_matches
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- "Users can view own plans" and "Users can view own matches" (SELECT) are kept.

-- 5. Only server-side code may increment match counts.
REVOKE ALL ON FUNCTION public.increment_user_match_count(uuid, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_user_match_count(uuid, integer, integer) TO service_role;
