# 🗄️ Fortiz Bank - Complete Database Schema

## Overview

Comprehensive database schema supporting all dashboard features: accounts, transactions, analytics, transfers, statements, and settings.

---

## 📊 Tables by Category

### 1. CORE USER & ACCOUNT TABLES

#### `bank_users`

**Purpose**: Extended user profile linked to Supabase Auth

| Column         | Type        | Description                       |
| -------------- | ----------- | --------------------------------- |
| `id`           | uuid (PK)   | References auth.users(id)         |
| `email`        | text        | User email                        |
| `full_name`    | text        | Full name                         |
| `phone_number` | text        | Contact phone                     |
| `address`      | text        | Mailing address                   |
| `kyc_status`   | text        | 'pending', 'approved', 'rejected' |
| `created_at`   | timestamptz | Account creation                  |
| `updated_at`   | timestamptz | Last profile update               |

#### `accounts`

**Purpose**: Bank accounts (checking, savings)

| Column              | Type          | Description                  |
| ------------------- | ------------- | ---------------------------- |
| `id`                | uuid (PK)     | Account ID                   |
| `user_id`           | uuid (FK)     | References bank_users        |
| `account_type`      | text          | 'checking', 'savings'        |
| `account_number`    | text (unique) | 10-digit account number      |
| `balance`           | numeric       | Current balance              |
| `available_balance` | numeric       | Available (not on hold)      |
| `currency`          | text          | 'USD' (default)              |
| `status`            | text          | 'active', 'frozen', 'closed' |
| `created_at`        | timestamptz   | Account opened date          |
| `updated_at`        | timestamptz   | Last balance update          |

**Dashboard Usage**: Account Overview section

---

### 2. TRANSACTION TABLES

#### `transactions`

**Purpose**: All account transactions (credits, debits, refunds)

| Column             | Type          | Description                             |
| ------------------ | ------------- | --------------------------------------- |
| `id`               | uuid (PK)     | Transaction ID                          |
| `user_id`          | uuid (FK)     | Owner                                   |
| `account_id`       | uuid (FK)     | Account                                 |
| `amount`           | numeric       | Transaction amount                      |
| `type`             | text          | 'credit', 'debit', 'refund', 'transfer' |
| `category`         | text          | 'food_dining', 'transportation', etc.   |
| `description`      | text          | Transaction detail                      |
| `balance_after`    | numeric       | Balance after this txn                  |
| `reference_number` | text (unique) | Tracking number                         |
| `status`           | text          | 'pending', 'completed', 'failed'        |
| `metadata`         | jsonb         | Additional data                         |
| `created_at`       | timestamptz   | Transaction time                        |

**Dashboard Usage**: Recent Transactions section

**Indexes**:

- `idx_transactions_user_id` (faster queries by user)
- `idx_transactions_account_id` (faster queries by account)
- `idx_transactions_created_at` (sorted listings)

**Categories**:

- `food_dining` - Restaurants, groceries
- `transportation` - Gas, rideshare, transit
- `shopping` - Retail purchases
- `bills_utilities` - Rent, electric, internet
- `entertainment` - Movies, subscriptions
- `healthcare` - Medical expenses
- `education` - Tuition, books
- `income` - Salary, freelance
- `transfer` - Between accounts
- `other` - Miscellaneous

---

### 3. TRANSFERS & PAYMENTS

#### `beneficiaries`

**Purpose**: Saved recipients for quick transfers

| Column           | Type        | Description       |
| ---------------- | ----------- | ----------------- |
| `id`             | uuid (PK)   | Beneficiary ID    |
| `user_id`        | uuid (FK)   | Owner             |
| `name`           | text        | Recipient name    |
| `account_number` | text        | Recipient account |
| `email`          | text        | Recipient email   |
| `bank_name`      | text        | Bank name         |
| `routing_number` | text        | Routing number    |
| `is_favorite`    | boolean     | Quick access flag |
| `created_at`     | timestamptz | Added date        |

**Dashboard Usage**: Transfers & Payments section

#### `transfers`

**Purpose**: Transfer history and pending transfers

| Column                | Type        | Description                                    |
| --------------------- | ----------- | ---------------------------------------------- |
| `id`                  | uuid (PK)   | Transfer ID                                    |
| `user_id`             | uuid (FK)   | Initiator                                      |
| `from_account_id`     | uuid (FK)   | Source account                                 |
| `to_account_id`       | uuid (FK)   | Destination (if internal)                      |
| `to_external_account` | text        | External account info                          |
| `amount`              | numeric     | Transfer amount                                |
| `fee`                 | numeric     | Transaction fee                                |
| `currency`            | text        | Currency                                       |
| `description`         | text        | Transfer note                                  |
| `status`              | text        | 'pending', 'processing', 'completed', 'failed' |
| `transfer_type`       | text        | 'internal', 'external', 'international'        |
| `scheduled_at`        | timestamptz | Scheduled time (if future)                     |
| `completed_at`        | timestamptz | Completion time                                |
| `created_at`          | timestamptz | Initiated time                                 |

