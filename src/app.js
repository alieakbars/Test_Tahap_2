require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth.routes');
const walletRoutes = require('./routes/wallet.routes');
const profileRoutes = require('./routes/profile.routes');
const transactionRoutes = require('./routes/transaction.routes');

const { errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', authRoutes);
app.use('/', walletRoutes);
app.use('/', profileRoutes);
app.use('/', transactionRoutes);

app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

app.use(errorHandler);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tes2';

if (require.main === module) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log('MongoDB connected');
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err.message);
      process.exit(1);
    });
}

module.exports = app;
