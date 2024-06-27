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
}

module.exports = new TransactionController();
