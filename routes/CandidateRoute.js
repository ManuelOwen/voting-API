import express from 'express';
import { getCandidates, getCandidate, createCandidate, updateCandidate, deleteCandidate } from '../controllers/candidateUploadBody.js';

const router = express.Router();

router.get('/', getCandidates); // Fetch all candidates
router.get('/:id', getCandidate); // Fetch a specific candidate
router.post('/', createCandidate); // Create a candidate
router.put('/:id', updateCandidate); // Update a candidate
router.delete('/:id', deleteCandidate); // Delete a candidate

export default router;
