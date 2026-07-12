-- Migrate: Confirm all previously unconfirmed users
-- After disabling email confirmation, this ensures existing users can log in without interruption.
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;
