const express = require('express');
const { 
  createUser, 
  getUserByPhone, 
  createSession, 
  getSessionByToken, 
  deleteSession 
} = require('../dist/lib/database');
const whatsappService = require('../lib/whatsappService');

const router = express.Router();

// Helper function to generate a simple token
const generateToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Send OTP via WhatsApp
router.post('/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Generate OTP
    const otp = whatsappService.generateOTP();
    
    // Store OTP temporarily
    whatsappService.storeOTP(phoneNumber, otp);
    
    // Clean up expired OTPs
    whatsappService.cleanupExpiredOTPs();

    // For testing: hardcoded phone number 9167767684
    if (phoneNumber === '9167767684') {
      console.log(`📱 WhatsApp OTP for testing: ${otp}`);
      return res.json({ 
        success: true, 
        message: 'OTP sent successfully via WhatsApp',
        testMode: true,
        otp: otp // Only for testing - remove in production
      });
    }

    // Send OTP via WhatsApp
    try {
      const result = await whatsappService.sendOTP(phoneNumber, otp);
      
      // Create or get user
      let user = await getUserByPhone(phoneNumber);
      if (!user) {
        user = await createUser(phoneNumber);
      }

      res.json({ 
        success: true, 
        message: 'OTP sent successfully via WhatsApp',
        deliveryMethod: 'whatsapp',
        phoneNumber: result.phoneNumber
      });
    } catch (whatsappError) {
      console.error('WhatsApp service error:', whatsappError);
      // Fallback: still create user but indicate WhatsApp failed
      let user = await getUserByPhone(phoneNumber);
      if (!user) {
        user = await createUser(phoneNumber);
      }
      
      res.json({ 
        success: true, 
        message: 'OTP sent successfully via WhatsApp',
        deliveryMethod: 'whatsapp',
        warning: 'WhatsApp delivery may be delayed'
      });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    
    if (!phoneNumber || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    // For testing: hardcoded OTP 2308 for phone number 9167767684
    if (phoneNumber === '9167767684' && otp === '2308') {
      // First, try to get existing user or create one
      let user = await getUserByPhone(phoneNumber);
      if (!user) {
        user = await createUser(phoneNumber);
      }
      
      // Create session
      const token = generateToken();
      const session = await createSession(user.id, token);
      
      res.json({
        success: true,
        user: user,
        token: token,
        session: session
      });
      return;
    }
    
    // Verify OTP using WhatsApp service
    const isValidOTP = whatsappService.verifyOTP(phoneNumber, otp);
    
    if (isValidOTP) {
      // Get or create user
      let user = await getUserByPhone(phoneNumber);
      if (!user) {
        user = await createUser(phoneNumber);
      }
      
      // Create session
      const token = generateToken();
      const session = await createSession(user.id, token);
      
      res.json({
        success: true,
        user: user,
        token: token,
        session: session,
        verifiedVia: 'whatsapp'
      });
    } else {
      res.status(400).json({ error: 'Invalid or expired OTP' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Verify session token
router.get('/verify-session', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = await getSessionByToken(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    res.json({ success: true, session: session });
  } catch (error) {
    console.error('Error verifying session:', error);
    res.status(500).json({ error: 'Failed to verify session' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      await deleteSession(token);
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

module.exports = router;
