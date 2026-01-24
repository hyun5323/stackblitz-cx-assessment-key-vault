/*
  # Fix RLS Performance and Security Issues

  ## Overview
  This migration addresses performance and security issues identified by Supabase:
  - Optimizes RLS policies by using `(select auth.uid())` instead of `auth.uid()`
  - Removes unused indexes to reduce storage overhead
  - Fixes function search paths for security

  ## Changes

  ### 1. RLS Policy Optimization
  
  #### Secrets Table
  - Recreates 4 policies with optimized auth function calls
  - Prevents re-evaluation of auth.uid() for each row
  
  #### Stripe_Customers Table
  - Optimizes SELECT policy with subquery pattern
  
  #### Stripe_Subscriptions Table
  - Optimizes SELECT policy with subquery pattern
  
  #### Stripe_Orders Table
  - Optimizes SELECT policy with subquery pattern
  
  #### User_Profiles Table
  - Recreates 3 policies with optimized auth function calls

  ### 2. Index Cleanup
  - Drops `idx_secrets_updated_at` (unused)
  - Drops `idx_user_profiles_stripe_customer` (unused)

  ### 3. Function Security
  - Sets explicit search_path for `update_updated_at_column`
  - Sets explicit search_path for `handle_new_user`

  ## Performance Impact
  These changes significantly improve query performance at scale by:
  - Reducing function call overhead in RLS policies
  - Eliminating unnecessary index maintenance
  - Preventing search_path manipulation vulnerabilities
*/

-- ============================================================================
-- 1. FIX SECRETS TABLE RLS POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own secrets" ON secrets;
DROP POLICY IF EXISTS "Users can insert own secrets" ON secrets;
DROP POLICY IF EXISTS "Users can update own secrets" ON secrets;
DROP POLICY IF EXISTS "Users can delete own secrets" ON secrets;

-- Recreate with optimized auth function calls
CREATE POLICY "Users can view own secrets"
  ON secrets
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own secrets"
  ON secrets
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own secrets"
  ON secrets
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own secrets"
  ON secrets
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- 2. FIX STRIPE_CUSTOMERS TABLE RLS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;

CREATE POLICY "Users can view their own customer data"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()) AND deleted_at IS NULL);

-- ============================================================================
-- 3. FIX STRIPE_SUBSCRIPTIONS TABLE RLS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;

CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id
      FROM stripe_customers
      WHERE user_id = (select auth.uid()) AND deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- ============================================================================
-- 4. FIX STRIPE_ORDERS TABLE RLS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;

CREATE POLICY "Users can view their own order data"
  ON stripe_orders
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id
      FROM stripe_customers
      WHERE user_id = (select auth.uid()) AND deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- ============================================================================
-- 5. FIX USER_PROFILES TABLE RLS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- ============================================================================
-- 6. DROP UNUSED INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_secrets_updated_at;
DROP INDEX IF EXISTS idx_user_profiles_stripe_customer;

-- ============================================================================
-- 7. FIX FUNCTION SEARCH PATHS
-- ============================================================================

-- Recreate update_updated_at_column with explicit search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate handle_new_user with explicit search_path if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'handle_new_user'
  ) THEN
    -- Drop and recreate the function with proper search_path
    DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
    
    CREATE OR REPLACE FUNCTION handle_new_user()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, pg_temp
    AS $func$
    BEGIN
      INSERT INTO public.user_profiles (id, email, is_pro)
      VALUES (NEW.id, NEW.email, false);
      RETURN NEW;
    END;
    $func$;
    
    -- Recreate the trigger
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END
$$;
