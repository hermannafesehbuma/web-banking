# Fortiz Bank - Transfer API Specification

## Base URL
```
https://fortizbank.com/api
```

## Authentication
All endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### 1. Create Transfer

**Endpoint:** `POST /api/transfers-v2`

**Description:** Initiate a new internal or interbank transfer

#### Request Headers
```http
Authorization: Bearer eyJhbGc...
Content-Type: application/json
```

#### Request Body (Internal Transfer)
```json
{
  "idempotency_key": "client-uuid-12345",
  "from_account_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "to_account_id": "f6e5d4c3-b2a1-0987-6543-210fedcba098",
  "amount": 500.00,
  "memo": "Rent payment for November",
  "transfer_type": "internal"
}
```

#### Request Body (Interbank Transfer)
```json
{
  "idempotency_key": "client-uuid-67890",
  "from_account_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "external_bank_name": "Bank of America",
  "external_routing_number": "123456789",
  "external_account_number": "9876543210",
  "external_account_holder_name": "John Doe",
  "amount": 1000.00,
  "memo": "Payment to vendor",
  "transfer_type": "interbank"
}
```

#### Success Response (201 Created)
```json
{
  "transfer": {
    "id": "tx_abc123def456",
    "idempotency_key": "client-uuid-12345",
    "user_id": "user_xyz789",
    "from_account_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "to_account_id": "f6e5d4c3-b2a1-0987-6543-210fedcba098",
    "amount": 500.00,
    "fee": 0.00,
    "currency": "USD",
    "transfer_type": "internal",
    "status": "pending",
    "memo": "Rent payment for November",
    "reference": "FTZ241220ABCD1234",
    "scheduled_settlement_at": "2025-10-21T12:00:00Z",
    "created_at": "2025-10-20T15:30:00Z",
    "requires_mfa": false,
    "mfa_verified": false
  },
  "message": "Transfer initiated successfully",
  "requires_mfa": false,
  "settlement_estimate": "1 business day",
  "fee": 0.00
}
```

#### Error Responses

**400 Bad Request - Missing Fields**
```json
{
  "error": "Missing required fields: idempotency_key, from_account_id, amount, transfer_type"
}
```

**400 Bad Request - Insufficient Balance**
```json
{
  "error": "Insufficient available balance",
  "details": "Available: $450.00, Required: $502.50 (including $2.50 fee)",
  "available_balance": 450.00,
  "required_amount": 502.50
}
```

**400 Bad Request - Invalid Account**
```json
{
  "error": "Invalid from_account_id or account does not belong to user"
}
```

**400 Bad Request - Transfer Limit**
```json
{
  "error": "Maximum transfer amount is $10000"
}
```

**429 Too Many Requests - Savings Limit**
```json
{
  "error": "Savings account transfer limit exceeded",
  "details": "Federal regulation limits savings account transfers to 6 per month. You have reached this limit. Consider using your checking account or contact support.",
  "count": 6,
  "limit": 6
}
```

**429 Too Many Requests - Daily Limit**
```json
{
  "error": "Daily amount limit exceeded",
  "details": "Daily limit is $25000. You have used $22000.00 today."
}
```

**200 OK - Idempotent Request**
```json
{
  "transfer": {
    "id": "tx_abc123def456",
    "status": "pending",
    ...
  },
  "message": "Transfer already exists (idempotent request)"
}
```

---

### 2. List Transfers

**Endpoint:** `GET /api/transfers-v2`

**Description:** Get all transfers for the authenticated user

#### Query Parameters
- `status` (optional) - Filter by status: `pending`, `processing`, `settled`, `failed`, `cancelled`
- `type` (optional) - Filter by type: `internal`, `interbank`
- `limit` (optional) - Number of results (default: 50, max: 200)

#### Example Request
```http
GET /api/transfers-v2?status=pending&limit=20
Authorization: Bearer eyJhbGc...
```

#### Success Response (200 OK)
```json
{
  "transfers": [
    {
      "id": "tx_abc123",
      "from_account_id": "acct_123",
      "to_account_id": "acct_456",
      "amount": 500.00,
      "fee": 0.00,
      "transfer_type": "internal",
      "status": "pending",
      "reference": "FTZ241220ABCD1234",
      "scheduled_settlement_at": "2025-10-21T12:00:00Z",
      "created_at": "2025-10-20T15:30:00Z"
    },
    {
      "id": "tx_def456",
      "from_account_id": "acct_123",
      "external_bank_name": "Bank of America",
      "amount": 1000.00,
      "fee": 2.50,
      "transfer_type": "interbank",
      "status": "processing",
      "reference": "FTZ241219EFGH5678",
      "scheduled_settlement_at": "2025-10-23T12:00:00Z",
      "created_at": "2025-10-19T10:15:00Z"
    }
  ]
}
```

---

### 3. Get Transfer Details

