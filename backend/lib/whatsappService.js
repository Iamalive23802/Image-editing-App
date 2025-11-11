const axios = require('axios');

class WhatsAppService {
  constructor() {
    // Twilio WhatsApp API configuration
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Format: whatsapp:+1234567890
    
    // Fallback to demo mode if credentials not provided
    this.demoMode = !this.accountSid || !this.authToken || !this.fromNumber;
    
    if (this.demoMode) {
      console.log('⚠️  WhatsApp service running in DEMO mode. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER for real integration.');
    }
  }

  async sendOTP(phoneNumber, otp) {
    try {
      // Format phone number (remove + if present, add country code if missing)
      let formattedPhone = phoneNumber.replace(/^\+/, '');
      if (!formattedPhone.startsWith('91') && formattedPhone.length === 10) {
        formattedPhone = '91' + formattedPhone;
      }
      
      const message = `Your verification code is: ${otp}\n\nThis code will expire in 10 minutes. Do not share this code with anyone.`;
      
      if (this.demoMode) {
        // Demo mode - just log the OTP
        console.log(`📱 WhatsApp OTP sent to +${formattedPhone}: ${otp}`);
        return {
          success: true,
          messageId: `demo_${Date.now()}`,
          phoneNumber: `+${formattedPhone}`,
          message: 'OTP sent successfully via WhatsApp (DEMO MODE)'
        };
      }
      
      // Real Twilio WhatsApp API call
      return await this.sendViaTwilio(formattedPhone, message);
    } catch (error) {
      console.error('Error sending WhatsApp OTP:', error);
      throw new Error('Failed to send WhatsApp OTP');
    }
  }

  async sendViaTwilio(phoneNumber, message) {
    try {
      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        new URLSearchParams({
          From: this.fromNumber, // Format: whatsapp:+1234567890
          To: `whatsapp:+${phoneNumber}`,
          Body: message
        }),
        {
          auth: {
            username: this.accountSid,
            password: this.authToken
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      return {
        success: true,
        messageId: response.data.sid,
        phoneNumber: `+${phoneNumber}`,
        message: 'OTP sent successfully via WhatsApp',
        status: response.data.status
      };
    } catch (error) {
      console.error('Twilio WhatsApp API error:', error.response?.data || error.message);
      throw new Error(`Failed to send WhatsApp message: ${error.response?.data?.message || error.message}`);
    }
  }

  // Generate a 4-digit OTP
  generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Store OTP temporarily (in production, use Redis or database)
  storeOTP(phoneNumber, otp) {
    if (otp === undefined || otp === null) {
      return;
    }
    const expiry = Date.now() + (10 * 60 * 1000); // 10 minutes
    if (!this.otpStore) {
      this.otpStore = new Map();
    }
    const otpValue = typeof otp === 'string' ? otp.trim() : String(otp).trim();
    if (!otpValue) {
      return;
    }
    this.otpStore.set(phoneNumber, { otp: otpValue, expiry });
  }

  // Verify OTP
  verifyOTP(phoneNumber, inputOTP) {
    if (!this.otpStore) {
      return false;
    }
    
    if (inputOTP === undefined || inputOTP === null) {
      return false;
    }
    
    const providedOtp = typeof inputOTP === 'string' ? inputOTP.trim() : String(inputOTP).trim();
    if (!providedOtp) {
      return false;
    }
    
    const stored = this.otpStore.get(phoneNumber);
    if (!stored) {
      return false;
    }
    
    // Check if OTP has expired
    if (Date.now() > stored.expiry) {
      this.otpStore.delete(phoneNumber);
      return false;
    }
    
    // Check if OTP matches
    if (stored.otp === providedOtp) {
      this.otpStore.delete(phoneNumber);
      return true;
    }
    
    return false;
  }

  // Clean up expired OTPs
  cleanupExpiredOTPs() {
    if (!this.otpStore) return;
    
    const now = Date.now();
    for (const [phoneNumber, data] of this.otpStore.entries()) {
      if (now > data.expiry) {
        this.otpStore.delete(phoneNumber);
      }
    }
  }
}

module.exports = new WhatsAppService();
