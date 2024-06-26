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
  async finishTransaction(req, res) {
    const { token, orderId } = req.body;
    try {
      let parameter = {
        token: token,
        order_id: orderId,
      };
      let finish = await snap.finishTransaction(parameter);
      res.send(finish);
    } catch (error) {
      console.log(error);
    }
    res.statusCode(400).send('Error finishing transaction');
  }

  async unfinishTransaction(req, res) {
    const { token, orderId } = req.body;
    try {
      let parameter = {
        token: token,
        order_id: orderId,
      };
      let finish = await snap.unfinishTransaction(parameter);
      res.send(finish);
    } catch (error) {
      console.log(error);
    }
    res.statusCode(400).send('Error finishing transaction');
  }

  async errorTransaction(req, res) {
    const { token, orderId } = req.body;
    try {
      let parameter = {
        token: token,
        order_id: orderId,
      };
      let finish = await snap.errorTransaction(parameter);
      res.send(finish);
    } catch (error) {
      console.log(error);
    }
    res.statusCode(400).send('Error finishing transaction');
  }
}

module.exports = new TransactionController();
