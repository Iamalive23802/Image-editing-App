const express = require('express');
const {
  getUserById,
  updateUserLanguage,
  updateUserDetails,
} = require('../dist/lib/database');

const router = express.Router();

// Middleware to verify authentication
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { getSessionByToken } = require('../dist/lib/database');
    const session = await getSessionByToken(token);
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.userId = session.user_id;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Update user language
router.put('/language', authenticateToken, async (req, res) => {
  try {
    const { language } = req.body;
    
    if (!language) {
      return res.status(400).json({ error: 'Language is required' });
    }

    await updateUserLanguage(req.userId, language);
    
    res.json({ success: true, message: 'Language updated successfully' });
  } catch (error) {
    console.error('Error updating language:', error);
    res.status(500).json({ error: 'Failed to update language' });
  }
});

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const {
      prefix,
      first_name,
      middle_name,
      last_name,
      date_of_birth,
      email,
      address_line,
      state,
      district,
      taluka,
      role,
      instagram_url,
      facebook_url,
      twitter_url,
      avatar_url,
    } = req.body || {};

    console.log('Updating profile for user:', req.userId);
    console.log('Profile data received:', {
      first_name,
      last_name,
      date_of_birth,
      date_of_birth_type: typeof date_of_birth,
      email,
      state,
      district,
      taluka,
      role,
    });

    const user = await updateUserDetails(req.userId, {
      prefix: prefix ?? null,
      first_name: first_name ?? null,
      middle_name: middle_name ?? null,
      last_name: last_name ?? null,
      date_of_birth: date_of_birth ?? null,
      email: email ?? null,
      address_line: address_line ?? null,
      state: state ?? null,
      district: district ?? null,
      taluka: taluka ?? null,
      role: role ?? null,
      instagram_url: instagram_url ?? null,
      facebook_url: facebook_url ?? null,
      twitter_url: twitter_url ?? null,
      avatar_url: avatar_url ?? null,
    });

    console.log('Profile updated successfully:', {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      date_of_birth: user.date_of_birth,
      date_of_birth_type: typeof user.date_of_birth,
      date_of_birth_stringified: String(user.date_of_birth),
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
