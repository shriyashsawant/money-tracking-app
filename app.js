const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const Transaction = require('./models/transaction');
const methodOverride = require('method-override');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(`mongodb://localhost:27017/moneyTrackerDB`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(methodOverride('_method'));

// Set the view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Define a helper function to calculate the total amount based on transaction type
const calculateTotal = (type, transactions) => {
  return transactions
    .filter(transaction => transaction.type === type)
    .reduce((total, transaction) => total + transaction.amount, 0)
    .toFixed(2); // Keep two decimal places for currency
};

// Define a helper function to calculate the remaining balance
const calculateRemainingBalance = transactions => {
  const totalIncome = calculateTotal('income', transactions);
  const totalExpense = calculateTotal('expense', transactions);
  return (totalIncome - totalExpense).toFixed(2);
};

// Handle GET request for the main page
app.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.render('index', { transactions, calculateTotal, calculateRemainingBalance });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Handle POST request for adding transactions
app.post('/transactions', async (req, res) => {
  try {
    const { description, amount, type } = req.body;
    const newTransaction = new Transaction({ description, amount, type });
    await newTransaction.save();
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Handle DELETE request for deleting transactions
app.delete('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Transaction.findByIdAndDelete(id);
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
