const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    first_name: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    last_name: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    phone_number: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    pin: {
      type: String,
      required: [true, 'PIN is required'],
      select: false,
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative'],
    },
  },
  {
    timestamps: { createdAt: 'created_date', updatedAt: 'updated_date' },
    versionKey: false,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('pin')) return next();
  const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
  this.pin = await bcrypt.hash(this.pin, rounds);
  next();
});

userSchema.methods.comparePin = function (plainPin) {
  return bcrypt.compare(plainPin, this.pin);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj._id;
  delete obj.pin;
  delete obj.balance;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
