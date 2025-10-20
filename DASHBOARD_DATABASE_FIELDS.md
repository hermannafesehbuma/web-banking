# 📊 Dashboard Database Fields & Tables to Add

## Current Dashboard Features & Their Data Needs

Based on the dashboard implementation, here are the **missing tables/fields** that need to be added to make all features work with real data instead of mock data.

---

## 1. ✅ Already Working (Real Data)

### Account Overview Section

**Tables:** `accounts`
**Fields Used:**

- ✅ `id`, `account_number`, `account_type`, `balance`
- ✅ `available_balance` (exists but not used yet)

**Status:** Working with real data from database

### Recent Transactions Section

**Tables:** `transactions`
**Fields Used:**

- ✅ `id`, `amount`, `type`, `description`, `created_at`
- ⚠️ `category` (exists but may be null)
- ⚠️ `balance_after` (exists but may not be calculated)

**Status:** Working but needs better data

---

## 2. 🔴 Needs Real Data (Currently Mock)

### Spending Analytics - Pie Chart

**Currently:** Mock data hardcoded

```typescript
const spendingByCategory = [
  { name: 'Food & Dining', value: 450, color: '#0088FE' },
  { name: 'Transportation', value: 200, color: '#00C49F' },
  ...
];
```

**Solution:** Create aggregation query from `transactions` table

```sql
SELECT
  category,
  SUM(ABS(amount)) as total_amount,
  COUNT(*) as count
FROM transactions
WHERE user_id = ?
  AND type = 'debit'
  AND created_at >= date_trunc('month', now())
GROUP BY category;
```

**Required:**

- ✅ Table exists: `transactions`
- ✅ Field exists: `category`
- ⚠️ **Need to ensure all transactions have categories assigned**

---

### Monthly Income vs Expenses - Line Chart

**Currently:** Mock data hardcoded

```typescript
const monthlyTrend = [
  { month: 'Jul', income: 3200, expenses: 1850 },
  { month: 'Aug', income: 3200, expenses: 2100 },
  ...
];
```

**Solution:** Use `monthly_summaries` table OR aggregate from `transactions`

**Option A: Add to existing `monthly_summaries` table (RECOMMENDED)**

```sql
-- Already in schema!
CREATE TABLE monthly_summaries (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES bank_users(id),
  month date NOT NULL,
  total_income numeric DEFAULT 0,
  total_expenses numeric DEFAULT 0,
  net_savings numeric DEFAULT 0,
  largest_expense numeric,
  largest_expense_category text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month)
);
```

**Status:** ✅ Table exists in schema, needs to be populated

---

### Insights & Alerts

**Currently:** Hardcoded alerts

```typescript
<div>Great savings! You saved $350 more...</div>
<div>Bill reminder: Utility bill due in 3 days...</div>
```

**Solution:** Use `alerts` table (already in schema!)

```sql
CREATE TABLE alerts (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES bank_users(id),
  type text CHECK (type IN ('spending', 'saving', 'bill_reminder', 'security')),
  title text NOT NULL,
  message text NOT NULL,
  severity text CHECK (severity IN ('info', 'warning', 'success', 'error')),
  is_read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);
```

**Status:** ✅ Table exists in schema, needs to be populated

**Query:**

```sql
SELECT type, title, message, severity, action_url, created_at
FROM alerts
WHERE user_id = ? AND is_read = false
ORDER BY created_at DESC
LIMIT 3;
```

---

### Savings Goal Progress

**Currently:** Hardcoded

```typescript
<div>$2,500 / $5,000</div>
<div className="bg-primary" style={{ width: '50%' }} />
```

**Solution:** Use `savings_goals` table (already in schema!)

```sql
CREATE TABLE savings_goals (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES bank_users(id),
  account_id uuid REFERENCES accounts(id),
  goal_name text NOT NULL,
  target_amount numeric NOT NULL,
  current_amount numeric DEFAULT 0,
  target_date date,
  status text CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz,
  completed_at timestamptz
);
```

**Status:** ✅ Table exists in schema, needs to be populated

**Query:**

```sql
SELECT goal_name, target_amount, current_amount, target_date, status
FROM savings_goals
WHERE user_id = ? AND status = 'active'
ORDER BY created_at DESC
LIMIT 1;
```

---

### Statements Download

**Currently:** Static buttons

```typescript
<Button>October 2025</Button>
<Button>September 2025</Button>
```

**Solution:** Use `statements` table (already in schema!)

```sql
CREATE TABLE statements (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES bank_users(id),
  account_id uuid REFERENCES accounts(id),
  statement_month date NOT NULL,
  file_url text NOT NULL,
  file_type text CHECK (file_type IN ('pdf', 'csv')),
  opening_balance numeric NOT NULL,
  closing_balance numeric NOT NULL,
  total_credits numeric DEFAULT 0,
  total_debits numeric DEFAULT 0,
  generated_at timestamptz DEFAULT now()
);
```

**Status:** ✅ Table exists in schema, needs to be populated

**Query:**

```sql
SELECT statement_month, file_url, file_type
FROM statements
WHERE user_id = ?
ORDER BY statement_month DESC
LIMIT 10;
```

---

## 3. 📋 Fields to Add to Existing Tables

### `transactions` Table Enhancements

**Already Exists:**

```sql
id, user_id, account_id, amount, type, category, description,
balance_after, reference_number, status, metadata, created_at
```

**Fields to Ensure Are Populated:**

- ✅ `category` - Must have value for every transaction
- ✅ `balance_after` - Auto-calculated by trigger
- ✅ `reference_number` - For tracking

**Categories to Use:**

```sql
'food_dining'
'transportation'
'shopping'
'bills_utilities'
'entertainment'
'healthcare'
'education'
'income'
'transfer'
'other'
```

