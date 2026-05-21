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

const User         = require('../src/models/user.model');
const Transaction  = require('../src/models/transaction.model');
const walletService = require('../src/services/wallet.service');

const mockUser = { user_id: 'user-1', balance: 500000 };

describe('Wallet Service', () => {
  describe('topUp()', () => {
    it('should add balance and return top_up result', async () => {
      User.findOneAndUpdate = jest.fn().mockResolvedValue(true);
      Transaction.create = jest.fn().mockResolvedValue([{
        transaction_id: 'tx-1',
        created_date: new Date(),
      }]);

      const result = await walletService.topUp(mockUser, 100000);

      expect(result.top_up_id).toBe('tx-1');
      expect(result.amount_top_up).toBe(100000);
      expect(result.balance_before).toBe(500000);
      expect(result.balance_after).toBe(600000);
    });
  });

  describe('payment()', () => {
    it('should deduct balance and return payment result', async () => {
      User.findOneAndUpdate = jest.fn().mockResolvedValue(true);
      Transaction.create = jest.fn().mockResolvedValue([{
        transaction_id: 'pay-1',
        created_date: new Date(),
      }]);

      const result = await walletService.payment(mockUser, 100000, 'Pulsa');

      expect(result.payment_id).toBe('pay-1');
      expect(result.balance_before).toBe(500000);
      expect(result.balance_after).toBe(400000);
      expect(result.remarks).toBe('Pulsa');
    });

    it('should throw if balance is insufficient', async () => {
      const poorUser = { user_id: 'user-2', balance: 50 };
      await expect(
        walletService.payment(poorUser, 100000, 'Test')
      ).rejects.toThrow('Balance is not enough');
    });
  });
});
