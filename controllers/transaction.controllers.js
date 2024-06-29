const {
  getDatabase,
  ref,
  push,
  set,
  get,
  child,
  update,
  remove,
} = require('firebase/database');

const db = getDatabase();
require('dotenv').config();
const midtransClient = require('midtrans-client');

let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

class TransactionController {
  async createTransaction(req, res) {
    const { orderId, movieName, price, quantity, email } = req.body;
    let token;

    let parameter = {
      item_details: {
        name: movieName,
        price: price,
        quantity: quantity,
      },
      transaction_details: {
        order_id: orderId,
        gross_amount: price * quantity,
      },
      customer_details: {
        email: email,
      },
    };
    try {
      token = await snap.createTransaction(parameter);
    } catch (error) {
      console.log(error);
    }
    if (!token) {
      res.statusCode(400).send('Error creating transaction');
    }
    console.log(token);
    res.send(token);
  }
  finishTransaction(req, res) {
    const { transaction_status } = req.params;
    if (transaction_status === 'pending') {
      res.send('<h1>Transaksi Pending</h1>');
    }
    res.send('<h1>Transaksi Berhasil</h1>');
  }

  unfinishTransaction(req, res) {
    res.send('<h1>Transaksi Belum Selesai</h1>');
  }

  errorTransaction(req, res) {
    res.send('<h1>Transaksi Error</h1>');
  }
  async getTransactionStatus(req, res) {
    const { orderId } = req.body;
    const url = `https://api.sandbox.midtrans.com/v2/${orderId}/status`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization:
            'Basic ' +
            Buffer.from(process.env.MIDTRANS_SERVER_KEY).toString('base64'),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching transaction status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  async insertTransaction(req, res) {
    try {
      const { email, quantity, grossAmount, seat, orderId, idMovie } = req.body;
      const newTransactionRef = await push(ref(db, 'transactions'), {
        email,
        quantity,
        grossAmount,
        seat,
        orderId,
        idMovie,
      });
      res.status(201).json({
        message: 'Transaction created successfully',
        id: newTransactionRef.key,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllTransactions(req, res) {
    const dbRef = ref(getDatabase());
    try {
      get(child(dbRef, 'transactions/')).then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
          res.status(200).json({ ...snapshot.val() });
        } else {
          res.status(404).json({ message: 'Transaction not found' });
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async getAllTransactionHistory(req, res) {
    const dbRef = ref(getDatabase());
    try {
      const snapshot = await get(child(dbRef, 'transactions/'));
      if (!snapshot.exists()) {
        return res.status(404).json({ message: 'No transactions found' });
      }

      const transactions = snapshot.val();
      const transactionHistory = await Promise.all(
        Object.keys(transactions).map(async (key) => {
          const orderId = transactions[key].orderId;
          const url = `https://api.sandbox.midtrans.com/v2/${orderId}/status`;

          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization:
                'Basic ' +
                Buffer.from(process.env.MIDTRANS_SERVER_KEY + ':').toString(
                  'base64'
                ),
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch status for order ID ${orderId}`);
          }

          const data = await response.json();
          return {
            ...transactions[key],
            status: data.transaction_status,
            transaction_time: data.transaction_time,
          };
        })
      );

      res.status(200).json(transactionHistory);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async searchTransaction(req, res) {
    const { startDate, endDate } = req.body;
    const dbRef = ref(getDatabase());
    try {
      const snapshot = await get(child(dbRef, 'transactions/'));
      if (!snapshot.exists()) {
        return res.status(404).json({ message: 'No transactions found' });
      }

      const transactions = snapshot.val();
      const transactionHistory = await Promise.all(
        Object.keys(transactions).map(async (key) => {
          const orderId = transactions[key].orderId;
          const url = `https://api.sandbox.midtrans.com/v2/${orderId}/status`;

          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization:
                'Basic ' +
                Buffer.from(process.env.MIDTRANS_SERVER_KEY + ':').toString(
                  'base64'
                ),
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch status for order ID ${orderId}`);
          }

          const data = await response.json();
          return {
            ...transactions[key],
            status: data.transaction_status,
            transaction_time: data.transaction_time,
          };
        })
      );

      // Filter transaksi berdasarkan rentang waktu
      const filteredTransactions = transactionHistory.filter((transaction) => {
        const transactionTime = new Date(transaction.transaction_time);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return transactionTime >= start && transactionTime <= end;
      });

      if (filteredTransactions.length === 0) {
        return res.status(404).json({ message: 'No transactions found' });
      }
      res.status(200).json(filteredTransactions);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = new TransactionController();
