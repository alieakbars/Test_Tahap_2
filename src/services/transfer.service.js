const mongoose    = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const User        = require('../models/user.model');
const Transaction = require('../models/transaction.model');

async function executeTransfer(senderUserId, targetUserId, amount, remarks, transferId) {

  const existing = await Transaction.findOne({ transaction_id: transferId });
  if (existing && existing.status === 'SUCCESS') {
    console.log(`Transfer Already processed: ${transferId}, skipping.`);
    return existing;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sender = await User.findOne({ user_id: senderUserId }).session(session);
    if (!sender) throw new Error('Sender not found');
    if (sender.balance < amount) {
      const err = new Error('Balance is not enough');
      err.status = 400;
      throw err;
    }

    const receiver = await User.findOne({ user_id: targetUserId }).session(session);
    if (!receiver) throw new Error('Target user not found');

    const senderBefore   = sender.balance;
    const senderAfter    = senderBefore - amount;
    const receiverBefore = receiver.balance;
    const receiverAfter  = receiverBefore + amount;

    await User.findOneAndUpdate(
      { user_id: senderUserId },
      { $inc: { balance: -amount } },
      { session }
    );

    await User.findOneAndUpdate(
      { user_id: targetUserId },
      { $inc: { balance: amount } },
      { session }
    );

    const sharedId = transferId || uuidv4();

    let finalSenderTx = await Transaction.findOneAndUpdate(
      { transaction_id: sharedId },
      {
        $set: {
          status: 'SUCCESS',
          balance_before: senderBefore,
          balance_after: senderAfter,
        },
      },
      { session, new: true }
    );

    if (!finalSenderTx) {
      const [created] = await Transaction.create(
        [{
          transaction_id: sharedId,
          user_id: senderUserId,
          transaction_type: 'DEBIT',
          type: 'TRANSFER_DEBIT',
          status: 'SUCCESS',
          amount,
          remarks,
          balance_before: senderBefore,
          balance_after: senderAfter,
          target_user_id: targetUserId,
        }],
        { session }
      );
      finalSenderTx = created;
    }

    const existingCredit = await Transaction.findOne({
      related_transaction_id: sharedId,
      type: 'TRANSFER_CREDIT',
    }).session(session);

    if (!existingCredit) {
      await Transaction.create(
        [{
          user_id: targetUserId,
          transaction_type: 'CREDIT',
          type: 'TRANSFER_CREDIT',
          status: 'SUCCESS',
          amount,
          remarks,
          balance_before: receiverBefore,
          balance_after: receiverAfter,
          related_transaction_id: sharedId,
          target_user_id: senderUserId,
        }],
        { session }
      );
    }

    await session.commitTransaction();
    return finalSenderTx;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

async function initiateTransfer(sender, targetUserId, amount, remarks = '') {
  if (sender.balance < amount) {
    const err = new Error('Balance is not enough');
    err.status = 400;
    throw err;
  }

  const target = await User.findOne({ user_id: targetUserId });
  if (!target) {
    const err = new Error('Target user not found');
    err.status = 404;
    throw err;
  }

  const transferId = uuidv4();

  try {
    const { transferQueue } = require('../queue/transfer.queue');

    const pendingTx = await Transaction.create({
      transaction_id: transferId,
      user_id: sender.user_id,
      transaction_type: 'DEBIT',
      type: 'TRANSFER_DEBIT',
      status: 'PENDING',
      amount,
      remarks,
      balance_before: sender.balance,
      balance_after: sender.balance - amount,
      target_user_id: targetUserId,
    });

    await transferQueue.add(
      { senderUserId: sender.user_id, targetUserId, amount, remarks, transferId },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: false,
        removeOnFail: false,
      }
    );

    return {
      transfer_id: transferId,
      amount,
      remarks,
      balance_before: sender.balance,
      balance_after: sender.balance - amount,
      created_date: pendingTx.created_date,
    };
  } catch (queueErr) {
    console.warn('[Transfer] Queue unavailable, executing synchronously:', queueErr.message);
    const tx = await executeTransfer(sender.user_id, targetUserId, amount, remarks, transferId);
    return {
      transfer_id: tx.transaction_id,
      amount,
      remarks,
      balance_before: tx.balance_before,
      balance_after: tx.balance_after,
      created_date: tx.created_date,
    };
  }
}

module.exports = { initiateTransfer, executeTransfer };