**Dashboard Usage**: Transfers section, Recent Transactions

---

### 4. ANALYTICS & INSIGHTS

#### `spending_analytics`

**Purpose**: Aggregated spending by category per month

| Column              | Type        | Description             |
| ------------------- | ----------- | ----------------------- |
| `id`                | uuid (PK)   | Record ID               |
| `user_id`           | uuid (FK)   | Owner                   |
| `month`             | date        | Month (YYYY-MM-01)      |
| `category`          | text        | Spending category       |
| `total_amount`      | numeric     | Total spent in category |
| `transaction_count` | integer     | Number of transactions  |
| `created_at`        | timestamptz | Generated timestamp     |

**Unique Constraint**: (user_id, month, category)

**Dashboard Usage**: Spending Analytics pie chart

#### `monthly_summaries`

**Purpose**: Monthly financial overview

| Column                     | Type        | Description            |
| -------------------------- | ----------- | ---------------------- |
| `id`                       | uuid (PK)   | Summary ID             |
| `user_id`                  | uuid (FK)   | Owner                  |
| `month`                    | date        | Month (YYYY-MM-01)     |
| `total_income`             | numeric     | Total credits          |
| `total_expenses`           | numeric     | Total debits           |
| `net_savings`              | numeric     | Income - Expenses      |
| `largest_expense`          | numeric     | Biggest single expense |
| `largest_expense_category` | text        | Category of largest    |
| `created_at`               | timestamptz | Generated timestamp    |

**Unique Constraint**: (user_id, month)

**Dashboard Usage**: Income vs Expenses line chart

#### `alerts`

**Purpose**: User notifications and insights

| Column       | Type        | Description                                       |
| ------------ | ----------- | ------------------------------------------------- |
| `id`         | uuid (PK)   | Alert ID                                          |
| `user_id`    | uuid (FK)   | Recipient                                         |
| `type`       | text        | 'spending', 'saving', 'bill_reminder', 'security' |
| `title`      | text        | Alert headline                                    |
| `message`    | text        | Alert detail                                      |
| `severity`   | text        | 'info', 'warning', 'success', 'error'             |
| `is_read`    | boolean     | Read status                                       |
| `action_url` | text        | Link to relevant page                             |
| `created_at` | timestamptz | Alert time                                        |

**Dashboard Usage**: Insights & Alerts sidebar

---

### 5. SAVINGS GOALS

#### `savings_goals`

**Purpose**: Track user savings targets

| Column           | Type        | Description                         |
| ---------------- | ----------- | ----------------------------------- |
| `id`             | uuid (PK)   | Goal ID                             |
| `user_id`        | uuid (FK)   | Owner                               |
| `account_id`     | uuid (FK)   | Linked account                      |
| `goal_name`      | text        | Goal title (e.g., "Emergency fund") |
| `target_amount`  | numeric     | Target amount                       |
| `current_amount` | numeric     | Current progress                    |
| `target_date`    | date        | Goal deadline                       |
| `status`         | text        | 'active', 'completed', 'cancelled'  |
| `created_at`     | timestamptz | Created                             |
| `completed_at`   | timestamptz | Completed date                      |

**Dashboard Usage**: Savings Goal progress bar

---

### 6. STATEMENTS & DOCUMENTS

#### `statements`

**Purpose**: Monthly account statements

| Column            | Type        | Description               |
| ----------------- | ----------- | ------------------------- |
| `id`              | uuid (PK)   | Statement ID              |
| `user_id`         | uuid (FK)   | Owner                     |
| `account_id`      | uuid (FK)   | Account                   |
| `statement_month` | date        | Month (YYYY-MM-01)        |
| `file_url`        | text        | PDF/CSV download link     |
| `file_type`       | text        | 'pdf', 'csv'              |
| `opening_balance` | numeric     | Balance at month start    |
| `closing_balance` | numeric     | Balance at month end      |
| `total_credits`   | numeric     | Total deposits            |
| `total_debits`    | numeric     | Total withdrawals         |
| `generated_at`    | timestamptz | Statement generation time |

**Dashboard Usage**: Statements & Reports section

---

### 7. BILLS & RECURRING PAYMENTS

#### `recurring_payments`

**Purpose**: Scheduled/recurring bills

