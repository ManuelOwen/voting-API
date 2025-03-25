// import Taskroutes.js from 'server.js'
import { getCandidates, getCandidate,   deleteCandidate,updateCandidate,createCandidate } from '../Controllers/candidateUploadBody.js';
import { login, register } from '../Controllers/Authcontroller.js';


const CandidateUploadRoute = (app) => {
    app.route('/candidates')
        .get( getCandidates)
        .post( createCandidate);


    app.route('/candidates/:id')
       
        .get( getCandidate)
        .put( updateCandidate)
        .delete( deleteCandidate);
}


export default CandidateUploadRoute;