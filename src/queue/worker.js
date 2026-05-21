require('dotenv').config();
const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tes2')
  .then(() => console.log('Worker: MongoDB connected'))
  .catch((err) => {
    console.error('Worker: MongoDB error', err.message);
    process.exit(1);
  });

const { transferQueue } = require('./transfer.queue');
const { executeTransfer } = require('../services/transfer.service');
const Transaction = require('../models/transaction.model');

const CONCURRENCY = 5;

transferQueue.process(CONCURRENCY, async (job) => {
  const { senderUserId, targetUserId, amount, remarks, transferId } = job.data;
  console.log(`Worker: Processing transfer job ${job.id} | transferId: ${transferId}`);

  try {
    await executeTransfer(senderUserId, targetUserId, amount, remarks, transferId);
    console.log(`Worker: Transfer ${transferId} SUCCESS`);
  } catch (err) {
    await Transaction.findOneAndUpdate(
      { transaction_id: transferId },
      { $set: { status: 'FAILED' } }
    );
    console.error(`Worker: Transfer ${transferId} FAILED:`, err.message);
    throw err;
  }
});

transferQueue.on('completed', (job) =>
  console.log(`Worker: Job ${job.id} completed`)
);
transferQueue.on('failed', (job, err) =>
  console.error(`Worker: Job ${job.id} failed (attempt ${job.attemptsMade}): ${err.message}`)
);
transferQueue.on('stalled', (job) =>
  console.warn(`Worker: Job ${job.id} stalled`)
);

console.log(`Worker: Transfer started (concurrency: ${CONCURRENCY})`);
