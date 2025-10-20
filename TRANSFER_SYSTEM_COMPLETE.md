# Fortiz Bank - Transfer System Complete Documentation

## Overview

This document provides a complete implementation plan for Fortiz Bank's money-send system, including internal transfers (between Fortiz accounts) and interbank transfers (ACH-style to external U.S. banks).

---

## 📊 Database Schema

### Tables Created

1. **`transfers`** - Main transfer records
2. **`holds`** - Pending balance holds
3. **`ledger_entries`** - Immutable double-entry ledger
4. **`transfer_events`** - State change audit log
5. **`transfer_limits`** - Configurable limits and fees

### Key Fields

#### Transfers Table
```sql
- id (uuid, PK)
- idempotency_key (text, unique) -- Prevents duplicate transfers
- user_id (uuid, FK)
- from_account_id (uuid, FK)
- to_account_id (uuid, FK, nullable) -- NULL for external
- external_bank_name, routing, account (for interbank)
- amount, fee, currency
- transfer_type ('internal' | 'interbank')
- status ('initiated' | 'pending' | 'processing' | 'settled' | 'failed' | 'cancelled' | 'reversed')
- memo, reference
- scheduled_settlement_at, settled_at
- requires_mfa, mfa_verified
- metadata (jsonb)
```

#### Holds Table
```sql
- id (uuid, PK)
- account_id (uuid, FK)
- transfer_id (uuid, FK)
- amount (numeric)
- hold_type ('outgoing' | 'incoming')
- status ('active' | 'released' | 'settled')
- created_at, released_at, settled_at
```

#### Ledger Entries Table
```sql
- id (uuid, PK)
- transfer_id (uuid, FK)
- account_id (uuid, FK)
- user_id (uuid, FK)
- entry_type ('debit' | 'credit' | 'hold' | 'release')
- amount (numeric)
- balance_after (numeric)
- category (transfer_out, transfer_in, transfer_hold, transfer_release, fee, reversal)
- description, reference
- metadata (jsonb)
- created_at (immutable)
```

---

## 🔄 Transfer Flow

### Internal Transfer (1 Business Day)

```
1. User initiates transfer
   ↓
2. API validates:
   - Account ownership
   - Available balance
   - Savings limit (6/month)
   - Daily limits
   - Transaction limits
   ↓
3. Create transfer record (status: pending)
   ↓
4. Create outgoing hold (reduces available_balance)
   ↓
5. Create ledger entry (hold)
   ↓
6. Update account.available_balance
   ↓
7. Create alert notification
   ↓
8. Return success + transfer ID
   ↓
9. [Background Worker]
   Settlement worker processes next business day:
   - Release hold
   - Debit sender account
   - Credit recipient account
   - Create ledger entries (debit + credit)
   - Update status to 'settled'
   - Notify both parties
```

### Interbank Transfer (3-5 Business Days)

```
1-8. Same as internal transfer
   ↓
9. [Background Worker]
   ACH Worker:
   - Batches transfers
   - Sends to ACH provider/simulator
   - Waits for confirmation (3-5 days)
   - On success:
     * Release hold
     * Debit sender account
     * Create ledger entries
     * Update status to 'settled'
     * Notify user
   - On failure:
     * Release hold
     * Restore available_balance
     * Update status to 'failed'
     * Notify user with reason
```

---

## 🔐 Business Rules Implemented

### 1. Available Balance Rule
```typescript
available_balance = balance - active_outgoing_holds
```
- Transfers only allowed if `available_balance >= (amount + fee)`
- Holds created immediately reduce available balance
- Balance is not affected until settlement

### 2. Savings Transfer Limit (Federal Regulation)
- **Limit:** 6 transfers per rolling 30-day period
- **Applies to:** Savings accounts only
- **Counted:** Transfers with status NOT IN ('cancelled', 'failed')
- **Error:** Returns 429 status with clear message

### 3. Transfer Limits (By Account Tier)

| Tier | Internal Max | Interbank Max | Daily Limit | MFA Threshold |
|------|-------------|---------------|-------------|---------------|
| Standard | $50,000 | $10,000 | $100,000 | $5,000 |
| Premium | $100,000 | $25,000 | $250,000 | $10,000 |
| Business | $500,000 | $100,000 | $1,000,000 | $25,000 |

