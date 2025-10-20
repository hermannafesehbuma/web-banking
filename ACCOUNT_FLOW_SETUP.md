# Fortiz Bank Account Opening Flow - Setup Guide

## Overview

Complete account opening flow from signup to dashboard, integrated with your existing Supabase tables.

## Flow Summary

1. **Homepage** → Click "Open Account" → `/open-account` (info page with links to signup/login)
2. **Signup** → `/auth/signup` → Creates user in `auth.users` and inserts into `bank_users`
3. **Email Verification** → User clicks link → Supabase confirms email
4. **KYC Upload** → `/kyc` → Uploads document to Supabase Storage and inserts into `kyc_submissions`
5. **Admin Review** → `/admin/kyc` → Admin approves/rejects KYC
6. **Account Creation** → Trigger auto-creates checking + savings accounts in `accounts` table
7. **Dashboard** → `/dashboard` → Shows accounts and balances

---

## Pages Created

### 1. Authentication Pages

- **`/auth/signup`** - Sign up with email, password, full name

  - Creates user in Supabase Auth
  - Inserts record into `bank_users` table with `kyc_status='pending'`
  - Redirects to `/auth/verify`

- **`/auth/login`** - Login with email/password

  - Validates credentials
  - Redirects to `/dashboard`

- **`/auth/verify`** - Email verification notice
  - Static page showing instructions

### 2. KYC Page

- **`/kyc`** - Upload identity documents
  - Protected route (requires authentication)
  - Uploads file to Supabase Storage bucket `kyc`
  - Inserts into `kyc_submissions` table with `status='pending'`
  - Shows success message

### 3. Dashboard

- **`/dashboard`** - View accounts
  - Protected route (requires authentication + `kyc_status='approved'`)
  - Fetches accounts from `accounts` table
  - Displays checking and savings accounts with balances

### 4. Admin Page

- **`/admin/kyc`** - Review KYC submissions
  - Lists all KYC submissions with user info
  - Approve/Reject buttons
  - Updates `kyc_submissions.status` and `reviewed_at`
  - On approval, trigger auto-creates accounts (via your Supabase trigger)

---

## Infrastructure Added

### 1. Middleware (`src/middleware.ts`)

- Protects `/dashboard` and `/kyc` routes
- Redirects unauthenticated users to `/auth/login`
- Redirects authenticated users from auth pages to `/dashboard`

### 2. Auth Context (`src/contexts/AuthContext.tsx`)

- Provides global user session state
- Listens for auth state changes
- Wrapped around app in `layout.tsx`

### 3. Updated Layout

- Added `<AuthProvider>` wrapper
- All pages now have access to auth state

---

## Supabase Setup Required

### 1. Storage Bucket

```sql
-- Create 'kyc' bucket in Supabase Storage
-- Set to authenticated users can upload
```

### 2. Verify Tables Exist

You mentioned tables are already set up. Ensure you have:

- `bank_users` (id, email, full_name, kyc_status, created_at)
- `kyc_submissions` (id, user_id, document_type, document_url, status, submitted_at, reviewed_at)
- `accounts` (id, user_id, account_type, account_number, balance, created_at)
- `transactions` (optional for later)

### 3. RLS Policies

Ensure Row Level Security is enabled and users can:

- Select their own `bank_users`, `accounts`, `transactions`
- Insert their own `kyc_submissions`
- Admins can update `kyc_submissions.status`

### 4. Trigger for Account Creation

The SQL schema file includes a trigger that auto-creates checking and savings accounts when `kyc_submissions.status` is updated to `'approved'`. Verify this trigger exists in your Supabase database.

---

## API Calls Summary

### Signup (`/auth/signup`)

```typescript
// 1. Create auth user
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { full_name: fullName } },
});

// 2. Insert into bank_users
await supabase.from('bank_users').insert({
  id: user.id,
  full_name: fullName,
  email,
  kyc_status: 'pending',
});
```

### Login (`/auth/login`)

```typescript
await supabase.auth.signInWithPassword({ email, password });
```

### KYC Upload (`/kyc`)

```typescript
// 1. Upload to storage
const filePath = `${userId}/${Date.now()}-${file.name}`;
await supabase.storage.from('kyc').upload(filePath, file);

// 2. Get public URL
const { data: publicUrl } = supabase.storage.from('kyc').getPublicUrl(filePath);

// 3. Insert submission
await supabase.from('kyc_submissions').insert({
  user_id: userId,
  document_type: docType,
  document_url: publicUrl.publicUrl,
  status: 'pending',
});
```

### Dashboard (`/dashboard`)

```typescript
// 1. Check KYC status
const { data: bankUser } = await supabase
  .from('bank_users')
  .select('kyc_status')
  .eq('id', user.id)
  .single();

// 2. Fetch accounts
const { data: accs } = await supabase
  .from('accounts')
  .select('id, account_number, account_type, balance')
  .eq('user_id', user.id)
  .order('created_at', { ascending: true });
```

### Admin KYC Review (`/admin/kyc`)

```typescript
// 1. List submissions
const { data } = await supabase
  .from('kyc_submissions')
  .select('*, bank_users(full_name, email)')
  .order('submitted_at', { ascending: false });

// 2. Update status
await supabase
  .from('kyc_submissions')
  .update({ status: newStatus, reviewed_at: new Date().toISOString() })
  .eq('id', id);
```

---

## Testing the Flow

1. **Start dev server**: `npm run dev`
2. **Open browser**: `http://localhost:3000`
3. **Click "Open an account"** → Go to `/auth/signup`
4. **Sign up** with email/password/name
5. **Check email** for verification link (Supabase Auth email)
6. **Click verification link** → Email confirmed
7. **Navigate to `/kyc`** → Upload a document
8. **As admin, go to `/admin/kyc`** → Approve the submission
9. **Navigate to `/dashboard`** → See checking and savings accounts

---

## Environment Variables

Ensure `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Next Steps

1. **Add transactions**: Build deposit/withdrawal/refund pages
2. **Email notifications**: Send emails when KYC is approved/rejected
3. **Admin dashboard**: Add more admin features (user management, transaction history)
4. **Account details**: Add individual account pages with transaction history
5. **Security**: Add 2FA, device management, session management

---

## File Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── verify/page.tsx
│   ├── kyc/page.tsx
│   ├── dashboard/page.tsx
│   ├── admin/
│   │   └── kyc/page.tsx
│   └── layout.tsx (with AuthProvider)
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   └── SupbaseClient.tsx
└── middleware.ts
```

---

## Troubleshooting

**Issue**: Users can't upload to KYC bucket

- **Fix**: Create `kyc` bucket in Supabase Storage with authenticated upload policy

**Issue**: Accounts not auto-created after KYC approval

- **Fix**: Verify trigger exists in Supabase (see `supabase/schema.sql`)

**Issue**: Middleware redirect loop

- **Fix**: Ensure session is being properly set in Supabase Auth

**Issue**: RLS policy blocking queries

- **Fix**: Check RLS policies match user_id with auth.uid()

---

All pages are responsive, use shadcn/ui components, and integrate with your existing Supabase tables!
