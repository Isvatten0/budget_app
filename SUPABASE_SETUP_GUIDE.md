# 🔧 Supabase Setup Guide - Fix Database Issues

## 🚨 **Current Issue: App Not Loading/Saving Data**

If your app is failing to load or save data after deleting tables, follow this complete setup guide.

## 📋 **Step-by-Step Fix**

### **Step 1: Environment Variables**
First, make sure you have the correct environment variables set up:

1. **Create a `.env` file** in your project root:
```bash
cp .env.example .env
```

2. **Fill in your Supabase credentials** in the `.env` file:
```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

3. **Get your credentials from Supabase Dashboard:**
   - Go to your Supabase project dashboard
   - Click on "Settings" → "API"
   - Copy the "Project URL" and "anon public" key

### **Step 2: Complete Database Reset**
Run the complete setup script in your Supabase SQL Editor:

1. **Go to Supabase Dashboard** → "SQL Editor"
2. **Copy and paste** the entire contents of `supabase-setup-complete.sql`
3. **Run the script** - this will:
   - Drop all existing tables
   - Create all tables with proper structure
   - Set up RLS policies
   - Create triggers and functions
   - Grant proper permissions

### **Step 3: Verify Setup**
After running the script, verify these tables exist in Supabase:

**Required Tables:**
- ✅ `users`
- ✅ `user_settings`
- ✅ `bank_balances`
- ✅ `income_entries`
- ✅ `recurring_income`
- ✅ `recurring_expenses`
- ✅ `goals`
- ✅ `goal_contributions`
- ✅ `transactions`
- ✅ `credit_cards`
- ✅ `credit_card_transactions`
- ✅ `credit_card_payments`

### **Step 4: Check RLS Policies**
In Supabase Dashboard → "Authentication" → "Policies", verify these policies exist:

**For each table, you should see:**
- Users can view own [table_name]
- Users can insert own [table_name]
- Users can update own [table_name]
- Users can delete own [table_name]

### **Step 5: Test Authentication**
1. **Restart your development server:**
```bash
npm start
```

2. **Try to sign up/sign in** - this should create user records automatically

3. **Check the database** - you should see:
   - A record in `auth.users` (Supabase Auth)
   - A record in `public.users` (your app's user table)
   - A record in `public.user_settings` (default settings)

## 🔍 **Troubleshooting Common Issues**

### **Issue 1: "Failed to load data"**
**Cause:** Missing RLS policies or incorrect permissions
**Fix:** Run the complete setup script again

### **Issue 2: "User not authenticated"**
**Cause:** Environment variables not set correctly
**Fix:** Check your `.env` file and restart the server

### **Issue 3: "Database error saving new user"**
**Cause:** Missing trigger or function
**Fix:** Run the complete setup script again

### **Issue 4: "Cannot read properties of null"**
**Cause:** User settings not created automatically
**Fix:** Sign out and sign back in, or manually create settings

## 🧪 **Testing the Fix**

After completing the setup:

1. **Sign up with a new account**
2. **Try to add a bank balance** - should work
3. **Try to add a bill** - should work
4. **Try to add income** - should work
5. **Try to create a goal** - should work

## 📞 **If Still Not Working**

1. **Check browser console** for specific error messages
2. **Check Supabase logs** in Dashboard → "Logs"
3. **Verify all tables exist** in Dashboard → "Table Editor"
4. **Test with a fresh browser session** (clear cache/cookies)

## 🔄 **Complete Reset Process**

If you need to start completely fresh:

1. **Delete all tables** in Supabase Dashboard
2. **Run the complete setup script**
3. **Create a new `.env` file** with correct credentials
4. **Restart your development server**
5. **Sign up with a new account**

## ✅ **Success Indicators**

When everything is working correctly, you should see:

- ✅ Dashboard loads with empty state
- ✅ Can add bank balance
- ✅ Can create bills
- ✅ Can add income
- ✅ Can create goals
- ✅ Settings modal works
- ✅ Theme switching works
- ✅ Navigation works

---

**Need Help?** Check the browser console for specific error messages and share them for more targeted assistance.