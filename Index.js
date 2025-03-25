import express from 'express';
import bodyParser from 'body-parser';
import config from './model/config.js';
import cors from 'cors';
import Userroutes from "./routes/Userroutes.js"
import Authroutes from "./routes/Authroutes.js"
import CandidateUploadRoute from './routes/CandidateRoute.js';



const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
 
//import Authroutes
// import {Authroutes}from './Controllers/UserController.js'

// Setup CORS
app.use(cors());
// passing Auth

Userroutes(app)

Authroutes(app)

CandidateUploadRoute(app)

// Setup JWT
// Assuming you want to use JWT for authentication
// Import the necessary JWT package
import jwt from 'jsonwebtoken';


// Define a JWT authentication middleware
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }

    req.user = decoded;
    next();
  });
};



app.get('/', (req, res) => {
  res.send("Hello😁 Welcome to the my voters api");
});

app.listen(config.port || 5000, () => {
  console.log("Server is running on", config.port || 5000);
});
