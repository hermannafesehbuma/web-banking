# 📡 Complete API Calls Reference

## All Supabase Fetch Calls in the Application

---

## 🏠 Dashboard Page (`/dashboard`)

### **File:** `src/app/dashboard/page.tsx`

### **1. Fetch User Info** (Line 127-132)

```typescript
const { data: bankUser } = await supabase
  .from('bank_users')
  .select('kyc_status, full_name')
  .eq('id', user.id)
  .single();
```

**Purpose:** Get KYC status and user name for header

---

### **2. Fetch Accounts** (Line 140-146)

```typescript
const { data: accs } = await supabase
  .from('accounts')
  .select(
    'id, account_number, account_type, balance, available_balance, pending_balance'
  )
  .eq('user_id', user.id)
  .order('created_at', { ascending: true });
```

**Purpose:** Get all user accounts with balances
**Used for:**

- Available Balance card (sum of available_balance)
- Pending Balance card (sum of pending_balance)
- Checking Account card
- Savings Account card

---

### **3. Fetch Recent Transactions** (Line 153-158)

```typescript
const { data: txns } = await supabase
  .from('transactions')
  .select('id, amount, type, description, created_at, category')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(10);
```

**Purpose:** Get last 10 transactions
**Used for:** Recent Transactions section

---

### **4. Fetch Spending by Category** (Line 163-175)

```typescript
const { data: categoryData } = await supabase
  .from('transactions')
  .select('category, amount')
  .eq('user_id', user.id)
  .eq('type', 'debit')
  .gte('created_at', new Date(...).toISOString()); // Current month
```

**Purpose:** Aggregate spending by category for current month
**Used for:** Spending Analytics pie chart
**Processing:** Groups by category and sums amounts (Line 177-204)

---

### **5. Fetch Monthly Summaries** (Line 208-213)

```typescript
const { data: summaries } = await supabase
  .from('monthly_summaries')
  .select('month, total_income, total_expenses')
  .eq('user_id', user.id)
  .order('month', { ascending: true })
  .limit(4);
```

**Purpose:** Get last 4 months of income/expense data
**Used for:** Income vs Expenses line chart

---

### **6. Fetch Alerts** (Line 242-248)

```typescript
const { data: alertsData } = await supabase
  .from('alerts')
  .select('id, type, title, message, severity')
  .eq('user_id', user.id)
  .eq('is_read', false)
  .order('created_at', { ascending: false })
  .limit(3);
```

**Purpose:** Get last 3 unread alerts
**Used for:** Insights & Alerts sidebar

---

### **7. Fetch Savings Goal** (Line 253-260)

```typescript
const { data: goalData } = await supabase
  .from('savings_goals')
  .select('id, goal_name, target_amount, current_amount, target_date')
  .eq('user_id', user.id)
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(1)
  .single();
```

**Purpose:** Get active savings goal
**Used for:** Savings Goal progress bar

---

### **8. Fetch Statements** (Line 267-272)

```typescript
const { data: statementsData } = await supabase
  .from('statements')
  .select('id, statement_month, file_url, file_type')
  .eq('user_id', user.id)
  .order('statement_month', { ascending: false })
  .limit(2);
```

**Purpose:** Get last 2 monthly statements
**Used for:** Statements download section

---

## 💳 Cards Page (`/dashboard/cards`)

### **File:** `src/app/dashboard/cards/page.tsx`

### **1. Fetch User Cards** (Line 76-82)

```typescript
const { data: cardsData } = await supabase
  .from('cards')
  .select('id, card_number, card_type, account_id, status, expiry_date, cvv')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
```

**Purpose:** Get all user's physical cards
**Used for:** Card display grid

---

### **2. Create New Card** (Line 132-142)

```typescript
const { error: insertError } = await supabase.from('cards').insert({
  user_id: user.id,
  account_id: accounts?.id || null,
  card_type: selectedCardType,
  status: 'active',
  card_number: null, // Auto-generated
  expiry_date: null, // Auto-generated
  cvv: null, // Auto-generated
});
```

**Purpose:** Create new physical card request
**Triggers:** Auto-generates card details + creates alert

---

## 🔔 Notifications Page (`/dashboard/notifications`)

### **File:** `src/app/dashboard/notifications/page.tsx`

### **1. Fetch Notifications** (Line 60-72)

```typescript
let query = supabase
  .from('alerts')
  .select('id, type, title, message, severity, is_read, created_at, action_url')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });

if (filter === 'unread') {
  query = query.eq('is_read', false);
}

const { data } = await query;
```

