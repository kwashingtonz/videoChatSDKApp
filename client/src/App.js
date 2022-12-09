import React from 'react';

import "../node_modules/bootstrap/dist/css/bootstrap.min.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./views/login_component";
import SignUp from "./views/signup_component";
import UserDetails from "./views/userDetails";
import VerifyOTP from "./views/verifyOTP";
import Landing from "./views/Landing";
import VideoCall from "./views/meeting";

function App() {

  return (
    <Router>
      
            <Routes>
              <Route exact path="/" element={<Login />} />
              <Route path="/sign-in" element={<Login />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/verifyOTP" element={<VerifyOTP />} />
              <Route path="/userDetails" element={<UserDetails />} />    
              <Route path="/landing" element={<Landing />}/>
              <Route path="/room/:roomId" element={<VideoCall/>}/>
            </Routes>
       
    </Router>
  );
}

export default App;
