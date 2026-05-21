jest.mock('../src/models/user.model');
jest.mock('../src/utils/jwt.utils');

const User         = require('../src/models/user.model');
const jwtUtils     = require('../src/utils/jwt.utils');
const authService  = require('../src/services/auth.service');

describe('Auth Service', () => {
  describe('register()', () => {
    it('should return user data on successful registration', async () => {
      const fakeUser = {
        user_id: 'uuid-123',
        first_name: 'Guntur',
        last_name: 'Saputro',
        phone_number: '0811255501',
        address: 'Jl. Kebon Sirih No. 1',
        created_date: new Date('2021-04-01'),
        save: jest.fn().mockResolvedValue(true),
      };

      User.mockImplementation(() => fakeUser);

      const result = await authService.register({
        first_name: 'Guntur',
        last_name: 'Saputro',
        phone_number: '0811255501',
        address: 'Jl. Kebon Sirih No. 1',
        pin: '123456',
      });

      expect(result.user_id).toBe('uuid-123');
      expect(result.phone_number).toBe('0811255501');
      expect(result).not.toHaveProperty('pin');
      expect(fakeUser.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('login()', () => {
    it('should return tokens on valid credentials', async () => {
      const mockUser = {
        user_id: 'uuid-123',
        phone_number: '0811255501',
        comparePin: jest.fn().mockResolvedValue(true),
      };

      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      jwtUtils.generateTokens.mockReturnValue({
        access_token: 'fake.access.token',
        refresh_token: 'fake.refresh.token',
      });

      const result = await authService.login({
        phone_number: '0811255501',
        pin: '123456',
      });

      expect(result.access_token).toBe('fake.access.token');
      expect(result.refresh_token).toBe('fake.refresh.token');
    });

    it('should throw on wrong PIN', async () => {
      const mockUser = {
        comparePin: jest.fn().mockResolvedValue(false),
      };
      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(
        authService.login({ phone_number: '0811255501', pin: 'wrong' })
      ).rejects.toThrow("Phone number and pin doesn't match.");
    });

    it('should throw when user not found', async () => {
      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(
        authService.login({ phone_number: '0000000000', pin: '123456' })
      ).rejects.toThrow("Phone number and pin doesn't match.");
    });
  });
});
