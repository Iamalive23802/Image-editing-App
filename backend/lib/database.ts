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
  language: string | null;
  prefix: string | null;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  email: string | null;
  address_line: string | null;
  state: string | null;
  district: string | null;
  taluka: string | null;
  role: string | null;
  political_party: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
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
      prefix: null,
      first_name: null,
      middle_name: null,
      last_name: null,
      date_of_birth: null,
      email: null,
      address_line: null,
      state: null,
      district: null,
      taluka: null,
      role: null,
      political_party: null,
      instagram_url: null,
      facebook_url: null,
      twitter_url: null,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      language: null,
    };
  }
  
  const client = await connectToDatabase();
  try {
    const query = `
      INSERT INTO users (phone_number)
      VALUES ($1)
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
    const user = result.rows[0] || null;
    
    // Format date_of_birth as YYYY-MM-DD string to avoid timezone issues
    if (user && user.date_of_birth) {
      if (user.date_of_birth instanceof Date) {
        // If it's a Date object, format it as YYYY-MM-DD
        const year = user.date_of_birth.getFullYear();
        const month = String(user.date_of_birth.getMonth() + 1).padStart(2, '0');
        const day = String(user.date_of_birth.getDate()).padStart(2, '0');
        user.date_of_birth = `${year}-${month}-${day}`;
      } else if (typeof user.date_of_birth === 'string' && user.date_of_birth.includes('T')) {
        // If it's an ISO string with time, extract just the date part
        user.date_of_birth = user.date_of_birth.split('T')[0];
      }
      console.log('User date_of_birth from DB:', user.date_of_birth, typeof user.date_of_birth);
    }
    
    return user;
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

export interface UpdateUserDetailsInput {
  prefix?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  date_of_birth?: string | null;
  email?: string | null;
  address_line?: string | null;
  state?: string | null;
  district?: string | null;
  taluka?: string | null;
  role?: string | null;
  political_party?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  twitter_url?: string | null;
  avatar_url?: string | null;
}

export async function updateUserDetails(
  userId: string,
  details: UpdateUserDetailsInput
): Promise<User> {
  const sanitizedDetails: UpdateUserDetailsInput = {
    prefix: details.prefix,
    first_name: details.first_name,
    middle_name: details.middle_name,
    last_name: details.last_name,
    date_of_birth: details.date_of_birth,
    email: details.email,
    address_line: details.address_line,
    state: details.state,
    district: details.district,
    taluka: details.taluka,
    role: details.role,
    political_party: details.political_party,
    instagram_url: details.instagram_url,
    facebook_url: details.facebook_url,
    twitter_url: details.twitter_url,
    avatar_url: details.avatar_url,
  };

  if (isBrowser || !pool) {
    const mockUser = localStorage.getItem(`mock_user_id_${userId}`);
    let parsedUser: User | null = null;
    if (mockUser) {
      parsedUser = JSON.parse(mockUser);
    }
    const now = new Date().toISOString();
    const current: User = parsedUser
      ? parsedUser
      : {
          id: userId,
          phone_number: '',
          language: null,
          prefix: null,
          first_name: null,
          middle_name: null,
          last_name: null,
          date_of_birth: null,
          email: null,
          address_line: null,
          state: null,
          district: null,
          taluka: null,
          role: null,
          political_party: null,
          instagram_url: null,
          facebook_url: null,
          twitter_url: null,
          avatar_url: null,
          created_at: now,
          updated_at: now,
        };

    const updated: User = {
      ...current,
      ...Object.fromEntries(
        Object.entries(sanitizedDetails).map(([key, value]) => [key, value ?? null])
      ),
      updated_at: now,
    };

    localStorage.setItem(`mock_user_id_${userId}`, JSON.stringify(updated));
    return updated;
  }

  const client = await connectToDatabase();
  try {
    const entries = Object.entries(sanitizedDetails).filter(
      ([, value]) => value !== undefined
    );

    if (entries.length === 0) {
      const existing = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
      if (!existing.rows[0]) {
        throw new Error('User not found');
      }
      return existing.rows[0];
    }

    const setClauses = entries.map(
      ([column], index) => `${column} = $${index + 2}`
    );
    const values = entries.map(([, value]) => value ?? null);

    const query = `
      UPDATE users
      SET ${setClauses.join(', ')}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await client.query(query, [userId, ...values]);
    if (!result.rows[0]) {
      throw new Error('User not found');
    }
    
    const user = result.rows[0];
    
    // Format date_of_birth as YYYY-MM-DD string to avoid timezone issues
    if (user.date_of_birth) {
      if (user.date_of_birth instanceof Date) {
        // If it's a Date object, format it as YYYY-MM-DD
        const year = user.date_of_birth.getFullYear();
        const month = String(user.date_of_birth.getMonth() + 1).padStart(2, '0');
        const day = String(user.date_of_birth.getDate()).padStart(2, '0');
        user.date_of_birth = `${year}-${month}-${day}`;
      } else if (typeof user.date_of_birth === 'string' && user.date_of_birth.includes('T')) {
        // If it's an ISO string with time, extract just the date part
        user.date_of_birth = user.date_of_birth.split('T')[0];
      }
      console.log('Formatted date_of_birth:', user.date_of_birth);
    }
    
    return user;
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
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone_number VARCHAR(15) UNIQUE NOT NULL,
        language VARCHAR(10),
        prefix VARCHAR(10),
        first_name VARCHAR(120),
        middle_name VARCHAR(120),
        last_name VARCHAR(120),
        date_of_birth DATE,
        email VARCHAR(255) UNIQUE,
        address_line TEXT,
        state VARCHAR(120),
        district VARCHAR(120),
        taluka VARCHAR(120),
        role VARCHAR(60),
        political_party VARCHAR(120),
        instagram_url TEXT,
        facebook_url TEXT,
        twitter_url TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

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
