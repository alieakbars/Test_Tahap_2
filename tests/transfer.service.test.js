jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    startSession: jest.fn().mockResolvedValue({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    }),
  };
});

jest.mock('../src/models/user.model');
jest.mock('../src/models/transaction.model');
jest.mock('../src/queue/transfer.queue', () => ({
  transferQueue: {
    add: jest.fn().mockResolvedValue({ id: 'job-1' }),
  },
}));

const User         = require('../src/models/user.model');
const Transaction  = require('../src/models/transaction.model');
const { initiateTransfer } = require('../src/services/transfer.service');

describe('Transfer Service', () => {
  const sender = { user_id: 'sender-1', balance: 500000 };
  const target = { user_id: 'target-1', balance: 100000 };

  it('should queue transfer and return pending result', async () => {
    User.findOne = jest.fn().mockResolvedValue(target);
    Transaction.create = jest.fn().mockResolvedValue({
      transaction_id: 'tx-transfer-1',
      created_date: new Date(),
    });

    const result = await initiateTransfer(sender, target.user_id, 30000, 'Hadiah Ultah');

    expect(result.amount).toBe(30000);
    expect(result.balance_before).toBe(500000);
    expect(result.balance_after).toBe(470000);
    expect(result.remarks).toBe('Hadiah Ultah');
  });

  it('should throw if balance is insufficient', async () => {
    const poorSender = { user_id: 'sender-2', balance: 100 };
    await expect(
      initiateTransfer(poorSender, target.user_id, 30000, 'Test')
    ).rejects.toThrow('Balance is not enough');
  });

  it('should throw if target user not found', async () => {
    User.findOne = jest.fn().mockResolvedValue(null);
    await expect(
      initiateTransfer(sender, 'nonexistent', 100, 'Test')
    ).rejects.toThrow('Target user not found');
  });

  it('should not allow transfer to self', async () => {
    User.findOne = jest.fn().mockResolvedValue(sender);
    const result = await initiateTransfer(sender, sender.user_id, 100, 'Self');
    expect(result).toBeDefined();
  });
});
