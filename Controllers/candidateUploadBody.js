import mysql from 'mysql2/promise';
import multer from "multer";
import path from "path";
import config from '../model/config.js';

// Create MySQL connection pool
const pool = mysql.createPool(config.sql);

// ✅ Get all candidates
//USED ON THE FRONT END
export const getCandidates = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM candidates");

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No candidates found' });
        }
        const formattedCandidates = rows.map(candidate => ({
            ...candidate,
            img_url: candidate.img_url ? `http://localhost:8081${candidate.img_url}` : null
        }));

        res.status(200).json(formattedCandidates);
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

export const voteCandidate = async (req, res) => {
    try {
        const { candidateId, userId } = req.body;

        // Get candidate's position
        const [candidate] = await pool.query("SELECT position FROM candidates WHERE id = ?", [candidateId]);
        if (candidate.length === 0) {
            return res.status(404).json({ message: 'Candidate not found' });
        }
        const position = candidate[0].position;

        // Check if the user has already voted for this position
        const [existingVote] = await pool.query(
            "SELECT vd.* FROM vote_detail vd INNER JOIN candidates c ON vd.candidate_id = c.id WHERE vd.user_id = ? AND c.position = ?",
            [userId, position]
        );

        if (existingVote.length > 0) {
            return res.status(400).json({ message: `You have already voted for a candidate in the ${position} position` });
        }

        // Increment vote count for the selected candidate
        const [result] = await pool.query("UPDATE candidates SET vote_count = vote_count + 1 WHERE id = ?", [candidateId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        // Insert vote detail
        await pool.query("INSERT INTO vote_detail (user_id, candidate_id) VALUES (?, ?)", [userId, candidateId]);

        res.status(200).json({ message: 'Voted successfully' });
    } catch (error) {
        console.error("Error voting candidate:", error);
        res.status(500).json({ error: 'An error occurred while voting for the candidate', details: error.message });
    }
};

export const getVotedCandidate = async (req, res) => {
    try {
        const { userId } = req.query;
        const [rows] = await pool.query("SELECT c.id,c.full_name, c.img_url,c.party,c.position,c.vote_count FROM candidates As c INNER JOIN vote_detail AS vd ON c.id = vd.candidate_id WHERE vd.user_id = ?", [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No candidate found' });
        }

        const formattedCandidates = rows.map(candidate => ({
            ...candidate,
            img_url: candidate.img_url ? `http://localhost:8081${candidate.img_url}` : null
        }));

        res.status(200).json(formattedCandidates);
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

export const createCandidate = async (req, res) => {
    upload.single("img_url")(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ error: "File upload failed", details: err.message });
        }

        const { full_name, party, position } = req.body;
        const vote_count = 0;
        const img_url = req.file ? `/uploads/${req.file.filename}` : null;

        if (!full_name || !party || !img_url || !position) {
            return res.status(400).json({ error: "full_name, party, img_url, and position are required" });
        }

        try {
            const [existingCandidate] = await pool.query(
                "SELECT id FROM candidates WHERE full_name = ?",
                [full_name]
            );

            if (existingCandidate.length > 0) {
                return res.status(400).json({ error: "Candidate with this name already exists" });
            }

            await pool.query(
                "INSERT INTO candidates (full_name, party, img_url, vote_count, position) VALUES (?, ?, ?, ?, ?)",
                [full_name, party, img_url, vote_count, position]
            );

            res.status(201).json({ message: "Candidate created successfully", img_url });
        } catch (error) {
            res.status(500).json({ error: "An error occurred while creating the candidate", details: error.message });
        }
    });
};


export const getCastedVotes = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                users.username AS "Voter Name",
                candidates.full_name AS "Candidate Voted For",
                candidates.party AS "Party",
                candidates.position AS "Position"
            FROM vote_detail
            JOIN users ON vote_detail.user_id = users.id
            JOIN candidates ON vote_detail.candidate_id = candidates.id
        `);

        if (rows.length === 0) {
            return res.status(404).json({ message: "No votes found" });
        }

        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