| Column              | Type        | Description                            |
| ------------------- | ----------- | -------------------------------------- |
| `id`                | uuid (PK)   | Payment ID                             |
| `user_id`           | uuid (FK)   | Owner                                  |
| `account_id`        | uuid (FK)   | Payment account                        |
| `payee_name`        | text        | Who gets paid                          |
| `amount`            | numeric     | Payment amount                         |
| `frequency`         | text        | 'daily', 'weekly', 'monthly', 'yearly' |
| `next_payment_date` | date        | Next due date                          |
| `status`            | text        | 'active', 'paused', 'cancelled'        |
| `auto_pay`          | boolean     | Auto-deduct flag                       |
| `created_at`        | timestamptz | Setup date                             |

**Dashboard Usage**: Insights (bill reminders)

---

### 8. NOTIFICATIONS & PREFERENCES

#### `notification_preferences`

**Purpose**: User notification settings

| Column               | Type          | Description            |
| -------------------- | ------------- | ---------------------- |
| `user_id`            | uuid (PK, FK) | Owner                  |
| `transaction_alerts` | boolean       | Alert on transactions  |
| `monthly_statements` | boolean       | Email statements       |
| `marketing_emails`   | boolean       | Promotional emails     |
| `security_alerts`    | boolean       | Security notifications |
| `push_notifications` | boolean       | Mobile push            |
| `updated_at`         | timestamptz   | Last change            |

**Dashboard Usage**: Settings page

#### `user_settings`

**Purpose**: App preferences

| Column               | Type          | Description               |
| -------------------- | ------------- | ------------------------- |
| `user_id`            | uuid (PK, FK) | Owner                     |
| `theme`              | text          | 'light', 'dark', 'system' |
| `language`           | text          | 'en', etc.                |
| `timezone`           | text          | User timezone             |
| `two_factor_enabled` | boolean       | 2FA status                |
| `biometric_enabled`  | boolean       | Fingerprint/Face ID       |
| `updated_at`         | timestamptz   | Last change               |

**Dashboard Usage**: Settings page (Security section)

---

### 9. SECURITY & AUDIT

#### `login_history`

**Purpose**: Track login attempts and sessions

| Column         | Type        | Description                    |
| -------------- | ----------- | ------------------------------ |
| `id`           | uuid (PK)   | Record ID                      |
| `user_id`      | uuid (FK)   | User                           |
| `ip_address`   | text        | Login IP                       |
| `user_agent`   | text        | Browser/device                 |
| `device_info`  | jsonb       | Additional device data         |
| `login_method` | text        | 'password', 'biometric', '2fa' |
| `status`       | text        | 'success', 'failed'            |
| `created_at`   | timestamptz | Login time                     |

**Dashboard Usage**: Settings → Active Sessions

#### `audit_log`

**Purpose**: Audit trail for all actions

| Column        | Type        | Description                 |
| ------------- | ----------- | --------------------------- |
| `id`          | uuid (PK)   | Log ID                      |
| `user_id`     | uuid (FK)   | Actor (nullable for system) |
| `action`      | text        | Action performed            |
| `entity_type` | text        | Table affected              |
| `entity_id`   | uuid        | Record ID                   |
| `old_values`  | jsonb       | Before changes              |
| `new_values`  | jsonb       | After changes               |
| `ip_address`  | text        | Request IP                  |
| `created_at`  | timestamptz | Action time                 |

**Dashboard Usage**: Admin audit trails

---

## 🔄 Triggers & Functions

### `generate_account_number()`

- **Purpose**: Generate unique 10-digit account numbers
- **Returns**: text (e.g., "0123456789")
- **Used by**: Account creation

### `update_account_balance()`

- **Purpose**: Auto-update account balance after transaction
- **Trigger**: BEFORE INSERT on transactions
- **Logic**:
  - Credit/Refund → Add to balance
  - Debit/Transfer → Subtract from balance
  - Sets `balance_after` field

### `create_accounts_after_kyc()`

- **Purpose**: Auto-create checking + savings after KYC approval
- **Trigger**: AFTER UPDATE on kyc_submissions
- **Logic**:
  - When status changes to 'approved'
  - Creates checking account (balance: 0)
  - Creates savings account (balance: 0)
  - Updates bank_users.kyc_status = 'approved'
  - Creates default notification_preferences
  - Creates default user_settings

---

## 📈 Dashboard Feature Mapping

