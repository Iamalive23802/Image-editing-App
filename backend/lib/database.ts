// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Only import pg in Node.js environment
let Pool: any = null;
let pool: any = null;

if (!isBrowser) {
  try {
    const pg = require('pg');
    Pool = pg.Pool;
    
    // Database configuration
    const dbConfig = {
      user: process.env.DB_USER || 'vedantpatil',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'image_editor_app',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT || '5432'),
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };

    // Create connection pool
    pool = new Pool(dbConfig);
  } catch (error) {
    console.warn('PostgreSQL not available:', error);
  }
}

// Database connection helper
export async function connectToDatabase() {
  if (isBrowser || !pool) {
    throw new Error('Database not available in browser environment');
  }
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    return client;
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
}

// User authentication functions
export interface User {
  id: string;
  phone_number: string;
  created_at: string;
  updated_at: string;
  language?: string;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

// Create user
export async function createUser(phoneNumber: string): Promise<User> {
  if (isBrowser || !pool) {
    // Return mock user for browser environment
    return {
      id: 'mock-user-' + Date.now(),
      phone_number: phoneNumber,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      language: undefined
    };
  }
  
  const client = await connectToDatabase();
  try {
    const query = `
      INSERT INTO users (phone_number, created_at, updated_at)
      VALUES ($1, NOW(), NOW())
      RETURNING *
    `;
    const result = await client.query(query, [phoneNumber]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Get user by phone number
export async function getUserByPhone(phoneNumber: string): Promise<User | null> {
  if (isBrowser || !pool) {
    // Check localStorage for mock user
    const mockUser = localStorage.getItem(`mock_user_${phoneNumber}`);
    return mockUser ? JSON.parse(mockUser) : null;
  }
  
  const client = await connectToDatabase();
  try {
    const query = 'SELECT * FROM users WHERE phone_number = $1';
    const result = await client.query(query, [phoneNumber]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  if (isBrowser || !pool) {
    // Check localStorage for mock user by ID
    const mockUser = localStorage.getItem(`mock_user_id_${id}`);
    return mockUser ? JSON.parse(mockUser) : null;
  }
  
  const client = await connectToDatabase();
  try {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await client.query(query, [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Create session
export async function createSession(userId: string, token: string): Promise<Session> {
  if (isBrowser || !pool) {
    // Return mock session for browser environment
    const mockSession = {
      id: 'mock-session-' + Date.now(),
      user_id: userId,
      token: token,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    };
    localStorage.setItem(`mock_session_${token}`, JSON.stringify(mockSession));
    return mockSession;
  }
  
  const client = await connectToDatabase();
  try {
    const query = `
      INSERT INTO sessions (user_id, token, expires_at, created_at)
      VALUES ($1, $2, NOW() + INTERVAL '30 days', NOW())
      RETURNING *
    `;
    const result = await client.query(query, [userId, token]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Get session by token
export async function getSessionByToken(token: string): Promise<Session | null> {
  if (isBrowser || !pool) {
    // Check localStorage for mock session
    const mockSession = localStorage.getItem(`mock_session_${token}`);
    if (mockSession) {
      const session = JSON.parse(mockSession);
      // Check if session is not expired
      if (new Date(session.expires_at) > new Date()) {
        return session;
      }
    }
    return null;
  }
  
  const client = await connectToDatabase();
  try {
    const query = 'SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()';
    const result = await client.query(query, [token]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Delete session
export async function deleteSession(token: string): Promise<void> {
  if (isBrowser || !pool) {
    // Remove mock session from localStorage
    localStorage.removeItem(`mock_session_${token}`);
    return;
  }
  
  const client = await connectToDatabase();
  try {
    const query = 'DELETE FROM sessions WHERE token = $1';
    await client.query(query, [token]);
  } finally {
    client.release();
  }
}

// Update user language
export async function updateUserLanguage(userId: string, language: string): Promise<void> {
  if (isBrowser || !pool) {
    // Update mock user language in localStorage
    const mockUser = localStorage.getItem(`mock_user_id_${userId}`);
    if (mockUser) {
      const user = JSON.parse(mockUser);
      user.language = language;
      user.updated_at = new Date().toISOString();
      localStorage.setItem(`mock_user_id_${userId}`, JSON.stringify(user));
    }
    return;
  }
  
  const client = await connectToDatabase();
  try {
    const query = 'UPDATE users SET language = $1, updated_at = NOW() WHERE id = $2';
    await client.query(query, [language, userId]);
  } finally {
    client.release();
  }
}

// Initialize database tables
export async function initializeDatabase(): Promise<void> {
  if (isBrowser || !pool) {
    console.log('Database initialization skipped in browser environment');
    return;
  }
  
  const client = await connectToDatabase();
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone_number VARCHAR(15) UNIQUE NOT NULL,
        language VARCHAR(10),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    console.log('Database tables initialized successfully');
  } finally {
    client.release();
  }
}