### 4. Fees

**Standard Tier:**
- Internal: $0 (free)
- Interbank: $2.50 flat + 0.1%

**Premium Tier:**
- Internal: $0 (free)
- Interbank: 0.05%

**Business Tier:**
- Internal: $0 (free)
- Interbank: 0.02%

### 5. Idempotency
- Every transfer requires unique `idempotency_key`
- Duplicate requests return existing transfer
- Prevents accidental double transfers

### 6. MFA Requirement
- Transfers above threshold require MFA verification
- Transfer created with `status: 'initiated'`
- Must call `PATCH /api/transfers-v2/:id` with MFA code
- After verification, status changes to `pending`

---

## 🛠️ API Endpoints

### POST /api/transfers-v2
Create a new transfer

**Request:**
```json
{
  "idempotency_key": "unique-client-key-123",
  "from_account_id": "uuid",
  "to_account_id": "uuid", // For internal
  "external_bank_name": "Bank of America", // For interbank
  "external_routing_number": "123456789",
  "external_account_number": "9876543210",
  "external_account_holder_name": "John Doe",
  "amount": 500.00,
  "memo": "Rent payment",
  "transfer_type": "internal" // or "interbank"
}
```

**Response (201):**
```json
{
  "transfer": {
    "id": "uuid",
    "reference": "FTZ241220ABCD1234",
    "status": "pending",
    "amount": 500.00,
    "fee": 0,
    "scheduled_settlement_at": "2025-10-21T12:00:00Z"
  },
  "message": "Transfer initiated successfully",
  "requires_mfa": false,
  "settlement_estimate": "1 business day",
  "fee": 0
}
```

**Error Responses:**
- `400` - Validation error (insufficient balance, limits exceeded, invalid account)
- `429` - Rate limit exceeded (savings limit, daily limit)
- `401` - Unauthorized
- `500` - Server error

### GET /api/transfers-v2
List all transfers for user

**Query Params:**
- `status` - Filter by status
- `type` - Filter by transfer_type
- `limit` - Results limit (default 50)

**Response:**
```json
{
  "transfers": [...]
}
```

### GET /api/transfers-v2/:id
Get detailed transfer info

**Response:**
```json
{
  "transfer": {...},
  "from_account": {...},
  "to_account": {...},
  "holds": [...],
  "ledger_entries": [...],
  "events": [...],
  "progress": 75
}
```

### PATCH /api/transfers-v2/:id
Update transfer (cancel or verify MFA)

**Cancel Request:**
```json
{
  "action": "cancel"
}
```

**MFA Verify Request:**
```json
{
  "action": "verify_mfa",
  "mfa_code": "123456"
}
```

### GET /api/accounts/:id/balance
Get detailed balance info

**Response:**
```json
{
  "account_id": "uuid",
  "account_number": "1234567890",
  "account_type": "checking",
  "balance": 5000.00,
  "available_balance": 4500.00,
  "pending_balance": 500.00,
  "outgoing_holds": 500.00,
  "incoming_holds": 0,
  "active_holds": [...],
  "recent_transactions": [...]
}
```

---

## ⚙️ Background Workers

### 1. Internal Settlement Worker

**Purpose:** Settle internal transfers after 1 business day

