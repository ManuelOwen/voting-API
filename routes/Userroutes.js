import express from 'express';
import { getusers, createusers, getuser, updateuser, deleteuser } from '../Controllers/UserController.js';

const Userroutes = express.Router();

// Now, just use `/` since `/users` is already prefixed in `index.js`
Userroutes.get('/', getusers);
Userroutes.post('/', createusers);
Userroutes.route('/:id')
  .get(getuser)
  .put(updateuser)
  .delete(deleteuser);

export default Userroutes;
