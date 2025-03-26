import express from 'express';
import { register, login } from '../Controllers/Authcontroller.js';

// REGISTER NEW USER
const Authroutes = () => {
  const router = express.Router();

  router.post('/register', register);
  router.post('/login', login);

  return router;
};

export default Authroutes;