**Endpoint:** `GET /api/transfers-v2/:id`

**Description:** Get detailed information about a specific transfer

#### Example Request
```http
GET /api/transfers-v2/tx_abc123def456
Authorization: Bearer eyJhbGc...
```

#### Success Response (200 OK)
```json
{
  "transfer": {
    "id": "tx_abc123def456",
    "idempotency_key": "client-uuid-12345",
    "user_id": "user_xyz789",
    "from_account_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "to_account_id": "f6e5d4c3-b2a1-0987-6543-210fedcba098",
    "amount": 500.00,
    "fee": 0.00,
    "currency": "USD",
    "transfer_type": "internal",
    "status": "processing",
    "memo": "Rent payment",
    "reference": "FTZ241220ABCD1234",
    "scheduled_settlement_at": "2025-10-21T12:00:00Z",
    "created_at": "2025-10-20T15:30:00Z",
    "updated_at": "2025-10-21T10:00:00Z"
  },
  "from_account": {
    "account_number": "1234567890",
    "account_type": "checking"
  },
  "to_account": {
    "account_number": "0987654321",
    "account_type": "savings"
  },
  "holds": [
    {
      "id": "hold_123",
      "account_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "amount": 500.00,
      "hold_type": "outgoing",
      "status": "active",
      "created_at": "2025-10-20T15:30:00Z"
    }
  ],
  "ledger_entries": [
    {
      "id": "ledger_001",
      "entry_type": "hold",
      "amount": 500.00,
      "balance_after": 4500.00,
      "category": "transfer_hold",
      "description": "Transfer hold: Rent payment",
      "created_at": "2025-10-20T15:30:00Z"
    }
  ],
  "events": [
    {
      "id": "event_001",
      "from_status": "initiated",
      "to_status": "pending",
      "event_type": "status_change",
      "details": "Status changed from initiated to pending",
      "created_at": "2025-10-20T15:30:00Z"
    },
    {
      "id": "event_002",
      "from_status": "pending",
      "to_status": "processing",
      "event_type": "status_change",
      "details": "Status changed from pending to processing",
      "created_at": "2025-10-21T10:00:00Z"
    }
  ],
  "progress": 75
}
```

#### Error Response (404 Not Found)
```json
{
  "error": "Transfer not found"
}
```

---

### 4. Update Transfer (Cancel or Verify MFA)

**Endpoint:** `PATCH /api/transfers-v2/:id`

**Description:** Cancel a transfer or verify MFA

#### Cancel Transfer Request
```json
{
  "action": "cancel"
}
```

#### Cancel Success Response (200 OK)
```json
{
  "message": "Transfer cancelled successfully",
  "transfer": {
    "id": "tx_abc123def456",
    "status": "cancelled",
    "updated_at": "2025-10-20T16:00:00Z"
  }
}
```

#### Cancel Error (400 Bad Request)
```json
{
  "error": "Transfer cannot be cancelled at this stage"
}
```

#### Verify MFA Request
```json
{
  "action": "verify_mfa",
  "mfa_code": "123456"
}
```

#### MFA Success Response (200 OK)
```json
{
  "message": "MFA verified successfully - transfer is now pending",
  "transfer": {
    "id": "tx_abc123def456",
    "status": "pending",
    "mfa_verified": true,
    "updated_at": "2025-10-20T15:35:00Z"
  }
}
```

#### MFA Error (400 Bad Request)
```json
{
  "error": "Invalid MFA code"
}
```

---

### 5. Get Account Balance

**Endpoint:** `GET /api/accounts/:id/balance`

**Description:** Get detailed balance information for an account

#### Example Request
```http
GET /api/accounts/a1b2c3d4-e5f6-7890-abcd-ef1234567890/balance
Authorization: Bearer eyJhbGc...
```

#### Success Response (200 OK)
```json
{
  "account_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "account_number": "1234567890",
  "account_type": "checking",
  "currency": "USD",
  "balance": 5000.00,
  "available_balance": 4500.00,
  "pending_balance": 500.00,
  "outgoing_holds": 500.00,
  "incoming_holds": 0.00,
  "active_holds": [
    {
      "id": "hold_123",
      "transfer_id": "tx_abc123",
      "amount": 500.00,
      "hold_type": "outgoing",
      "status": "active",
      "created_at": "2025-10-20T15:30:00Z"
    }
  ],
  "recent_transactions": [
    {
      "id": "txn_001",
      "amount": 500.00,
      "type": "transfer",
      "description": "Transfer to savings",
      "created_at": "2025-10-20T15:30:00Z"
    }
  ],
  "last_updated": "2025-10-20T15:30:00Z"
}
```

#### Error Response (404 Not Found)
```json
{
  "error": "Account not found"
}
```

---

## Status Flow

### Transfer Status Lifecycle
```
initiated → pending → processing → settled
                ↓          ↓
            cancelled   failed
                         ↓
                     reversed
```

