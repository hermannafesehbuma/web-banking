# 🔧 KYC Submission Troubleshooting Guide

## "Submission failed" Error - Common Causes

### 1. Storage Bucket Not Created ⚠️ MOST COMMON

**Issue**: The `fortiz-storage` bucket doesn't exist in Supabase.

**Solution**:

1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `fortiz-storage`
4. Set to **Public** or **Private** (recommend Private with RLS)
5. Click "Create bucket"

---

### 2. Storage Upload Permissions

**Issue**: RLS policies block authenticated users from uploading.

**Solution - Add Storage Policies**:

```sql
-- Go to Supabase Dashboard → Storage → fortiz-storage → Policies

-- Policy 1: Allow authenticated users to upload to their own folder
insert into storage.policies (name, bucket_id, definition)
values (
  'Users can upload to own folder',
  'fortiz-storage',
  '(bucket_id = ''fortiz-storage'' AND (storage.foldername(name))[1] = auth.uid()::text)'
);

-- Policy 2: Allow users to read their own files
insert into storage.policies (name, bucket_id, definition)
values (
  'Users can read own files',
  'fortiz-storage',
  '(bucket_id = ''fortiz-storage'' AND (storage.foldername(name))[1] = auth.uid()::text)'
);

-- OR use Supabase UI to add policies:
-- Storage → fortiz-storage → Policies → New Policy
-- Template: "Allow authenticated uploads for a user"
```

---

### 3. Database Insert Failure

**Issue**: The `kyc_submissions` table doesn't exist or has wrong columns.

**Solution - Run Schema**:

1. Open Supabase Dashboard → SQL Editor
2. Paste contents from `supabase/schema.sql`
3. Run the SQL to create tables

**Verify Columns**:

```sql
-- Check if table exists with correct columns
select column_name, data_type
from information_schema.columns
where table_name = 'kyc_submissions';

-- Should show:
-- id, user_id, identification_type, identification_number,
-- document_urls, selfie_url, address, phone_number,
-- proof_of_address_url, status, submitted_at, reviewed_at
```

---

### 4. RLS Policy Blocking Insert

**Issue**: Row Level Security prevents user from inserting.

**Solution - Check Policies**:

```sql
-- Verify this policy exists:
create policy if not exists kyc_insert_owner on public.kyc_submissions
for insert with check (auth.uid() = user_id);
```

---

### 5. Missing Required Data

**Issue**: One of the required fields is missing/null.

**Check in Browser Console**:
The error is now logged with `console.error()`. Open DevTools (F12) and check:

- Is `documentUrls` array empty?
- Is `selfieUrl` undefined?
- Is `proofUrl` undefined?

**Debug Insert Data**:
Add this before the insert to see what's being sent:

```typescript
console.log('Inserting KYC data:', {
  user_id: userId,
  identification_type: idType,
  identification_number: idNumber,
  document_urls: documentUrls,
  selfie_url: selfieUrl,
  address,
  phone_number: phoneNumber,
  proof_of_address_url: proofUrl,
});
```

---

## Quick Diagnostic Checklist

### Before Testing KYC:

- [ ] Supabase project is running
- [ ] Storage bucket `fortiz-storage` exists
- [ ] Storage bucket has upload/read policies for authenticated users
- [ ] `kyc_submissions` table exists with all columns
- [ ] RLS policy allows user insert: `auth.uid() = user_id`
- [ ] User is logged in and email is verified
- [ ] Browser console is open (F12) to see errors

### During KYC Submission:

1. Open browser DevTools (F12) → Console tab
2. Fill out Step 1 (ID info + documents)
3. Fill out Step 2 (selfie)
4. Fill out Step 3 (address + proof)
5. Click "Submit KYC"
6. **Check Console** for errors:
   - Storage upload errors?
   - Database insert errors?
   - Network errors?

---

## Expected Console Output (Success)

```
Inserting KYC data: {
  user_id: "abc-123-uuid",
  identification_type: "ssn",
  identification_number: "123-45-6789",
  document_urls: [
    "https://...storage.../id-front-...",
    "https://...storage.../id-back-..."
  ],
  selfie_url: "https://...storage.../selfie-...",
  address: "123 Main St, City, State, 12345",
  phone_number: "+1 555 000 0000",
  proof_of_address_url: "https://...storage.../proof-address-...",
}
```

---

## Storage Policy Examples (Supabase UI)

### Option 1: Using Supabase Dashboard

1. Storage → `fortiz-storage` → Policies tab
2. Click "New policy"
3. Choose template: **"Allow authenticated uploads for a user"**
4. Modify the policy name and save

### Option 2: SQL

```sql
-- Enable RLS on storage.objects
alter table storage.objects enable row level security;

-- Upload policy
create policy "Authenticated users can upload to own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'fortiz-storage' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Read policy
create policy "Users can read own files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'fortiz-storage' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## Testing Upload Directly

**Test Storage Upload in Browser Console:**

```javascript
// Paste in browser console (on any page while logged in)
const { data, error } = await supabase.storage
  .from('fortiz-storage')
  .upload('test/test.txt', new Blob(['hello']), {
    upsert: true,
  });

console.log('Upload result:', { data, error });
// If error → check bucket exists and policies are set
```

---

## Common Error Messages

| Error Message                                | Cause                  | Fix                                           |
| -------------------------------------------- | ---------------------- | --------------------------------------------- |
| "new row violates row-level security policy" | RLS blocking insert    | Add insert policy for `kyc_submissions`       |
| "Bucket not found"                           | Storage bucket missing | Create `fortiz-storage` bucket                |
| "Permission denied"                          | Storage policy missing | Add upload policy to bucket                   |
| "violates check constraint"                  | Invalid enum value     | Check `identification_type` is 'ssn' or 'tin' |
| "null value in column"                       | Required field missing | Ensure all fields are filled                  |

---

## Next Steps

1. **Open browser DevTools** (F12)
2. **Try KYC submission again**
3. **Check Console tab** for the actual error
4. **Share the error message** and I can help fix it specifically

The code is correct, so it's likely a Supabase configuration issue (bucket or policies). Check the console for the exact error! 🔍
