require('dotenv').config();

const midtransClient = require('midtrans-client');

let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

class TransactionController {
  async createTransaction(req, res) {
    const { movieName, grossAmount, quantity } = req.body;
    let token;

    let parameter = {
      item_details: {
        name: movieName,
        grossAmount: grossAmount,
        quantity: quantity,
      },
      transaction_details: {
        order_id: Math.random() * 10000,
        gross_amount: grossAmount,
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
}

module.exports = new TransactionController();