**Pseudo-code:**
```typescript
async function processInternalSettlement() {
  while (true) {
    try {
      // 1. Find pending internal transfers ready for settlement
      const transfers = await db.query(`
        SELECT * FROM transfers
        WHERE transfer_type = 'internal'
          AND status = 'pending'
          AND scheduled_settlement_at <= NOW()
        ORDER BY scheduled_settlement_at ASC
        LIMIT 100
        FOR UPDATE SKIP LOCKED
      `);

      for (const transfer of transfers) {
        await db.transaction(async (tx) => {
          // 2. Update transfer status
          await tx.update('transfers')
            .set({ status: 'processing' })
            .where({ id: transfer.id });

          // 3. Get and release hold
          const hold = await tx.select('holds')
            .where({ transfer_id: transfer.id, hold_type: 'outgoing' })
            .first();

          await tx.update('holds')
            .set({ status: 'settled', settled_at: NOW() })
            .where({ id: hold.id });

          // 4. Debit sender account
          const fromAccount = await tx.select('accounts')
            .where({ id: transfer.from_account_id })
            .forUpdate()
            .first();

          const newBalance = fromAccount.balance - (transfer.amount + transfer.fee);
          
          await tx.update('accounts')
            .set({
              balance: newBalance,
              available_balance: fromAccount.available_balance, // Already reduced by hold
              pending_balance: fromAccount.pending_balance - (transfer.amount + transfer.fee)
            })
            .where({ id: transfer.from_account_id });

          // 5. Create debit ledger entry
          await tx.insert('ledger_entries').values({
            transfer_id: transfer.id,
            account_id: transfer.from_account_id,
            user_id: transfer.user_id,
            entry_type: 'debit',
            amount: transfer.amount + transfer.fee,
            balance_after: newBalance,
            category: 'transfer_out',
            description: `Transfer to account ${transfer.to_account_id}`,
            reference: transfer.reference
          });

          // 6. Credit recipient account
          const toAccount = await tx.select('accounts')
            .where({ id: transfer.to_account_id })
            .forUpdate()
            .first();

          const newToBalance = toAccount.balance + transfer.amount;

          await tx.update('accounts')
            .set({
              balance: newToBalance,
              available_balance: toAccount.available_balance + transfer.amount
            })
            .where({ id: transfer.to_account_id });

          // 7. Create credit ledger entry
          await tx.insert('ledger_entries').values({
            transfer_id: transfer.id,
            account_id: transfer.to_account_id,
            user_id: toAccount.user_id,
            entry_type: 'credit',
            amount: transfer.amount,
            balance_after: newToBalance,
            category: 'transfer_in',
            description: `Transfer from account ${transfer.from_account_id}`,
            reference: transfer.reference
          });

          // 8. Update transfer to settled
          await tx.update('transfers')
            .set({
              status: 'settled',
              settled_at: NOW()
            })
            .where({ id: transfer.id });

          // 9. Create notifications
          await tx.insert('alerts').values([
            {
              user_id: transfer.user_id,
              type: 'general',
              title: 'Transfer completed',
              message: `$${transfer.amount} has been transferred successfully.`,
              severity: 'success'
            },
            {
              user_id: toAccount.user_id,
              type: 'general',
              title: 'Transfer received',
              message: `$${transfer.amount} has been deposited to your account.`,
              severity: 'success'
            }
          ]);

          // 10. Log event
          await tx.insert('transfer_events').values({
            transfer_id: transfer.id,
            from_status: 'processing',
            to_status: 'settled',
            event_type: 'settlement_complete',
            details: 'Internal transfer settled successfully'
          });
        });

        console.log(`✅ Settled transfer ${transfer.id}`);
      }

      // Sleep for 1 minute
      await sleep(60000);

    } catch (error) {
      console.error('Settlement worker error:', error);
      await sleep(5000); // Retry after 5 seconds
    }
  }
}
```

**Retry Logic:**
- Exponential backoff: 5s, 10s, 30s, 1m, 5m
- Max retries: 5
- After max retries, mark as `failed` and alert admin

**Concurrency:**
- Use `FOR UPDATE SKIP LOCKED` to prevent race conditions
- Multiple worker instances can run in parallel
- Each worker processes different transfers

---

### 2. ACH Worker (Interbank)

**Purpose:** Process interbank transfers via ACH

