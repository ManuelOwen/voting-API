import sql from 'mysql2/promise'; // Use mysql2 with promises
import config from '../model/config.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// TO REGISTER USER



//USED ON THE FRONT END
export const register = async (req, res) => {
  const { username, password, email } = req.body;
  const saltRounds = 10;

  // Validate required fields
  if (!username) return res.status(400).json({ error: 'Username required' });
  if (!password) return res.status(400).json({ error: 'Password required' });
  if (!email) return res.status(400).json({ error: 'Email required' });
 
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const pool = await sql.createConnection(config.sql);

    // Debugging Log (Remove in production)
    console.log("Registering User:", { username, email, hashedPassword });

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE username = ? AND email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const role = 'user';
    // Insert new user
    await pool.execute(
      'INSERT INTO users (username,  email, role, password) VALUES ( ?, ?, ?, ?)',
      [username, email, role, hashedPassword]
    );

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Error occurred while creating user' });
    console.log(error);
  }
};


//USED ON THE FRONT END
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const pool = await sql.createConnection(config.sql);

    // Retrieve user by email
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    console.log("User rows retrieved from DB:", rows);

    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: 'Authentication failed. Invalid email or password' });
    }

    const user = rows[0];
    console.log("Retrieved user:", user);

    const storedHashedPassword = Buffer.isBuffer(user.password) 
      ? user.password.toString('utf-8') 
      : user.password;

    console.log("Stored password from DB:", storedHashedPassword);
    console.log("Entered password:", password);

    const isMatch = await bcrypt.compare(password, storedHashedPassword);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ error: 'Authentication failed. Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      config.jwt_secret,
      { expiresIn: '4h' }
    );

    res.status(200).json({
      token,
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};