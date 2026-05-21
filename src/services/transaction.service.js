const Transaction = require('../models/transaction.model');

async function getTransactions(userId) {
  const transactions = await Transaction.find({ user_id: userId })
    .sort({ created_date: -1 })
    .lean();

  return transactions.map((tx) => {
    const base = {
      status: tx.status,
      user_id: tx.user_id,
      transaction_type: tx.transaction_type,
      amount: tx.amount,
      remarks: tx.remarks,
      balance_before: tx.balance_before,
      balance_after: tx.balance_after,
      created_date: tx.created_date,
    };

    switch (tx.type) {
      case 'TOP_UP':
        return { top_up_id: tx.transaction_id, ...base };
      case 'PAYMENT':
        return { payment_id: tx.transaction_id, ...base };
      case 'TRANSFER_DEBIT':
      case 'TRANSFER_CREDIT':
        return { transfer_id: tx.transaction_id, ...base };
      default:
        return { transaction_id: tx.transaction_id, ...base };
    }
  });
}

module.exports = { getTransactions };
