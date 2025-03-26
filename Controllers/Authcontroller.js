import sql from 'mssql';
import config from '../model/config.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


// TO REGISTER USER
export const register = async (req, res) => {
  const { username, password, email, id } = req.body;
  const saltRounds = 10;

  // Check if required fields are provided
  if (!username)  {
    return res.status(400).json({ error: 'username required' });
  }if(!password){
    return res.status(400).json({error:'password required'});
  }if(!email){
    return res.status(400).json({error:' email required'})
  }
//register user
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const pool = await sql.connect(config.sql);

    const result = await pool
      .request()
      .input('username', sql.VarChar, username)
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, hashedPassword)
      .query('SELECT * FROM users WHERE username = @username OR email = @email OR password=@password');

    const user = result.recordset[0];

    if (user) {
      return res.status(409).json({ error: 'User already exists' });
    }

    await pool
      .request()
      .input('username', sql.VarChar, username)
      .input('id', sql.VarChar, id)
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, hashedPassword)
      .query('INSERT INTO users (username, id, email, password) VALUES (@username, @id, @email, @password)');

    res.status(200).json({ message: 'Registration successful' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error occurred while creating user' });
    console.log(error)
  } finally {
    await sql.close();
  }
};
//login user
export const login = async (req, res) => {
  const { email, password } = req.body; // Fix: Ensure we're using 'email' instead of 'username'

  // Check if required fields are provided
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const pool = await sql.connect(config.sql);

    // Fix: Correct query to search by email only
    const result = await pool
      .request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM users WHERE email = @email');

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Authentication failed. Invalid email or password' });
    }

    const user = result.recordset[0];

    // Fix: Compare hashed password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Authorization failed. Invalid credentials' });
    }

    // Fix: Only store necessary user data in token (excluding password)
    const token = jwt.sign(
      { username: user.username, email: user.email },
      config.jwt_secret,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      email: user.email,
      username: user.username,
      token: token
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


