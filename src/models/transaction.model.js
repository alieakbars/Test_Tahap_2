const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');


const transactionSchema = new mongoose.Schema(
  {
    transaction_id: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    transaction_type: {
      type: String,
      enum: ['CREDIT', 'DEBIT'],
      required: true,
    },
    type: {
      type: String,
      enum: ['TOP_UP', 'PAYMENT', 'TRANSFER_DEBIT', 'TRANSFER_CREDIT'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
      default: 'PENDING',
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be positive'],
    },
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
    balance_before: {
      type: Number,
      required: true,
    },
    balance_after: {
      type: Number,
      required: true,
    },
    related_transaction_id: {
      type: String,
      default: null,
    },
    target_user_id: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_date', updatedAt: false },
    versionKey: false,
  }
);

transactionSchema.methods.toResponseObject = function () {
  const obj = this.toObject();
  const base = {
    status: obj.status,
    user_id: obj.user_id,
    transaction_type: obj.transaction_type,
    amount: obj.amount,
    remarks: obj.remarks,
    balance_before: obj.balance_before,
    balance_after: obj.balance_after,
    created_date: obj.created_date,
  };

  switch (obj.type) {
    case 'TOP_UP':
      return { top_up_id: obj.transaction_id, ...base };
    case 'PAYMENT':
      return { payment_id: obj.transaction_id, ...base };
    case 'TRANSFER_DEBIT':
    case 'TRANSFER_CREDIT':
      return { transfer_id: obj.transaction_id, ...base };
    default:
      return { transaction_id: obj.transaction_id, ...base };
  }
};

module.exports = mongoose.model('Transaction', transactionSchema);
