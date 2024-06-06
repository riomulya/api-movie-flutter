const admin = require('firebase-admin');
const serviceAccount = require('../FirebaseService.json');
require('dotenv').config();

// Pastikan admin telah diinisialisasi dengan benar
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE,
});

const verifyToken = async (req, res, next) => {
  const token = req.cookies.authToken; // Ambil token dari cookie
  console.log('Token:', token);

  if (!token) {
    console.error('No token provided');
    return res.status(401).send('Unauthorized');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('Decoded Token:', decodedToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).send('Unauthorized');
  }
};

module.exports = verifyToken;
