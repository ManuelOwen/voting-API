import express from 'express';
import { register, login } from '../Controllers/Authcontroller.js';

// REGISTER NEW USER

  const Authroutes = express.Router();

  Authroutes.post('/register', register);
  Authroutes.post('/login', login);

  


export default Authroutes;
