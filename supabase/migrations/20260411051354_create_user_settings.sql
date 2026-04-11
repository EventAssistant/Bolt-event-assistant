/*
  # Create user_settings table

  1. New Tables
    - `user_settings`
      - `user_id` (uuid, primary key, references auth.users)
      - `emailjs_public_key` (text)
      - `emailjs_service_id` (text)
      - `emailjs_template_id` (text)
      - `emailjs_sender_name` (text)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_settings` table
    - Users can only read and write their own settings row
*/

CREATE TABLE IF NOT EXISTS user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  emailjs_public_key text NOT NULL DEFAULT '',
  emailjs_service_id text NOT NULL DEFAULT '',
  emailjs_template_id text NOT NULL DEFAULT '',
  emailjs_sender_name text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
