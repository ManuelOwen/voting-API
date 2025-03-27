import express from 'express';
import bodyParser from 'body-parser';
import config from './model/config.js';
import cors from 'cors';
import Authroutes from "./routes/Authroutes.js";
import CandidateUploadRoute from './routes/CandidateRoute.js';
import sql from 'mysql2';

const app = express();

// Connect to Database


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use("/uploads", express.static("uploads"));

// Use imported routes
app.use('/auth', Authroutes);
app.use('/candidates', CandidateUploadRoute);

app.get('/', (req, res) => {
  res.send("Hello😁 Welcome to my voters API");
});
const pool = await sql.connect(config.sql);

const PORT = config.port || 5000;
if(pool){
  app.listen(PORT, () => {

    console.log("Server is running on port", PORT);

  })
};
