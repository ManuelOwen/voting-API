import express from 'express';
import { getCandidates, voteCandidate, getVotedCandidate, createCandidate, getCastedVotes } from '../controllers/candidateUploadBody.js';

const router = express.Router();

router.get('', getCandidates);
router.post('/vote', voteCandidate);
router.get('/voted', getVotedCandidate);
router.post('/new', createCandidate);
router.get('/votes', getCastedVotes); 


export default router;