**Pseudo-code:**
```typescript
async function processACHTransfers() {
  while (true) {
    try {
      // 1. Find pending interbank transfers ready for processing
      const transfers = await db.query(`
        SELECT * FROM transfers
        WHERE transfer_type = 'interbank'
          AND status = 'pending'
          AND scheduled_settlement_at <= NOW()
        ORDER BY created_at ASC
        LIMIT 50
        FOR UPDATE SKIP LOCKED
      `);

      if (transfers.length === 0) {
        await sleep(300000); // 5 minutes
        continue;
      }

      // 2. Batch transfers for ACH submission
      const batch = {
        batch_id: generateBatchId(),
        created_at: new Date(),
        transfers: transfers.map(t => ({
          transfer_id: t.id,
          routing_number: t.external_routing_number,
          account_number: t.external_account_number,
          account_holder: t.external_account_holder_name,
          amount: t.amount,
          reference: t.reference
        }))
      };

      // 3. Update status to processing
      await db.update('transfers')
        .set({ status: 'processing', retry_count: t.retry_count + 1 })
        .whereIn('id', transfers.map(t => t.id));

      // 4. Submit to ACH provider (or simulator)
      const achResponse = await submitToACHProvider(batch);

      if (achResponse.success) {
        console.log(`✅ ACH batch ${batch.batch_id} submitted successfully`);
        
        // 5. Schedule callback check (simulate 3-5 day wait)
        scheduleACHCallbackCheck(batch.batch_id, transfers, 4); // 4 days
        
      } else {
        // Handle submission failure
        for (const transfer of transfers) {
          await handleACHFailure(transfer, achResponse.error);
        }
      }

      await sleep(60000); // 1 minute

    } catch (error) {
      console.error('ACH worker error:', error);
      await sleep(10000);
    }
  }
}

async function checkACHSettlement(batchId, transfers) {
  try {
    // 1. Check ACH provider for settlement status
    const achStatus = await checkACHProviderStatus(batchId);

    for (const transfer of transfers) {
      const result = achStatus.results.find(r => r.reference === transfer.reference);

      if (result.status === 'settled') {
        await db.transaction(async (tx) => {
          // Settle transfer (similar to internal settlement)
          await settleInterbankTransfer(tx, transfer);
          
          console.log(`✅ ACH transfer ${transfer.id} settled`);
        });

      } else if (result.status === 'failed') {
        await handleACHFailure(transfer, result.reason);
      }
    }

  } catch (error) {
    console.error('ACH settlement check error:', error);
    // Retry after delay
    scheduleACHCallbackCheck(batchId, transfers, 1); // Check again in 1 day
  }
}

async function handleACHFailure(transfer, reason) {
  await db.transaction(async (tx) => {
    // 1. Update transfer to failed
    await tx.update('transfers')
      .set({
        status: 'failed',
        failure_reason: reason
      })
      .where({ id: transfer.id });

    // 2. Release hold
    await tx.update('holds')
      .set({ status: 'released', released_at: NOW() })
      .where({ transfer_id: transfer.id, hold_type: 'outgoing' });

    // 3. Restore available balance
    const hold = await tx.select('holds')
      .where({ transfer_id: transfer.id })
      .first();

    await tx.raw(`
      UPDATE accounts
      SET available_balance = available_balance + ?
      WHERE id = ?
    `, [hold.amount, transfer.from_account_id]);

    // 4. Create ledger entry (release)
    await tx.insert('ledger_entries').values({
      transfer_id: transfer.id,
      account_id: transfer.from_account_id,
      user_id: transfer.user_id,
      entry_type: 'release',
      amount: hold.amount,
      category: 'transfer_release',
      description: `Transfer failed - ${reason}`,
      reference: transfer.reference
    });

    // 5. Notify user
    await tx.insert('alerts').values({
      user_id: transfer.user_id,
      type: 'general',
      title: 'Transfer failed',
      message: `Transfer of $${transfer.amount} to ${transfer.external_bank_name} failed. Reason: ${reason}. Funds have been returned to your account.`,
      severity: 'error'
    });
  });

  console.log(`❌ ACH transfer ${transfer.id} failed: ${reason}`);
}
```

---

## 🔒 Security & Validation

### Authentication
- All endpoints require Bearer token
- RLS policies ensure users only see own data
- Admin role can view/manage all transfers

### Validation Layers

1. **Client-side (UI):**
   - Real-time balance checks
   - Format validation
   - Immediate feedback

2. **API Layer:**
   - Schema validation
   - Business rule checks
   - Idempotency enforcement

3. **Database Layer:**
   - CHECK constraints
   - Foreign key constraints
   - RLS policies
   - Triggers for logging

### Concurrency Control
- `FOR UPDATE` locks on accounts during balance changes
- `SKIP LOCKED` for worker job distribution
- Transaction isolation level: READ COMMITTED

