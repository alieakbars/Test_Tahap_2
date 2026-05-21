require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tes2';

const userSchema = new mongoose.Schema({
  user_id: String, first_name: String, last_name: String,
  phone_number: String, address: String, pin: String, balance: Number,
}, { timestamps: { createdAt: 'created_date', updatedAt: 'updated_date' }, versionKey: false });

const txSchema = new mongoose.Schema({
  transaction_id: String, user_id: String,
  transaction_type: String, type: String, status: String,
  amount: Number, remarks: String, balance_before: Number, balance_after: Number,
  related_transaction_id: { type: String, default: null },
  target_user_id: { type: String, default: null },
}, { timestamps: { createdAt: 'created_date', updatedAt: false }, versionKey: false });

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', txSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Transaction.deleteMany({});

  const pin = await bcrypt.hash('123456', 10);

  const userId1 = 'bc1c823e-b0fb-4b20-88c0-dff25e283252';
  const userId2 = 'b7342e8e-e8e7-4a5d-873e-b1b1bfcdeddb';
  const topUpId = '201ddde1-f797-484b-b1a0-07d1190e790a';
  const paymentId = '13bcb11c-111e-4a65-9afd-90a86a01cd21';
  const transferId = 'a7d39cf6-44b6-41fc-b3e9-7b16df5321c5';

  await User.create([
    {
      user_id: userId1, first_name: 'Guntur', last_name: 'Saputro',
      phone_number: '0811255501', address: 'Jl. Kebon Sirih No. 1',
      pin, balance: 370000,
    },
    {
      user_id: userId2, first_name: 'Tom', last_name: 'Araya',
      phone_number: '0822334455', address: 'Jl. Diponegoro No. 215',
      pin, balance: 30000,
    },
  ]);

  await Transaction.create([
    {
      transaction_id: topUpId, user_id: userId1,
      transaction_type: 'CREDIT', type: 'TOP_UP', status: 'SUCCESS',
      amount: 500000, remarks: '', balance_before: 0, balance_after: 500000,
    },
    {
      transaction_id: paymentId, user_id: userId1,
      transaction_type: 'DEBIT', type: 'PAYMENT', status: 'SUCCESS',
      amount: 100000, remarks: 'Pulsa Telkomsel 100k',
      balance_before: 500000, balance_after: 400000,
    },
    {
      transaction_id: transferId, user_id: userId1,
      transaction_type: 'DEBIT', type: 'TRANSFER_DEBIT', status: 'SUCCESS',
      amount: 30000, remarks: 'Hadiah Ultah',
      balance_before: 400000, balance_after: 370000,
      target_user_id: userId2,
    },
    {
      transaction_id: uuidv4(), user_id: userId2,
      transaction_type: 'CREDIT', type: 'TRANSFER_CREDIT', status: 'SUCCESS',
      amount: 30000, remarks: 'Hadiah Ultah',
      balance_before: 0, balance_after: 30000,
      related_transaction_id: transferId, target_user_id: userId1,
    },
  ]);

  console.log('Seed complete!');
  console.log('Users seeded:');
  console.log('  Phone: 0811255501  PIN: 123456  Balance: 370000');
  console.log('  Phone: 0822334455  PIN: 123456  Balance: 30000');
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
