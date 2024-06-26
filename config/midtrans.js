const midtransClient = require('midtrans-client');

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: 'SB-Mid-server-M6QKe5NN66DRHfA6PCLZPHia',
});

const parameters = {
  transaction_details: {
    order_id: 'YOUR-ORDERID-123456',
    gross_amount: 10000,
  },
};

snap.createTransaction(parameter).then((transaction) => {
  const transactionToken = transaction.token;
  console.log('transactionToken:', transactionToken);
});
