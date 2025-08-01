# Troubleshooting Guide

## "Database error saving new user" Error

This error typically occurs due to missing Row Level Security (RLS) policies or incorrect database setup. Here's how to fix it:

### 1. **Check Supabase Project Settings**

1. Go to your Supabase project dashboard
2. Navigate to **Authentication > Settings**
3. Make sure **"Enable email confirmations"** is **OFF** for testing (or check your email for confirmation)
4. Ensure **"Enable email change confirmations"** is **OFF** for testing

### 2. **Update Database Schema**

The original schema was missing crucial INSERT policies. Use the fixed schema:

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `database-schema-fixed.sql`
3. Run the SQL script

### 3. **Key Changes in Fixed Schema**

The fixed schema includes:

- **INSERT policies** for `users` and `user_settings` tables
- **Better error handling** in the trigger function
- **ON CONFLICT clauses** to prevent duplicate insert errors
- **Proper trigger recreation** with DROP IF EXISTS

### 4. **Verify RLS Policies**

After running the fixed schema, check that these policies exist:

```sql
-- Check users table policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Check user_settings table policies  
SELECT * FROM pg_policies WHERE tablename = 'user_settings';
```

You should see policies for SELECT, INSERT, and UPDATE operations.

### 5. **Test the Setup**

1. Try signing up with a new email
2. Check the **Logs** section in Supabase for any errors
3. Verify that user records are created in both `auth.users` and `public.users` tables

### 6. **Common Issues and Solutions**

#### Issue: "Row Level Security policy violation"
**Solution**: The INSERT policies were missing. Use the fixed schema.

#### Issue: "Duplicate key value violates unique constraint"
**Solution**: The trigger function now includes `ON CONFLICT DO NOTHING` clauses.

#### Issue: "Function does not exist"
**Solution**: The trigger function needs to be recreated. The fixed schema includes `DROP TRIGGER IF EXISTS`.

#### Issue: "Permission denied"
**Solution**: Check that your Supabase API keys are correct in `.env` file.

### 7. **Environment Variables**

Make sure your `.env` file has the correct values:

```bash
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

### 8. **Check Supabase Logs**

1. Go to **Logs** in your Supabase dashboard
2. Look for any error messages related to user creation
3. The trigger function now logs errors with `RAISE LOG`

### 9. **Manual Database Check**

Run these queries to verify the setup:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('users', 'user_settings');

-- Check if policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('users', 'user_settings');

-- Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

### 10. **Reset if Needed**

If you're still having issues, you can reset the database:

1. **WARNING**: This will delete all data
2. Go to **Settings > Database** in Supabase
3. Click **"Reset Database"**
4. Run the fixed schema again

### 11. **Alternative: Manual User Creation**

If the trigger still doesn't work, you can manually create user records:

```sql
-- Insert into public.users (run this after user signs up)
INSERT INTO public.users (id, email, created_at)
SELECT id, email, created_at FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.users);

-- Insert into user_settings (run this after user signs up)
INSERT INTO public.user_settings (user_id, last_pay_date)
SELECT id, CURRENT_DATE FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM public.user_settings);
```

## Still Having Issues?

1. Check the **Network** tab in browser dev tools for API errors
2. Look at **Supabase Logs** for detailed error messages
3. Verify your **Supabase project** is on a paid plan (free tier has limitations)
4. Make sure your **database** is not paused (free tier pauses after inactivity)

## Contact Support

If you're still experiencing issues:
1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Visit the [Supabase Discord](https://discord.supabase.com)
3. Create an issue in this repository with detailed error messages