# MFO Ice Management System - Database Setup

## Prerequisites

- A [Supabase](https://supabase.com) account (free tier works)
- Node.js 18+ installed

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `mfo-ice-management`
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
5. Click "Create new project" (takes ~2 minutes)

## Step 2: Run Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click "Run" (this creates all tables, indexes, and RLS policies)

## Step 3: Add Seed Data

1. In SQL Editor, create a new query
2. Copy the contents of `supabase/seed.sql`
3. Paste and run (this adds default checklist items and sample data)

## Step 4: Configure Environment Variables

1. In Supabase dashboard, go to **Settings > API**
2. Copy your project URL and anon key
3. Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 5: Create Your First User

### Option A: Using Supabase Auth UI (Recommended)

1. In Supabase dashboard, go to **Authentication > Users**
2. Click "Add user" > "Create new user"
3. Enter email and password
4. After creating the auth user, add their profile to the `users` table:

```sql
INSERT INTO users (id, email, full_name, role, facility_id)
VALUES (
  'auth-user-id-here',  -- Copy from Authentication > Users
  'admin@yourfacility.com',
  'Admin Name',
  'facility_manager',
  'd0000000-0000-0000-0000-000000000001'  -- Sample facility ID from seed
);
```

### Option B: Using SQL

```sql
-- First create the auth user (dashboard or API)
-- Then insert the profile:
INSERT INTO users (id, email, full_name, role, facility_id)
SELECT
  id,
  email,
  'Your Name',
  'facility_manager',
  'd0000000-0000-0000-0000-000000000001'
FROM auth.users
WHERE email = 'your-email@example.com';
```

## Step 6: Verify Setup

1. Restart your dev server: `npm run dev`
2. The app should now connect to Supabase instead of demo mode
3. Log in with your created user credentials

## Database Schema Overview

| Table | Purpose |
|-------|---------|
| `facilities` | Ice rink facilities/buildings |
| `users` | User profiles (linked to Supabase auth) |
| `rinks` | Individual ice rinks within facilities |
| `resurfacers` | Zamboni/Olympia machines |
| `ice_depth_measurements` | Ice thickness readings |
| `ice_make_logs` | Resurfacing activity logs |
| `circle_check_logs` | Pre-operation inspections |
| `blade_change_logs` | Blade replacement records |
| `end_of_day_reports` | Daily summary reports |
| `checklist_items` | Templates for circle checks |
| `custom_templates` | Custom measurement point layouts |
| `bluetooth_devices` | Paired caliper devices |

## Row Level Security (RLS)

All tables have RLS enabled. Users can only:
- View data from their assigned facility
- Create/update data within their facility
- Users cannot access other facilities' data

## Troubleshooting

### "Supabase credentials not found" warning
- Ensure `.env.local` exists with correct values
- Restart the dev server after adding env vars

### "User not found" after login
- Make sure you added the user to both `auth.users` AND `users` tables
- The `users.id` must match the `auth.users.id`

### RLS policy errors
- Check that the user has a valid `facility_id` in the `users` table
- Verify the facility exists in the `facilities` table

## Production Deployment

For production, set environment variables in your hosting platform:
- Vercel: Project Settings > Environment Variables
- Netlify: Site Settings > Environment Variables
- Railway: Variables tab
