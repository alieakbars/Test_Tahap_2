## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Konfigurasi environment
```bash
cp .env.example .env
# Edit .env sesuai kebutuhan
```

### 3. Jalankan server
```bash
npm start          # production
npm run dev        # development (nodemon)
```

### 4. Jalankan background worker (transfer queue)
```bash
npm run worker
```

### 5. Seed contoh data
```bash
node example_data.js
```

### 6. Jalankan unit test
```bash
npm test
```

## API Endpoints

### Auth

#### POST /register
```json
// Request
{
  "first_name": "Guntur",
  "last_name": "Saputro",
  "phone_number": "0811255501",
  "address": "Jl. Kebon Sirih No. 1",
  "pin": "123456"
}

// Response SUCCESS (201)
{
  "status": "SUCCESS",
  "result": {
    "user_id": "bc1c823e-b0fb-4b20-88c0-dff25e283252",
    "first_name": "Guntur",
    "last_name": "Saputro",
    "phone_number": "0811255501",
    "address": "Jl. Kebon Sirih No. 1",
    "created_date": "2021-04-01T22:21:20.000Z"
  }
}

// Response FAILED (phone sudah terdaftar)
{ "message": "Phone Number already registered" }
```

#### POST /login
```json
// Request
{
  "phone_number": "0811255501",
  "pin": "123456"
}

// Response SUCCESS (200)
{
  "status": "SUCCESS",
  "result": {
    "access_token": "{access_token}",
    "refresh_token": "{refresh_token}"
  }
}

// Response FAILED
{ "message": "Phone number and pin doesn't match." }
```

### Wallet (requires Authorization: Bearer {token})

#### POST /topup
```json
// Request
{ "amount": 500000 }

// Response SUCCESS
{
  "status": "SUCCESS",
  "result": {
    "top_up_id": "201ddde1-f797-484b-b1a0-07d1190e790a",
    "amount_top_up": 500000,
    "balance_before": 0,
    "balance_after": 500000,
    "created_date": "2021-04-01T22:21:21.000Z"
  }
}

// Response FAILED (belum login)
{ "message": "Unauthenticated" }
```

#### POST /pay
```json
// Request
{ "amount": 100000, "remarks": "Pulsa Telkomsel 100k" }

// Response SUCCESS
{
  "status": "SUCCESS",
  "result": {
    "payment_id": "13bcb11c-111e-4a65-9afd-90a86a01cd21",
    "amount": 100000,
    "remarks": "Pulsa Telkomsel 100k",
    "balance_before": 500000,
    "balance_after": 400000,
    "created_date": "2021-04-01T22:22:00.000Z"
  }
}

// Response FAILED (saldo kurang)
{ "message": "Balance is not enough" }

// Response FAILED (belum login)
{ "message": "Unauthenticated" }
```

#### POST /transfer
```json
// Request
{ "target_user": "b7342e8e-e8e7-4a5d-873e-b1b1bfcdeddb", "amount": 30000, "remarks": "Hadiah Ultah" }

// Response SUCCESS
{
  "status": "SUCCESS",
  "result": {
    "transfer_id": "a7d39cf6-44b6-41fc-b3e9-7b16df5321c5",
    "amount": 30000,
    "remarks": "Hadiah Ultah",
    "balance_before": 400000,
    "balance_after": 370000,
    "created_date": "2021-04-01T22:23:20.000Z"
  }
}

// Response FAILED (saldo kurang)
{ "message": "Balance is not enough" }

// Response FAILED (target tidak ditemukan)
{ "message": "Target user not found" }

// Response FAILED (belum login)
{ "message": "Unauthenticated" }
```

> Transfer dieksekusi secara background melalui Bull queue. Jika Redis tidak tersedia, dieksekusi secara sinkron sebagai fallback.

### Transactions

#### GET /transactions
```json
// Response SUCCESS
{
  "status": "SUCCESS",
  "result": [
    {
      "transfer_id": "a7d39cf6-44b6-41fc-b3e9-7b16df5321c5",
      "status": "SUCCESS",
      "user_id": "bc1c823e-b0fb-4b20-88c0-dff25e283252",
      "transaction_type": "DEBIT",
      "amount": 30000,
      "remarks": "Hadiah Ultah",
      "balance_before": 400000,
      "balance_after": 370000,
      "created_date": "2021-04-01T22:23:20.000Z"
    },
    {
      "payment_id": "13bcb11c-111e-4a65-9afd-90a86a01cd21",
      "status": "SUCCESS",
      "user_id": "bc1c823e-b0fb-4b20-88c0-dff25e283252",
      "transaction_type": "DEBIT",
      "amount": 100000,
      "remarks": "Pulsa Telkomsel 100k",
      "balance_before": 500000,
      "balance_after": 400000,
      "created_date": "2021-04-01T22:22:00.000Z"
    },
    {
      "top_up_id": "201ddde1-f797-484b-b1a0-07d1190e790a",
      "status": "SUCCESS",
      "user_id": "bc1c823e-b0fb-4b20-88c0-dff25e283252",
      "transaction_type": "CREDIT",
      "amount": 500000,
      "remarks": "",
      "balance_before": 0,
      "balance_after": 500000,
      "created_date": "2021-04-01T22:21:21.000Z"
    }
  ]
}

// Response FAILED (belum login)
{ "message": "Unauthenticated" }
```

### Profile

#### PUT /profile
```json
// Request
{ "first_name": "Tom", "last_name": "Araya", "address": "Jl. Diponegoro No. 215" }

// Response SUCCESS
{
  "status": "SUCCESS",
  "result": {
    "user_id": "bc1c823e-b0fb-4b20-88c0-dff25e283252",
    "first_name": "Tom",
    "last_name": "Araya",
    "address": "Jl. Diponegoro No. 215",
    "updated_date": "2021-04-01T23:00:20.000Z"
  }
}

// Response FAILED (belum login)
{ "message": "Unauthenticated" }
```