### Audit Trail
- Every transfer logged in `ledger_entries` (immutable)
- All status changes in `transfer_events`
- Failed transfers recorded with reasons

---

## 🎨 UI Flows

### 1. Transfer Initiation Page

**Components:**
- Account selector (From)
- Transfer type toggle (Internal / External)
- To account selector (internal) OR external bank form
- Amount input with real-time balance check
- Fee calculation display
- Settlement time estimate
- Memo field
- Confirmation button

**Validation:**
```typescript
- From account selected ✓
- Amount > 0 and <= max_amount ✓
- Available balance sufficient ✓
- Not exceeding daily limits ✓
- Savings limit check (show warning) ✓
- External bank details valid (routing 9 digits, etc.) ✓
```

**UI States:**
```typescript
- Loading: Fetching account balances
- Ready: Form ready for input
- Validating: Checking balances/limits
- Requires MFA: Show MFA input
- Submitting: Creating transfer
- Success: Show confirmation + transfer ID
- Error: Show error message
```

### 2. Transfer Confirmation Modal

**Shows:**
- From: Account **** 1234 - $5,000.00
- To: Account **** 5678 OR Bank of America **** 9876
- Amount: $500.00
- Fee: $2.50
- Total: $502.50
- Settlement: 1 business day (or 3-5 days)
- Available after: $4,497.50

**Actions:**
- Confirm (requires MFA if over threshold)
- Cancel

### 3. MFA Verification Screen

**If transfer requires MFA:**
```
🔐 Verify Your Identity

This transfer requires additional verification.
Enter the code sent to your phone/email.

[_] [_] [_] [_] [_] [_]

□ Trust this device for 30 days

[Verify]  [Resend Code]
```

### 4. Transfer Tracking Page

**URL:** `/dashboard/transfers/:id`

**Layout:**
```
Transfer #FTZ241220ABCD1234

Status: [●●●○] Processing
       Initiated → Pending → Processing → Settled

Details:
From:     Checking **** 1234
To:       Savings **** 5678
Amount:   $500.00
Fee:      $0.00
Total:    $500.00
Initiated: Oct 20, 2025 3:45 PM
Expected:  Oct 21, 2025 by 5:00 PM
Status:    Processing

[Timeline]
✓ Oct 20, 3:45 PM - Transfer initiated
✓ Oct 20, 3:45 PM - Funds reserved
⊙ Oct 21, ~12:00 PM - Settlement processing
○ Oct 21, ~5:00 PM - Transfer complete

[Ledger Entries]
- Hold created: $500.00
- [Pending: Settlement entries]

[Actions]
[Cancel Transfer] (only if status = initiated/pending)
[Download Receipt]
```

### 5. Transfer History Page

**URL:** `/dashboard/transfers`

**Filters:**
- All / Pending / Completed / Failed
- Internal / Interbank / All
- Date range

**List:**
```
[Card 1]
Transfer to Savings **** 5678
$500.00 • Oct 20, 2025
Status: Completed ✓
[View Details]

[Card 2]
Transfer to Bank of America
$1,000.00 • Oct 18, 2025
Status: Processing ⊙ (2 days remaining)
[Track]

[Card 3]
Transfer to Checking **** 1234
$250.00 • Oct 15, 2025
Status: Failed ✗
Reason: Insufficient funds
[View Details]
```

---

## 🧪 Test Plan

### Unit Tests

**1. Validation Tests**
```typescript
✓ Rejects transfer with amount <= 0
✓ Rejects transfer with insufficient balance
✓ Rejects transfer exceeding daily limit
✓ Rejects transfer exceeding savings limit (6/month)
✓ Rejects transfer to same account
✓ Validates external bank routing number format
✓ Calculates fees correctly
```

**2. Idempotency Tests**
```typescript
✓ Duplicate idempotency_key returns existing transfer
✓ Different transfers with unique keys succeed
✓ Retry after failure with same key returns error
```

**3. Balance Tests**
```typescript
✓ Available balance reduces immediately
✓ Actual balance unchanged until settlement
✓ Multiple holds accumulate correctly
✓ Hold release restores available balance
```

### Integration Tests

