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
      { username: user.username, useremail: user.useremail, password: user.password },
      config.jwt_secret,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      useremail: user.useremail,
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

// // Get all vote count
export const voteCount = async (req, res) => {
    try {
        let pool = await sql.connect(config.sql);
        const result = await pool.request().query("SELECT * from vote");
        !result.recordset[0] ? res.status(404).json({ message: 'Tasks not found' }) :
        // console.log(Tasks)
            res.status(200).json(result.recordset);
    } catch (error)
   
    {
       
        res.status(201).json({ error: 'an error occurred while retrieving Tasks' });
    } finally {
        sql.close(); // Close the SQL connection
    }
};

// // Get a single Task
export const getTask = async (req, res) => {
    try {
        const { id } = req.params;
      
        let pool = await sql.connect(config.sql);
        const result = await pool.request()
            .input("Task_id", sql.Int, id)
            .query("SELECT * FROM currenttasks WHERE Task_id = @Task_id");
        !result.recordset[0] ? res.status(404).json({ message: 'Task not found' }) :
            res.status(200).json(result.recordset);
    } catch (error) {
        console.log (error)
        res.status(500).json({ error: 'An error occurred while retrieving Task' });
    } finally {
        sql.close();
    }
};


  
// // Update a Task
export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { description } = req.body;
        let pool = await sql.connect(config.sql);
        await pool.request()
            .input("Task_Id", sql.Int, id)
            .input("TaskDescription", sql.VarChar, description)
            .query("UPDATE currenttasks SET description = @TaskDescription WHERE id = @Task_Id");
        res.status(200).json({ message: 'Task updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating Task' });
    } finally {
        sql.close();
    }
};
// // Delete a Task
export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        await sql.connect(config.sql);
        await sql.query`DELETE FROM currenttasks WHERE id = ${id}`;
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting the Task' });
    } finally {
        sql.close();
    }
};