require('dotenv').config();
const path = require('path');
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
  async finishTransaction(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'finish.html'));
  }

  async unfinishTransaction(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'unfinish.html'));
  }

  async errorTransaction(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'error.html'));
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
}

module.exports = new TransactionController();
