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
{ "first_name": "Guntur", "last_name": "Saputro", "phone_number": "0811255501", "address": "Jl. Kebon Sirih No. 1", "pin": "123456" }

// Response 201
{ "status": "SUCCESS", "result": { "user_id": "...", "first_name": "Guntur", ... } }
```

#### POST /login
```json
// Request
{ "phone_number": "0811255501", "pin": "123456" }

// Response 200
{ "status": "SUCCESS", "result": { "access_token": "...", "refresh_token": "..." } }
```

### Wallet (requires Authorization: Bearer {token})

#### POST /topup
```json
// Request
{ "amount": 500000 }
```

#### POST /pay
```json
// Request
{ "amount": 100000, "remarks": "Pulsa Telkomsel 100k" }
```

#### POST /transfer
```json
// Request
{ "target_user": "uuid-target", "amount": 30000, "remarks": "Hadiah Ultah" }
```

> Transfer dieksekusi secara background melalui Bull queue. Jika Redis tidak tersedia, dieksekusi secara sinkron sebagai fallback.

### Transactions

#### GET /transactions
Mengembalikan semua transaksi user (top up, payment, transfer), diurutkan terbaru.

### Profile

#### PUT /profile
```json
// Request
{ "first_name": "Tom", "last_name": "Araya", "address": "Jl. Diponegoro No. 215" }
```

---