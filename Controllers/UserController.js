import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import config from '../model/config.js';

// Create MySQL connection pool
const pool = mysql.createPool(config.sql);

// Get all users
export const getusers = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM users");

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        res.status(200).json(rows);
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
        console.log(error);
    }
};

// Get a single user by ID
export const getuser = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Error retrieving user:", error);
        res.status(500).json({ error: 'An error occurred while retrieving user', details: error.message });
    }
};

// Create a new user with a default role
export const createusers = async (req, res) => {
    try {
        const { email, username, password, role = "user" } = req.body;  // Default role = "user"
        
        if (!email || !username || !password) {
            return res.status(400).json({ error: "Email, Username, and Password are required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query("INSERT INTO users (email, username, password, role) VALUES (?, ?, ?, ?)", 
                         [email, username, hashedPassword, role]);

        res.status(201).json({ message: 'User created successfully', role });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: 'An error occurred while creating user', details: error.message });
    }
};

// Update a user
export const updateuser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, password, role } = req.body;

        if (!username || !email || !password || !role) {
            return res.status(400).json({ error: "Username, Email, Password, and Role are required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            "UPDATE users SET username = ?, email = ?, password = ?, role = ? WHERE id = ?",
            [username, email, hashedPassword, role, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: 'An error occurred while updating user', details: error.message });
    }
};

// Delete a user
export const deleteuser = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: 'An error occurred while deleting the user', details: error.message });
    }
};
