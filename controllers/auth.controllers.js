const {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} = require('../config/firebase');

class FirebaseAuthController {
  registerUser(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({
        email: 'Email is required',
        password: 'Password is required',
      });
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        sendEmailVerification(auth.currentUser)
          .then(() => {
            res.status(201).json({
              message: 'Verification email sent! User created successfully!',
            });
          })
          .catch((error) => {
            console.error(error);
            res.status(500).json({ error: 'Error sending email verification' });
          });
      })
      .catch((error) => {
        const errorMessage =
          error.message || 'An error occurred while registering user';
        res.status(500).json({ error: errorMessage });
      });
  }

  loginUser(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({
        email: 'Email is required',
        password: 'Password is required',
      });
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const idToken = userCredential._tokenResponse.idToken;
        const email = userCredential.user.email;
        if (idToken && email) {
          res.cookie('authToken', idToken, {
            httpOnly: true,
          });
          res.cookie('email', email, {
            httpOnly: true,
          });
          res
            .status(200)
            .json({ message: 'User logged in successfully', userCredential });
          // console.log(req.cookies.authToken);
        } else {
          res.status(500).json({ error: 'Internal Server Error' });
        }
      })
      .catch((error) => {
        console.error(error);
        const errorMessage =
          error.message || 'An error occurred while logging in';
        res.status(500).json({ error: errorMessage });
      });
  }

  logoutUser(req, res) {
    signOut(auth)
      .then(() => {
        res.clearCookie('authToken');
        res.status(200).json({ message: 'User logged out successfully' });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      });
  }

  resetPassword(req, res) {
    const { email } = req.body;
    if (!email) {
      return res.status(422).json({
        email: 'Email is required',
      });
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        res
          .status(200)
          .json({ message: 'Password reset email sent successfully!' });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      });
  }
}

module.exports = new FirebaseAuthController();
// module.exports = { SignUp, Login, authenticate };