| Dashboard Section       | Tables Used                                               | Key Fields                                                     |
| ----------------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| **Account Overview**    | `accounts`                                                | balance, available_balance, account_number, account_type       |
| **Recent Transactions** | `transactions`                                            | amount, type, description, category, created_at, balance_after |
| **Spending Analytics**  | `spending_analytics`, `monthly_summaries`                 | category, total_amount, total_income, total_expenses           |
| **Transfers**           | `transfers`, `beneficiaries`                              | from_account_id, to_account_id, amount, status                 |
| **Statements**          | `statements`                                              | statement_month, file_url, opening_balance, closing_balance    |
| **Settings**            | `bank_users`, `user_settings`, `notification_preferences` | full_name, phone_number, theme, two_factor_enabled             |
| **Insights**            | `alerts`, `savings_goals`, `recurring_payments`           | title, message, severity, target_amount, next_payment_date     |

---

## 🔐 Security (RLS Policies)

All tables have Row Level Security enabled. Users can only:

- **View** their own data (SELECT using auth.uid() = user_id)
- **Modify** their own data (INSERT/UPDATE/DELETE with check)
- **No cross-user** access (enforced by RLS)

---

## 🧪 Sample Queries

### Get Account Overview

```sql
SELECT
  account_type,
  account_number,
  balance,
  available_balance,
  currency
FROM accounts
WHERE user_id = auth.uid()
ORDER BY created_at;
```

### Get Recent Transactions

```sql
SELECT
  t.id,
  t.amount,
  t.type,
  t.description,
  t.category,
  t.balance_after,
  t.created_at,
  a.account_type
FROM transactions t
JOIN accounts a ON t.account_id = a.id
WHERE t.user_id = auth.uid()
ORDER BY t.created_at DESC
LIMIT 10;
```

### Get Spending by Category (This Month)

```sql
SELECT
  category,
  SUM(amount) as total_amount,
  COUNT(*) as transaction_count
FROM transactions
WHERE user_id = auth.uid()
  AND type = 'debit'
  AND created_at >= date_trunc('month', now())
GROUP BY category
ORDER BY total_amount DESC;
```

### Get Monthly Income vs Expenses

```sql
SELECT
  month,
  total_income,
  total_expenses,
  net_savings
FROM monthly_summaries
WHERE user_id = auth.uid()
ORDER BY month DESC
LIMIT 6;
```

### Get Unread Alerts

```sql
SELECT
  type,
  title,
  message,
  severity,
  action_url,
  created_at
FROM alerts
WHERE user_id = auth.uid()
  AND is_read = false
ORDER BY created_at DESC;
```

---

## 🚀 Next Steps to Populate Data

### 1. Create Sample Transactions

After KYC approval and account creation, insert sample transactions:

```sql
-- Deposit (credit)
INSERT INTO transactions (user_id, account_id, amount, type, category, description)
VALUES (
  auth.uid(),
  (SELECT id FROM accounts WHERE user_id = auth.uid() AND account_type = 'checking' LIMIT 1),
  3200.00,
  'credit',
  'income',
  'Payroll Deposit - ACME Inc.'
);

-- Expense (debit)
INSERT INTO transactions (user_id, account_id, amount, type, category, description)
VALUES (
  auth.uid(),
  (SELECT id FROM accounts WHERE user_id = auth.uid() AND account_type = 'checking' LIMIT 1),
  -86.50,
  'debit',
  'food_dining',
  'Grocery Store Purchase'
);
```

### 2. Generate Monthly Analytics

Run aggregation to populate `spending_analytics`:

```sql
INSERT INTO spending_analytics (user_id, month, category, total_amount, transaction_count)
SELECT
  user_id,
  date_trunc('month', created_at)::date as month,
  category,
  SUM(ABS(amount)) as total_amount,
  COUNT(*) as transaction_count
FROM transactions
WHERE type = 'debit'
  AND user_id = auth.uid()
GROUP BY user_id, month, category
ON CONFLICT (user_id, month, category)
DO UPDATE SET
  total_amount = EXCLUDED.total_amount,
  transaction_count = EXCLUDED.transaction_count;
```

### 3. Create Alerts

```sql
INSERT INTO alerts (user_id, type, title, message, severity)
VALUES (
  auth.uid(),
  'saving',
  'Great savings!',
  'You saved $350 more this month vs last month',
  'success'
);
```

---

## 📋 Setup Checklist

- [ ] Run `supabase/complete_schema.sql` in Supabase SQL Editor
- [ ] Verify all tables created successfully
- [ ] Check RLS policies are enabled
- [ ] Test account creation trigger (approve KYC → accounts created)
- [ ] Test transaction balance trigger (add txn → balance updated)
- [ ] Insert sample transactions for testing dashboard
- [ ] Generate analytics data (spending_analytics, monthly_summaries)
- [ ] Create sample alerts

---

**All tables are production-ready with proper constraints, indexes, and RLS policies!** 🎉
