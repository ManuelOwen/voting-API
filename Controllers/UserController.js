import sql from 'mssql';
import bcrypt from 'bcrypt';
import config from '../model/config.js'



export const getusers = async (req, res) => {
    try {
        // console.log("running")
        console.log(config)
        const pool = await sql.connect(config.sql);
        const result = await pool.request().query("select * from users");
        !result.recordset[0] ? res.status(404).json({ message: 'users not found' }) :
        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(201).json({ error: error });
    } finally {
        sql.close(); // Close the SQL connection
    }
};

// // Get a single user
export const getuser = async (req, res) => {
    try {
        const { id } = req.params;
        let pool = await sql.connect(config.sql);
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query("select * from users where id = @id");
        !result.recordset[0] ? res.status(404).json({ message: 'user not found' }) :
            res.status(200).json(result.recordset);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'An error occurred while retrieving users' });
    } finally {
        sql.close();
    }
};

// // Create a new user
export const createusers = async (req, res) => {
    try {
        const { description } = req.body;
        let pool = await sql.connect(config.sql);
        let insertuser = await pool.request()
            .input("description", sql.VarChar, description) // Insert the description into the SQL query
           await sql.query`INSERT INTO users (email, username,password ) VALUES (${email}, ${username},${password} )`; // Execute the SQL query
        res.status(201).json({ message: 'user created successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'An error occurred while creating user' });
        console.log(error)
    } finally {
        sql.close();   // Close the SQL connection
    }
};
// // Update a user






export const updateuser = async (req, res) => {
    try {
        const { id } = req.params; // Assuming 'id' is the parameter for the user ID
        const {  username, email, password } = req.body; // Extracting the values from req.body

        // Ensure that the 'password' field is defined and not empty in req.body
        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }

        // Generate hashed password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        let pool = await sql.connect(config.sql);
        await pool.request()
            .input('id', sql.VarChar, id)
            .input('username', sql.VarChar, username)
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, hashedPassword)
            .query('SELECT * FROM users WHERE username = @username OR email = @email OR password=@password OR id=@id');

        res.status(200).json({ message: 'user updated successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'An error occurred while updating user' });
    } finally {
        sql.close();
    }
}




// // Delete a user
export const deleteuser = async (req, res) => {
    try {
        const { id } = req.params;
        await sql.connect(config.sql);
        await sql.query`DELETE FROM users WHERE id = ${id}`;
        res.status(200).json({ message: 'user deleted successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'An error occurred while deleting the user' });
    } finally {
        sql.close();
    }
};