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

const TEST_PHONE_OTPS = {
  '9167767684': '2308',
  '9004743487': '1234',
  '9321987654': '5678',
  '8080808080': '2468',
  '9765432109': '1357',
  '8596321470': '7890',
  '9223589450': '1234',
};

const normalizePhoneNumber = (phoneNumber = '') => {
  const digitsOnly = (phoneNumber || '').toString().replace(/\D/g, '');
  if (digitsOnly.length > 10) {
    return digitsOnly.slice(-10);
  }
  return digitsOnly;
};

// Helper function to generate a simple token
const generateToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Send OTP via WhatsApp
router.post('/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
    
    if (!phoneNumber || !normalizedPhoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Clean up expired OTPs
    whatsappService.cleanupExpiredOTPs();

    const testOtp = TEST_PHONE_OTPS[normalizedPhoneNumber];
    if (testOtp) {
      whatsappService.storeOTP(normalizedPhoneNumber, testOtp);
      console.log(`📱 WhatsApp OTP for testing (${phoneNumber}): ${testOtp}`);
      return res.json({ 
        success: true, 
        message: 'OTP sent successfully via WhatsApp',
        testMode: true,
        otp: testOtp // Only for testing - remove in production
      });
    }

    // Generate OTP
    const otp = whatsappService.generateOTP();
    
    // Store OTP temporarily
    whatsappService.storeOTP(normalizedPhoneNumber, otp);
    
    // Send OTP via WhatsApp
    try {
      const result = await whatsappService.sendOTP(phoneNumber, otp);
      
      // Create or get user
      let user = await getUserByPhone(phoneNumber);
      if (!user && normalizedPhoneNumber !== phoneNumber) {
        user = await getUserByPhone(normalizedPhoneNumber);
      }
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
      if (!user && normalizedPhoneNumber !== phoneNumber) {
        user = await getUserByPhone(normalizedPhoneNumber);
      }
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
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
    const inputOtp = typeof otp === 'string' ? otp.trim() : String(otp ?? '').trim();
    
    console.log('OTP Verification Request:', {
      phoneNumber,
      normalizedPhoneNumber,
      inputOtp,
      testPhones: Object.keys(TEST_PHONE_OTPS)
    });
    
    if (!phoneNumber || !normalizedPhoneNumber || !inputOtp) {
      return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    // Check both normalized and original phone number for test OTP
    const testOtp = TEST_PHONE_OTPS[normalizedPhoneNumber] || TEST_PHONE_OTPS[phoneNumber];
    console.log('Test OTP lookup:', { 
      phoneNumber, 
      normalizedPhoneNumber, 
      testOtp, 
      inputOtp, 
      match: testOtp === inputOtp,
      testPhones: Object.keys(TEST_PHONE_OTPS)
    });
    
    if (testOtp && inputOtp === testOtp) {
      // First, try to get existing user or create one
      let user = await getUserByPhone(phoneNumber);
      if (!user && normalizedPhoneNumber !== phoneNumber) {
        user = await getUserByPhone(normalizedPhoneNumber);
      }
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
    let isValidOTP = whatsappService.verifyOTP(normalizedPhoneNumber, inputOtp);
    if (!isValidOTP && normalizedPhoneNumber !== phoneNumber) {
      isValidOTP = whatsappService.verifyOTP(phoneNumber, inputOtp);
    }
    
    if (isValidOTP) {
      // Get or create user
      let user = await getUserByPhone(phoneNumber);
      if (!user && normalizedPhoneNumber !== phoneNumber) {
        user = await getUserByPhone(normalizedPhoneNumber);
      }
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