### Status Definitions

| Status | Description | User Actions |
|--------|-------------|--------------|
| `initiated` | Transfer created, awaiting MFA (if required) | Can cancel, can verify MFA |
| `pending` | Funds held, awaiting settlement date | Can cancel (before processing) |
| `processing` | Settlement in progress | No actions available |
| `settled` | Transfer complete, funds transferred | View receipt |
| `failed` | Transfer failed, funds returned | View reason, retry |
| `cancelled` | User cancelled, funds returned | View details |
| `reversed` | Post-settlement reversal (rare) | Contact support |

---

## Error Codes

| HTTP Status | Error Code | Description |
|-------------|-----------|-------------|
| 400 | `validation_error` | Invalid request parameters |
| 400 | `insufficient_balance` | Not enough available balance |
| 400 | `invalid_account` | Account doesn't exist or doesn't belong to user |
| 400 | `same_account` | Cannot transfer to same account |
| 400 | `limit_exceeded` | Amount exceeds transaction or daily limit |
| 400 | `cannot_cancel` | Transfer is past cancellation stage |
| 401 | `unauthorized` | Missing or invalid authentication token |
| 404 | `not_found` | Transfer or account not found |
| 429 | `rate_limit` | Too many requests or daily/monthly limit reached |
| 500 | `internal_error` | Server error |

---

## Rate Limits

### API Rate Limits
- **100 requests/minute** per user
- **1000 requests/hour** per user

### Transfer Limits (Standard Tier)
- **Internal:** $50,000 per transaction, $100,000 per day
- **Interbank:** $10,000 per transaction, $25,000 per day
- **Daily transactions:** 10 per day
- **Savings transfers:** 6 per 30 days (federal regulation)

---

## Webhooks (Future)

For real-time notifications, Fortiz Bank will support webhooks:

### Events
- `transfer.created`
- `transfer.pending`
- `transfer.processing`
- `transfer.settled`
- `transfer.failed`
- `transfer.cancelled`

### Webhook Payload
```json
{
  "event": "transfer.settled",
  "timestamp": "2025-10-21T14:30:00Z",
  "data": {
    "transfer_id": "tx_abc123def456",
    "user_id": "user_xyz789",
    "amount": 500.00,
    "status": "settled"
  }
}
```

---

## Testing

### Sandbox Environment
Base URL: `https://sandbox.fortizbank.com/api`

### Test Accounts
```
Checking: test_checking_123
Balance: $10,000.00

Savings: test_savings_456
Balance: $5,000.00
```

### Test Scenarios

**1. Successful Internal Transfer**
```json
{
  "idempotency_key": "test_internal_001",
  "from_account_id": "test_checking_123",
  "to_account_id": "test_savings_456",
  "amount": 100.00,
  "transfer_type": "internal"
}
```

**2. Insufficient Balance**
```json
{
  "idempotency_key": "test_insufficient_001",
  "from_account_id": "test_checking_123",
  "to_account_id": "test_savings_456",
  "amount": 20000.00,
  "transfer_type": "internal"
}
```

**3. Trigger MFA Requirement**
```json
{
  "idempotency_key": "test_mfa_001",
  "from_account_id": "test_checking_123",
  "external_bank_name": "Test Bank",
  "external_routing_number": "123456789",
  "external_account_number": "9876543210",
  "external_account_holder_name": "Test User",
  "amount": 6000.00,
  "transfer_type": "interbank"
}
```

**4. Simulate ACH Failure**
```json
{
  "idempotency_key": "test_ach_fail_001",
  "from_account_id": "test_checking_123",
  "external_bank_name": "Test Bank",
  "external_routing_number": "999999999",  // Invalid routing
  "external_account_number": "9876543210",
  "external_account_holder_name": "Test User",
  "amount": 100.00,
  "transfer_type": "interbank"
}
```

---

## SDKs (Future)

### JavaScript/TypeScript
```typescript
import { FortizClient } from '@fortiz/sdk';

const client = new FortizClient({ apiKey: 'your_api_key' });

const transfer = await client.transfers.create({
  idempotencyKey: 'unique-key',
  fromAccountId: 'acct_123',
  toAccountId: 'acct_456',
  amount: 500.00,
  transferType: 'internal'
});

console.log(transfer.status); // 'pending'
```

### Python
```python
from fortiz import FortizClient

client = FortizClient(api_key='your_api_key')

transfer = client.transfers.create(
    idempotency_key='unique-key',
    from_account_id='acct_123',
    to_account_id='acct_456',
    amount=500.00,
    transfer_type='internal'
)

print(transfer.status)  # 'pending'
```

---

## Support

### API Issues
Email: api-support@fortizbank.com  
Response time: < 4 hours

### Documentation
https://docs.fortizbank.com/api

### Changelog
https://docs.fortizbank.com/api/changelog

### Status Page
https://status.fortizbank.com

