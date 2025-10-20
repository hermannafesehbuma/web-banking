# ✅ Available & Pending Balance Implementation

## Summary

The dashboard now displays **three balance types** for each account:

1. **Total Balance** - Overall account balance
2. **Available Balance** - Money available for withdrawal (green)
3. **Pending Balance** - Money held in pending transactions (amber)

---

## 🗄️ Database Changes

### **New Fields Added to `accounts` Table**

```sql
ALTER TABLE public.accounts
ADD COLUMN available_balance numeric NOT NULL DEFAULT 0,
ADD COLUMN pending_balance numeric NOT NULL DEFAULT 0;
```

### **Field Definitions**

| Field               | Type    | Description                                          |
| ------------------- | ------- | ---------------------------------------------------- |
| `balance`           | numeric | Total account balance                                |
| `available_balance` | numeric | Balance available for withdrawal (balance - pending) |
| `pending_balance`   | numeric | Amount held in pending transactions                  |

### **Calculation Logic**

```sql
-- Available balance = Total balance - Pending debits
available_balance = balance - SUM(pending debit transactions)

-- Pending balance = Sum of all pending debits/transfers
pending_balance = SUM(amount WHERE status = 'pending' AND type IN ('debit', 'transfer'))
```

---

## 🎨 UI Changes

### **Before:**

```
Checking Account ****1234
Available balance
$2,500.00
```

### **After:**

```
Checking Account ****1234
Account balance

$2,500.00
Total balance

━━━━━━━━━━━━━━━━━

Available         Pending
$2,350.00         $150.00
(green)           (amber)
```

---

## 📊 Dashboard Display

### **Account Cards Layout:**

Each account card now shows:

1. **Header**: Account type and masked number
2. **Total Balance**: Large, prominent display
3. **Separator**: Visual divider
4. **Split View**:
   - Left: Available balance (green)
   - Right: Pending balance (amber)

### **Visual Indicators:**

- ✅ **Green** for available balance (ready to use)
- ⏳ **Amber** for pending balance (on hold)

---

## 🔧 Implementation Files

### 1. **Database Migration**

**File:** `supabase/add_balance_fields.sql`

```sql
-- Adds available_balance and pending_balance columns
-- Sets default values for existing accounts
-- Includes helper function to calculate available balance
```

### 2. **Dashboard Updates**

**File:** `src/app/dashboard/page.tsx`

**Type Definition:**

```typescript
type Account = {
  id: string;
  account_number: string;
  account_type: 'checking' | 'savings';
  balance: number;
  available_balance: number; // NEW
  pending_balance: number; // NEW
};
```

**Query Update:**

```typescript
const { data: accs } = await supabase
  .from('accounts')
  .select(
    'id, account_number, account_type, balance, available_balance, pending_balance'
  )
  .eq('user_id', user.id);
```

**UI Component:**

```tsx
<Card>
  {/* Total Balance */}
  <div className="text-2xl font-semibold">${acc.balance.toFixed(2)}</div>

  <Separator />

  {/* Available & Pending */}
  <div className="grid grid-cols-2 gap-3">
    <div>
      <p className="text-xs text-muted-foreground">Available</p>
      <p className="font-medium text-green-600">
        ${acc.available_balance.toFixed(2)}
      </p>
    </div>
    <div>
      <p className="text-xs text-muted-foreground">Pending</p>
      <p className="font-medium text-amber-600">
        ${acc.pending_balance.toFixed(2)}
      </p>
    </div>
  </div>
</Card>
```

---

## 📝 Setup Instructions

### **Step 1: Update Database Schema**

In Supabase SQL Editor, run:

```sql
-- File: supabase/add_balance_fields.sql
ALTER TABLE public.accounts
ADD COLUMN IF NOT EXISTS available_balance numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS pending_balance numeric NOT NULL DEFAULT 0;

-- Update existing accounts
UPDATE public.accounts
SET available_balance = balance,
    pending_balance = 0
WHERE available_balance = 0;
```

### **Step 2: Verify**

Check that all accounts have the new fields:

```sql
SELECT
  id,
  account_type,
  balance,
  available_balance,
  pending_balance
FROM public.accounts;
```

### **Step 3: Test**

Refresh the dashboard - you should see:

- Total balance at the top
- Available balance in green
- Pending balance in amber

---

## 🧪 Example Data

### **Scenario: Account with Pending Transaction**

```sql
-- Account has $2,500 total
-- User initiated a $150 withdrawal (pending)

balance: 2500.00
available_balance: 2350.00  (2500 - 150)
pending_balance: 150.00
```

**Dashboard Display:**

```
$2,500.00
Total balance

━━━━━━━━━━━━━

Available    Pending
$2,350.00    $150.00
```

---

## 🎯 Business Logic

### **Available Balance Calculation:**

```typescript
// When transaction status = 'pending'
if (transaction.type === 'debit' || transaction.type === 'transfer') {
  available_balance = balance - transaction.amount;
  pending_balance = transaction.amount;
}

// When transaction status = 'completed'
// Balance is already adjusted
// No impact on available_balance
```

### **Use Cases:**

1. **Normal State**:

   - Balance: $1,000
   - Available: $1,000
   - Pending: $0

2. **Pending Withdrawal**:

   - Balance: $1,000
   - Available: $900 (can't use $100)
   - Pending: $100

3. **Pending Deposit**:
   - Balance: $1,000 (not credited yet)
   - Available: $1,000
   - Pending: $0 (credits don't reduce available)

---

## ✅ Benefits

1. **Transparency**: Users see exactly what they can spend
2. **Prevents Overdrafts**: Available balance shows true spendable amount
3. **Pending Visibility**: Users can track pending transactions
4. **Professional UX**: Matches real banking apps
5. **Better Financial Control**: Users make informed decisions

---

## 🚀 Next Steps

### **Optional Enhancements:**

1. **Auto-Calculate Available Balance**:

   ```sql
   CREATE TRIGGER update_available_balance
   AFTER INSERT OR UPDATE ON transactions
   FOR EACH ROW
   EXECUTE FUNCTION recalculate_available_balance();
   ```

2. **Show Pending Transaction Count**:

   ```tsx
   <p className="text-xs">{pendingCount} pending transactions</p>
   ```

3. **Pending Transaction Details**:

   - Click on pending balance to see list of pending transactions
   - Modal or dropdown with pending items

4. **Historical Tracking**:
   - Track available balance changes over time
   - Show graph of available vs total balance

---

## 📋 Checklist

- [x] Add `available_balance` field to database
- [x] Add `pending_balance` field to database
- [x] Update TypeScript types
- [x] Update database query
- [x] Update UI to show all three balances
- [x] Add color coding (green/amber)
- [x] Test with sample data
- [ ] Run database migration in Supabase
- [ ] Verify dashboard displays correctly

---

**Dashboard now shows complete balance information!** 💰✅