---

## 4. 🔧 Data Population Scripts Needed

### A. Populate Monthly Summaries

```sql
-- Function to aggregate transaction data into monthly summaries
CREATE OR REPLACE FUNCTION populate_monthly_summary(p_user_id uuid, p_month date)
RETURNS void AS $$
BEGIN
  INSERT INTO monthly_summaries (user_id, month, total_income, total_expenses, net_savings)
  SELECT
    p_user_id,
    p_month,
    COALESCE(SUM(CASE WHEN type IN ('credit', 'refund') THEN amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN type IN ('debit', 'transfer') THEN ABS(amount) ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN type IN ('credit', 'refund') THEN amount ELSE -amount END), 0) as net_savings
  FROM transactions
  WHERE user_id = p_user_id
    AND date_trunc('month', created_at) = p_month
  ON CONFLICT (user_id, month)
  DO UPDATE SET
    total_income = EXCLUDED.total_income,
    total_expenses = EXCLUDED.total_expenses,
    net_savings = EXCLUDED.net_savings;
END;
$$ LANGUAGE plpgsql;

-- Call for last 6 months
SELECT populate_monthly_summary(
  auth.uid(),
  date_trunc('month', now() - interval '0 months')
);
```

### B. Create Sample Alerts

```sql
-- Insert sample alerts for testing
INSERT INTO alerts (user_id, type, title, message, severity)
VALUES
  (auth.uid(), 'saving', 'Great savings!', 'You saved $350 more this month vs last month', 'success'),
  (auth.uid(), 'bill_reminder', 'Bill reminder', 'Utility bill due in 3 days - $89.50', 'info'),
  (auth.uid(), 'spending', 'Spending alert', 'You spent 20% more on dining this month', 'warning');
```

### C. Create Sample Savings Goal

```sql
INSERT INTO savings_goals (user_id, goal_name, target_amount, current_amount, target_date, status)
VALUES
  (auth.uid(), 'Emergency Fund', 5000, 2500, (now() + interval '6 months')::date, 'active');
```

### D. Ensure Transaction Categories

```sql
-- Update transactions without categories
UPDATE transactions
SET category = CASE
  WHEN description ILIKE '%grocery%' OR description ILIKE '%food%' THEN 'food_dining'
  WHEN description ILIKE '%gas%' OR description ILIKE '%uber%' THEN 'transportation'
  WHEN description ILIKE '%amazon%' OR description ILIKE '%shop%' THEN 'shopping'
  WHEN description ILIKE '%electric%' OR description ILIKE '%utility%' THEN 'bills_utilities'
  WHEN description ILIKE '%netflix%' OR description ILIKE '%spotify%' THEN 'entertainment'
  WHEN description ILIKE '%payroll%' OR description ILIKE '%salary%' THEN 'income'
  ELSE 'other'
END
WHERE category IS NULL;
```

---

## 5. 📊 Complete Implementation Checklist

### Phase 1: Already Have Tables ✅

- [x] `accounts` table
- [x] `transactions` table
- [x] `alerts` table
- [x] `savings_goals` table
- [x] `monthly_summaries` table
- [x] `statements` table

### Phase 2: Populate Existing Data

- [ ] Run `complete_schema.sql` to create missing tables
- [ ] Ensure all transactions have categories
- [ ] Generate monthly summaries for last 6 months
- [ ] Create sample alerts
- [ ] Create sample savings goal
- [ ] Generate sample statements

### Phase 3: Update Dashboard to Use Real Data

- [ ] Replace `spendingByCategory` mock data with query
- [ ] Replace `monthlyTrend` mock data with `monthly_summaries`
- [ ] Fetch real alerts from `alerts` table
- [ ] Fetch savings goal from `savings_goals` table
- [ ] Fetch statements from `statements` table

### Phase 4: Add Background Jobs (Optional)

- [ ] Nightly job to generate monthly summaries
- [ ] Nightly job to generate spending alerts
- [ ] Monthly job to generate statements
- [ ] Weekly job to check bill reminders

---

## 6. 🚀 Quick Start Commands

### Step 1: Run Schema

```bash
# In Supabase SQL Editor
-- Paste contents of supabase/complete_schema.sql
```

### Step 2: Add Sample Data

```sql
-- Add sample transactions with categories
INSERT INTO transactions (user_id, account_id, amount, type, category, description, status)
SELECT
  auth.uid(),
  (SELECT id FROM accounts WHERE user_id = auth.uid() LIMIT 1),
  -85.50,
  'debit',
  'food_dining',
  'Grocery Store - Whole Foods',
  'completed';

-- Add more sample transactions...
```

### Step 3: Generate Analytics

```sql
-- Generate monthly summaries
SELECT populate_monthly_summary(auth.uid(), date_trunc('month', now()));

-- Add alerts
INSERT INTO alerts (user_id, type, title, message, severity)
VALUES (auth.uid(), 'saving', 'Great job!', 'You saved $200 this month', 'success');

-- Add savings goal
INSERT INTO savings_goals (user_id, goal_name, target_amount, current_amount, status)
VALUES (auth.uid(), 'Emergency Fund', 5000, 2500, 'active');
```

---

## 7. 📝 Summary

**All tables already exist in schema! Just need to:**

1. ✅ Run `complete_schema.sql` (if not done)
2. 🔴 Populate with sample/real data
3. 🔴 Update dashboard queries to fetch real data
4. 🔴 Remove mock data from dashboard code

**No new tables needed - everything is already designed!** 🎉

The dashboard will be fully functional once we:

- Add sample transactions with proper categories
- Generate monthly summaries
- Create alerts and savings goals
- Optionally generate statements

All the infrastructure is ready, we just need the data! 📊