**Purpose:** Get all alerts (filtered by read status)
**Used for:** Notifications list

---

### **2. Mark as Read** (Line 79-82)

```typescript
await supabase.from('alerts').update({ is_read: true }).eq('id', alertId);
```

**Purpose:** Mark single notification as read

---

### **3. Mark All as Read** (Line 91-96)

```typescript
await supabase
  .from('alerts')
  .update({ is_read: true })
  .eq('user_id', user.id)
  .eq('is_read', false);
```

**Purpose:** Mark all unread notifications as read

---

### **4. Delete Alert** (Line 102)

```typescript
await supabase.from('alerts').delete().eq('id', alertId);
```

**Purpose:** Delete single notification

---

## 🧭 Dashboard Navigation (`/components/dashboard-nav.tsx`)

### **File:** `src/components/dashboard-nav.tsx`

### **Fetch Unread Count** (Line 42-47)

```typescript
const { count } = await supabase
  .from('alerts')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id)
  .eq('is_read', false);
```

**Purpose:** Get count of unread notifications
**Used for:** Badge on Notifications menu item

---

## ⚙️ Settings Page (`/settings`)

### **File:** `src/app/settings/page.tsx`

### **1. Fetch User Profile** (Line 56-60)

```typescript
const { data: bankUser } = await supabase
  .from('bank_users')
  .select('full_name')
  .eq('id', authUser.id)
  .single();
```

**Purpose:** Get user's full name

---

### **2. Fetch KYC Data** (Line 71-77)

```typescript
const { data: kycData } = await supabase
  .from('kyc_submissions')
  .select('phone_number, address')
  .eq('user_id', authUser.id)
  .order('submitted_at', { ascending: false })
  .limit(1)
  .single();
```

**Purpose:** Get phone and address from KYC submission
**Used for:** Profile form population

---

### **3. Update KYC Profile** (Line 127-135)

```typescript
const { error: kycError } = await supabase
  .from('kyc_submissions')
  .update({
    phone_number: phone.trim() || null,
    address: address.trim() || null,
  })
  .eq('user_id', userId)
  .order('submitted_at', { ascending: false })
  .limit(1);
```

**Purpose:** Save updated phone and address

---

## 📊 Summary of All API Calls

### **Dashboard (8 calls):**

1. ✅ `bank_users` - User info
2. ✅ `accounts` - All accounts with balances
3. ✅ `transactions` - Recent 10 transactions
4. ✅ `transactions` - Spending by category (current month)
5. ✅ `monthly_summaries` - Last 4 months
6. ✅ `alerts` - Unread alerts (3)
7. ✅ `savings_goals` - Active goal
8. ✅ `statements` - Last 2 statements

### **Cards (2 calls):**

1. ✅ `cards` - Fetch all user cards
2. ✅ `cards` - Insert new card

### **Notifications (4 calls):**

1. ✅ `alerts` - Fetch all/unread
2. ✅ `alerts` - Mark as read (single)
3. ✅ `alerts` - Mark all as read
4. ✅ `alerts` - Delete

### **Navigation (1 call):**

1. ✅ `alerts` - Count unread

### **Settings (3 calls):**

1. ✅ `bank_users` - Fetch profile
2. ✅ `kyc_submissions` - Fetch phone/address
3. ✅ `kyc_submissions` - Update phone/address

### **Other Pages:**

- Login, Signup, KYC, Admin KYC (separate flows)

---

## 🔍 How to Verify API Calls

### **Browser Console:**

Open DevTools (F12) and check:

1. **Network Tab** → Filter by "supabase"
2. **Console Tab** → Look for console.log outputs

### **Console Logs Added:**

- Line 148: `console.log('Accounts fetch result:', { accs, accsError })`
- Line 334: `console.log('Dashboard balances:', { ... })`

---

## ✅ All API Calls Are Present!

**The application HAS all the necessary Supabase calls to fetch:**

- ✅ Account balances (available, pending)
- ✅ Transactions
- ✅ Spending analytics
- ✅ Monthly summaries
- ✅ Alerts
- ✅ Savings goals
- ✅ Statements
- ✅ Cards
- ✅ User profile

**If data shows as $0.00, the issue is likely:**

1. Tables don't have data yet → Run `populate_dashboard_data.sql`
2. Columns don't exist → Run `add_balance_fields.sql`
3. RLS blocking access → Check policies

**All the code is there and correct!** ✅
