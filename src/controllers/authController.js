const { OAuth2Client } = require('google-auth-library');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.handleGoogleLogin = async (req, res) => {
  try {
    const { id_token } = req.body;
    if (!id_token) {
      return res.status(400).json({ success: false, message: 'ID token is required' });
    }
    // Verify Google ID token
    const ticket = await client.verifyIdToken({ idToken: id_token, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();  // { sub, email, name, picture, ... }
    const { sub, email, name } = payload;

    // Upsert user record
    let user = await User.getByEmail(email);
    user = await User.createOrUpdateFromGoogle({ name, email, sub });

    // Issue our own JWT
    const token = jwt.sign({ uid: sub, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ success: true, user, token });
  } catch (error) {
    console.error('Error in handleGoogleLogin:', error);
    res.status(401).json({ success: false, message: 'Authentication failed', error: error.message });
  }
};
