/*
  # Create User Profiles Table and Fix RLS

  ## Overview
  This migration creates the missing user_profiles table and applies performance
  and security fixes to existing RLS policies.

  ## New Tables

  ### user_profiles
  - `id` (uuid, primary key, references auth.users)
  - `email` (text) - user's email address
  - `is_pro` (boolean, default false) - whether user has Pro plan
  - `stripe_customer_id` (text, nullable) - linked Stripe customer ID
  - `stripe_subscription_id` (text, nullable) - linked Stripe subscription ID
  - `subscription_status` (text, nullable) - current subscription status
  - `created_at` (timestamptz) - record creation time
  - `updated_at` (timestamptz) - last update time

  ## Security
  - RLS enabled on user_profiles
  - SELECT, INSERT, UPDATE policies for authenticated users (own data only)
  - Trigger to auto-create profile on new user signup

  ## RLS Optimizations
  - Recreates policies on secrets, stripe_customers, stripe_subscriptions, stripe_orders
    using (select auth.uid()) subquery pattern for better performance
  - Drops unused indexes

  ## Functions
  - update_updated_at_column: Trigger function with secure search_path
  - handle_new_user: Auto-creates user profile on signup
*/

-- ============================================================================
-- 1. CREATE USER_PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  is_pro boolean DEFAULT false NOT NULL,
  stripe_customer_id text DEFAULT NULL,
  stripe_subscription_id text DEFAULT NULL,
  subscription_status text DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ============================================================================
-- 2. FIX update_updated_at_column FUNCTION (secure search_path)
-- ============================================================================

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

-- Add updated_at trigger to user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. CREATE handle_new_user FUNCTION AND TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, is_pro)
  VALUES (NEW.id, NEW.email, false)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- 4. OPTIMIZE SECRETS TABLE RLS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own secrets" ON secrets;
DROP POLICY IF EXISTS "Users can insert own secrets" ON secrets;
DROP POLICY IF EXISTS "Users can update own secrets" ON secrets;
DROP POLICY IF EXISTS "Users can delete own secrets" ON secrets;

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
-- 5. OPTIMIZE STRIPE_CUSTOMERS TABLE RLS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;

CREATE POLICY "Users can view their own customer data"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()) AND deleted_at IS NULL);

-- ============================================================================
-- 6. OPTIMIZE STRIPE_SUBSCRIPTIONS TABLE RLS POLICIES
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
-- 7. OPTIMIZE STRIPE_ORDERS TABLE RLS POLICIES
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
-- 8. DROP UNUSED INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_secrets_updated_at;
DROP INDEX IF EXISTS idx_user_profiles_stripe_customer;
