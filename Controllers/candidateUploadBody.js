import mysql from 'mysql2/promise';
import config from '../model/config.js';

// Create MySQL connection pool
const pool = mysql.createPool(config.sql);

// ✅ Get all candidates
export const getCandidates = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM candidates");

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No candidates found' });
        }

        res.status(200).json(rows);
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

// ✅ Get a single candidate by ID
export const getCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query("SELECT * FROM candidates WHERE id = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Error retrieving candidate:", error);
        res.status(500).json({ error: 'An error occurred while retrieving the candidate', details: error.message });
    }
};

// ✅ Create a new candidate
export const createCandidate = async (req, res) => {
    try {
        const { full_name, party, img_url, vote_count = 0, position } = req.body; // Set vote_count default to 0

        if (!full_name || !party || !img_url || !position) {
            return res.status(400).json({ error: "full_name, party, img_url, vote_count, and position are required" });
        }

        await pool.query(
            "INSERT INTO candidates (full_name, party, img_url, vote_count, position) VALUES (?, ?, ?, ?, ?)", 
            [full_name, party, img_url, vote_count, position]
        );

        res.status(201).json({ message: 'Candidate created successfully' });
    } catch (error) {
        console.error("Error creating candidate:", error);
        res.status(500).json({ error: 'An error occurred while creating the candidate', details: error.message });
    }
};


// ✅ Update a candidate
export const updateCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, party, position, img_url, vote_count } = req.body;

        if (!full_name || !party || !position || !img_url || !vote_count) {
            return res.status(400).json({ error: "full_name, Party, img_url, vote_count, and Position are required" });
        }

        const [result] = await pool.query(
            "UPDATE candidates SET full_name = ?, party = ?, position = ?, img_url = ?, vote_count = ? WHERE id = ?",
            [full_name, party, position, img_url, vote_count, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        res.status(200).json({ message: 'Candidate updated successfully' });
    } catch (error) {
        console.error("Error updating candidate:", error);
        res.status(500).json({ error: 'An error occurred while updating the candidate', details: error.message });
    }
};


// ✅ Delete a candidate
export const deleteCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query("DELETE FROM candidates WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        res.status(200).json({ message: 'Candidate deleted successfully' });
    } catch (error) {
        console.error("Error deleting candidate:", error);
        res.status(500).json({ error: 'An error occurred while deleting the candidate', details: error.message });
    }
};
