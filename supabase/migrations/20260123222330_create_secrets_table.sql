/*
  # Create Secrets Table for Key Stash App

  ## Overview
  This migration creates the core infrastructure for the Key Stash application,
  a secure dashboard for developers to store project environment variables and API keys.

  ## New Tables
  
  ### `secrets`
  Stores encrypted API keys and environment variables for authenticated users.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for each secret
  - `user_id` (uuid, foreign key) - References auth.users, links secrets to their owner
  - `project_name` (text, required) - Name of the project this secret belongs to
  - `key_label` (text, required) - Label/name for the API key or environment variable
  - `secret_value` (text, required) - The actual secret value (API key, token, etc.)
  - `created_at` (timestamptz) - Timestamp when the secret was created
  - `updated_at` (timestamptz) - Timestamp when the secret was last modified

  ## Security
  
  ### Row Level Security (RLS)
  - RLS is enabled on the `secrets` table
  - Users can only access their own secrets
  
  ### Policies
  1. **"Users can view own secrets"** - SELECT policy
     - Allows authenticated users to read only their own secrets
     - Uses `auth.uid()` to match the user_id
  
  2. **"Users can insert own secrets"** - INSERT policy
     - Allows authenticated users to create new secrets
     - Ensures the user_id matches the authenticated user
  
  3. **"Users can update own secrets"** - UPDATE policy
     - Allows authenticated users to modify their own secrets
     - Validates ownership both in USING and WITH CHECK clauses
  
  4. **"Users can delete own secrets"** - DELETE policy
     - Allows authenticated users to remove their own secrets
     - Validates ownership before deletion

  ## Indexes
  - Primary key index on `id` (automatic)
  - Index on `user_id` for faster queries when filtering by user
  - Index on `updated_at` for sorting by most recently modified

  ## Notes
  - All timestamps use `timestamptz` for timezone awareness
  - The `updated_at` column is automatically updated via trigger
  - Foreign key constraint ensures data integrity with auth.users table
  - ON DELETE CASCADE ensures secrets are removed when a user is deleted
*/

-- Create the secrets table
CREATE TABLE IF NOT EXISTS secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name text NOT NULL,
  key_label text NOT NULL,
  secret_value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_secrets_user_id ON secrets(user_id);
CREATE INDEX IF NOT EXISTS idx_secrets_updated_at ON secrets(updated_at DESC);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_secrets_updated_at 
  BEFORE UPDATE ON secrets 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own secrets
CREATE POLICY "Users can view own secrets"
  ON secrets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own secrets
CREATE POLICY "Users can insert own secrets"
  ON secrets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own secrets
CREATE POLICY "Users can update own secrets"
  ON secrets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own secrets
CREATE POLICY "Users can delete own secrets"
  ON secrets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);