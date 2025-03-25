import sql from 'mssql';
import config from '../model/config.js';
//login first
export const login = async (req, res) => {
  const { username, password } = req.body;

  // Check if required fields are provided
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  try {
    const pool = await sql.connect(config.sql);

    const result = await pool
      .request()
      .input('Username', sql.VarChar, username)
      .input('password', sql.VarChar, password)
      .query('SELECT * FROM users WHERE Username = @Username OR password=@password');

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Authentication failed. Wrong name or password' });
    }

    const user = result.recordset[0];

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Authorization failed. Wrong credentials' });
    }

    const token = jwt.sign(
      { username: user.username, email: user.email, password: user.password },
      config.jwt_secret,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      email: user.email,
      username: user.username,
      password: user.password,
      token: token
    });
  } catch (error) {
    console.error('Error during login:', error);
    console.log('error')
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await sql.close();
  }
};

// // Get all Candidates
export const getCandidates = async (req, res) => {
    try {
        let pool = await sql.connect(config.sql);
        const result = await pool.request().query("SELECT * from candidates");
        !result.recordset[0] ? res.status(404).json({ message: 'candidates not found' }) :
        // console.log(candidates)
            res.status(200).json(result.recordset);
    } catch (error)
   
    {
       
        res.status(201).json({ error: 'an error occurred while retrieving candidates' });
    } finally {
        sql.close(); // Close the SQL connection
    }
};

// // Get a single candidate
export const getCandidate = async (req, res) => {
    try {
        const { id } = req.params;
      
        let pool = await sql.connect(config.sql);
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query("SELECT * FROM candidates WHERE id = @id");
        !result.recordset[0] ? res.status(404).json({ message: 'candidte not found' }) :
            res.status(200).json(result.recordset);
    } catch (error) {
        console.log (error)
        res.status(500).json({ error: 'An error occurred while retrieving Candidate' });
    } finally {
        sql.close();
    }
};

// // Create a new Candidate
export const createCandidate = async (req, res) => {
    try {
        const { position, full_name, party, img_url } = req.body;
        await sql.connect(config.sql);
        await sql.query`INSERT INTO candidates (position, full_name,vote_count, party, img_url) VALUES (${position}, ${full_name}, ${party}, ${img_url})`;
        res.status(201).json({ message: 'Candidate created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while creating the Candidate' });
    } finally {
        sql.close();
    }
};

// // Update a Candidate
export const updateCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const { position, full_name, party, img_url } = req.body;
        await sql.connect(config.sql);
        await sql.query`UPDATE candidates SET position = ${position}, full_name = ${full_name}, party = ${party}, img_url = ${img_url} WHERE id = ${id}`;
        res.status(200).json({ message: 'Candidate updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating the Candidate' });
    } finally {
        sql.close();
    }
};

// // Delete a candidate
export const deleteCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        await sql.connect(config.sql);
        await sql.query`DELETE FROM candidates WHERE id = ${id}`;
        res.status(200).json({ message: 'Candidate deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting the Candidate' });
    } finally {
        sql.close();
    }
};