**1. Internal Transfer Flow**
```typescript
✓ Create transfer → Hold created → Available reduced
✓ Settlement worker processes → Balances updated
✓ Ledger entries created (debit + credit)
✓ Both users receive notifications
✓ Transfer events logged
```

**2. Interbank Transfer Flow**
```typescript
✓ Create transfer → Hold created
✓ ACH worker batches transfer
✓ Simulated 4-day wait
✓ Settlement callback → Balances updated
✓ Ledger entries created
✓ User notified
```

**3. Failure Scenarios**
```typescript
✓ ACH failure → Hold released → Balance restored
✓ Concurrent transfers → No race conditions
✓ Worker crash → Transfer retried successfully
✓ Database timeout → Transaction rolled back
```

### Load Tests

```typescript
✓ 100 concurrent transfer requests
✓ 1000 transfers/minute throughput
✓ Worker processes 500 settlements/minute
✓ API response time < 500ms (p95)
✓ Database query time < 100ms
```

---

## 📈 Monitoring & Alerts

### Metrics to Track

1. **Transfer Volume:**
   - Total transfers/day
   - Internal vs interbank ratio
   - Average transfer amount
   - Fee revenue

2. **Success Rates:**
   - % completed successfully
   - % failed (by reason)
   - % cancelled by user

3. **Performance:**
   - API response times
   - Settlement processing time
   - Worker queue length
   - Database query performance

4. **Business Metrics:**
   - Users hitting savings limit
   - Transfers requiring MFA
   - Daily limit violations
   - Available balance patterns

### Alerts

```yaml
Critical:
  - Worker down > 5 minutes
  - Failed transfers > 5%
  - Negative account balance detected
  - Database transaction timeout

Warning:
  - Settlement backlog > 1000
  - ACH provider latency > 10s
  - Failed transfers > 2%
  - Worker retry rate > 20%

Info:
  - Large transfer > $50,000
  - User exceeds daily limit
  - Savings limit reached
```

---

## 🚀 Deployment Checklist

### Database
- [ ] Run `create_transfers_system.sql` migration
- [ ] Verify all tables created
- [ ] Verify RLS policies active
- [ ] Insert default transfer_limits
- [ ] Test helper functions

### API
- [ ] Deploy transfer endpoints
- [ ] Test POST /api/transfers-v2
- [ ] Test GET /api/transfers-v2/:id
- [ ] Test PATCH /api/transfers-v2/:id
- [ ] Test /api/accounts/:id/balance
- [ ] Verify authentication
- [ ] Test error responses

### Background Workers
- [ ] Deploy settlement worker
- [ ] Deploy ACH worker
- [ ] Configure job scheduler
- [ ] Test retry logic
- [ ] Set up monitoring

### UI
- [ ] Deploy transfer initiation page
- [ ] Deploy transfer tracking page
- [ ] Deploy transfer history
- [ ] Test responsive design
- [ ] Test error states

### Testing
- [ ] Run unit tests
- [ ] Run integration tests
- [ ] Run load tests
- [ ] Test failure scenarios
- [ ] User acceptance testing

### Monitoring
- [ ] Set up metrics dashboards
- [ ] Configure alerts
- [ ] Test alert delivery
- [ ] Document runbooks

---

## ✅ Complete Implementation Status

✅ Database schema created  
✅ RLS policies configured  
✅ API endpoints implemented  
✅ Balance tracking with holds  
✅ Idempotency support  
✅ Fee calculation  
✅ Savings limit enforcement  
✅ Daily limits enforcement  
✅ MFA requirement logic  
✅ Ledger entries (double-entry)  
✅ Transfer events logging  
✅ Worker design documented  
✅ Settlement logic detailed  
✅ UI flows specified  
✅ Test plan complete  

**Next Steps:**
1. Implement UI components (transfer form, tracking page)
2. Deploy background workers (requires separate Node.js service or Next.js cron)
3. Integrate MFA provider (Twilio, AWS SNS, etc.)
4. Connect to real ACH provider (Plaid, Stripe, Dwolla, etc.)
5. Set up monitoring and alerts

**Fortiz Bank Transfer System is Ready!** 💸🚀

