const mongoose    = require('mongoose');
const User        = require('../models/user.model');
const Transaction = require('../models/transaction.model');

async function topUp(user, amount) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const balance_before = user.balance;
    const balance_after  = balance_before + amount;

    await User.findOneAndUpdate(
      { user_id: user.user_id },
      { $inc: { balance: amount } },
      { session }
    );

    const [tx] = await Transaction.create(
      [
        {
          user_id: user.user_id,
          transaction_type: 'CREDIT',
          type: 'TOP_UP',
          status: 'SUCCESS',
          amount,
          remarks: '',
          balance_before,
          balance_after,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return {
      top_up_id: tx.transaction_id,
      amount_top_up: amount,
      balance_before,
      balance_after,
      created_date: tx.created_date,
    };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

async function payment(user, amount, remarks = '') {
  if (user.balance < amount) {
    const err = new Error('Balance is not enough');
    err.status = 400;
    throw err;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const balance_before = user.balance;
    const balance_after  = balance_before - amount;

    await User.findOneAndUpdate(
      { user_id: user.user_id },
      { $inc: { balance: -amount } },
      { session }
    );

    const [tx] = await Transaction.create(
      [
        {
          user_id: user.user_id,
          transaction_type: 'DEBIT',
          type: 'PAYMENT',
          status: 'SUCCESS',
          amount,
          remarks,
          balance_before,
          balance_after,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return {
      payment_id: tx.transaction_id,
      amount,
      remarks,
      balance_before,
      balance_after,
      created_date: tx.created_date,
    };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

module.exports = { topUp, payment };
