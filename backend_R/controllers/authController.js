import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../Config/supabase.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/users.json');

// Helper to read local fallback user database
function getLocalUsers() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content) || [];
    }
  } catch (err) {
    console.error('Error reading local users data file:', err);
  }
  return [];
}

// Helper to save local fallback user database
function saveLocalUsers(users) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local users data file:', err);
  }
}

/**
 * Customer Self-Service Sign-Up:
 * Salts and hashes password before saving to the Supabase database.
 */
export const signup = async (req, res) => {
  try {
    const { name, username, email, password, phone } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, username, and password are required.'
      });
    }

    const cleanName = String(name).trim();
    const cleanUsername = String(username).trim().toLowerCase();
    const cleanEmail = email ? String(email).trim().toLowerCase() : null;
    const cleanPassword = String(password).trim();

    // Strong password validation: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!PASSWORD_REGEX.test(cleanPassword)) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.'
      });
    }

    // Optional phone validation: must be exactly 10 numeric digits if provided
    let sanitizedPhone = null;
    if (phone && String(phone).trim().length > 0) {
      sanitizedPhone = String(phone).replace(/\D/g, '');
      if (sanitizedPhone.length !== 10) {
        return res.status(400).json({
          success: false,
          error: 'Phone number must be exactly 10 digits (or leave it blank).'
        });
      }
    }

    // Generate cryptographic salt and hash
    const saltedHash = hashPassword(cleanPassword);

    // 1. Attempt persistence in Supabase
    try {
      // Check for existing user in Supabase
      const { data: existingUser, error: checkErr } = await supabase
        .from('users')
        .select('id, username, email')
        .or(`username.eq.${cleanUsername}${cleanEmail ? `,email.eq.${cleanEmail}` : ''}`)
        .maybeSingle();

      if (!checkErr) {
        if (existingUser) {
          return res.status(400).json({
            success: false,
            error: 'An account with that username or email already exists in the database.'
          });
        }

        // Insert new customer into Supabase with salted & hashed password
        const { data: newUser, error: insertErr } = await supabase
          .from('users')
          .insert({
            name: cleanName,
            username: cleanUsername,
            email: cleanEmail,
            password: saltedHash,
            phone: sanitizedPhone,
            role: 'customer' // All self-signups default to customer
          })
          .select()
          .single();

        if (!insertErr && newUser) {
          console.log(`✅ [Supabase] Customer signed up with salted+hashed password: ${cleanUsername}`);
          const token = `auth_token_${Buffer.from(JSON.stringify({
            id: newUser.id,
            role: newUser.role,
            name: newUser.name,
            issuedAt: Date.now()
          })).toString('base64')}`;

          return res.status(201).json({
            success: true,
            token,
            user: {
              id: newUser.id,
              name: newUser.name,
              username: newUser.username,
              email: newUser.email,
              role: newUser.role
            }
          });
        }
      }
    } catch (dbErr) {
      console.warn('[Supabase Auth] Notice during signup:', dbErr.message);
    }

    // 2. Persistent fallback registry if Supabase users table is not yet migrated
    const localUsers = getLocalUsers();
    const existsLocally = localUsers.find(u => 
      u.username.toLowerCase() === cleanUsername || 
      (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail)
    );

    if (existsLocally) {
      return res.status(400).json({
        success: false,
        error: 'An account with that username or email already exists in the database.'
      });
    }

    const createdUser = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      password: saltedHash,
      phone: sanitizedPhone,
      role: 'customer',
      created_at: new Date().toISOString()
    };

    localUsers.push(createdUser);
    saveLocalUsers(localUsers);

    console.log(`💾 [Local DB] Customer registered with salted+hashed password: ${cleanUsername}`);

    const token = `auth_token_${Buffer.from(JSON.stringify({
      id: createdUser.id,
      role: createdUser.role,
      name: createdUser.name,
      issuedAt: Date.now()
    })).toString('base64')}`;

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: createdUser.id,
        name: createdUser.name,
        username: createdUser.username,
        email: createdUser.email,
        role: createdUser.role
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to complete registration.' });
  }
};

/**
 * User Login:
 * Verifies credentials against salted+hashed password stored in database.
 */
export const login = async (req, res) => {
  try {
    const { id, username, password } = req.body;
    const loginIdentifier = String(id || username || '').trim().toLowerCase();
    const inputPassword = String(password || '').trim();

    if (!loginIdentifier || !inputPassword) {
      return res.status(400).json({
        success: false,
        error: 'User ID / Username and Password are required.'
      });
    }

    // 1. Query Supabase database
    try {
      const { data: dbUser, error: queryErr } = await supabase
        .from('users')
        .select('*')
        .or(`username.eq.${loginIdentifier},email.eq.${loginIdentifier}`)
        .maybeSingle();

      if (!queryErr && dbUser) {
        // Securely verify salted+hashed password (timing-safe)
        const isPasswordValid = verifyPassword(inputPassword, dbUser.password);
        if (!isPasswordValid) {
          return res.status(401).json({
            success: false,
            error: 'Invalid password. Access denied.'
          });
        }

        console.log(`✅ [Supabase] User verified via salted hash: ${dbUser.username} (${dbUser.role})`);
        const token = `auth_token_${Buffer.from(JSON.stringify({
          id: dbUser.id,
          role: dbUser.role,
          name: dbUser.name,
          issuedAt: Date.now()
        })).toString('base64')}`;

        return res.status(200).json({
          success: true,
          token,
          user: {
            id: dbUser.id,
            name: dbUser.name,
            username: dbUser.username,
            email: dbUser.email,
            role: dbUser.role
          }
        });
      }
    } catch (err) {
      console.warn('[Supabase Auth] Notice during database login:', err.message);
    }

    // 2. Query persistent fallback registry
    const localUsers = getLocalUsers();
    const matched = localUsers.find(u => 
      (u.username && u.username.toLowerCase() === loginIdentifier) || 
      (u.email && u.email.toLowerCase() === loginIdentifier) ||
      (u.id && u.id.toLowerCase() === loginIdentifier)
    );

    if (!matched) {
      return res.status(401).json({
        success: false,
        error: 'Invalid User ID or Password. User not found in database.'
      });
    }

    const isMatch = verifyPassword(inputPassword, matched.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password. Access denied.'
      });
    }

    console.log(`💾 [Local DB] User authenticated via salted hash: ${matched.username} (${matched.role})`);
    const token = `auth_token_${Buffer.from(JSON.stringify({
      id: matched.id,
      role: matched.role,
      name: matched.name,
      issuedAt: Date.now()
    })).toString('base64')}`;

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: matched.id,
        name: matched.name,
        username: matched.username,
        email: matched.email,
        role: matched.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Login failed.' });
  }
};

/**
 * Token Verification:
 * Validates active session token.
 */
export const verify = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, authenticated: false, error: 'No authorization token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    if (token && token.startsWith('auth_token_')) {
      const payloadBase64 = token.replace('auth_token_', '');
      const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
      return res.status(200).json({
        success: true,
        authenticated: true,
        user: decoded
      });
    }
  } catch (err) {
    return res.status(401).json({ success: false, authenticated: false, error: 'Malformed session token' });
  }

  return res.status(401).json({ success: false, authenticated: false, error: 'Invalid or expired session token' });
};

/**
 * Auth Config:
 * Provides public authentication configuration.
 */
export const getAuthConfig = (req, res) => {
  res.status(200).json({
    authRequired: true,
    roles: ['customer', 'manager'],
    allowSignup: true,
    hashing: 'scrypt-salted'
  });
};
