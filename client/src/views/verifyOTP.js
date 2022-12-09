import React, { Component } from "react";
import "./style.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default class VerifyOTP extends Component {

    constructor(props) {
        super(props);
        this.state = {
            email: "",
            userId: "",
            otp: "",
            otpData: {},
            user: {},
            
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.reSendOTPSubmit = this.reSendOTPSubmit.bind(this);
    }

    handleBackBtnClick(e) { 
      console.log('Backbtn clicked');
      window.location.href = "./sign-in";
      sessionStorage.clear();
    }

  componentDidMount() {

    const userData = JSON.parse(window.sessionStorage.getItem("userdata"));
    const otpData = JSON.parse(window.sessionStorage.getItem("otpdata"));
    const userId = otpData.userId
    const email = userData.email

    this.setState({ email: email, userId: userId ,otpData:otpData, user:userData}); 
  }

  handleSubmit(e) {
    const toastOptions = {
      position: "top-right",
      autoClose: 3000,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    };
    e.preventDefault();
    const { userId, otp } = this.state;
    console.log(userId, otp);
    fetch("http://localhost:5000/user/verifyOTP", {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
         otp: this.state.otp,
         userId: userId,
         //token: window.sessionStorage.getItem("token"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
    
        console.log(data, "verifyOTP");
        if (data.status === "VERIFIED") {
            
            // alert("Verification Successful");
           // window.location.href = "./landing";

           toast.success("Email Verification Successful", toastOptions);
           window.setTimeout(function() {
            window.location.href = './landing';
        }, 3000);

        }else{
            toast.error("Email Verification Unsuccessful", toastOptions);
        }
      });


  }

    reSendOTPSubmit(e) {
      const toastOptions = {
        position: "top-right",
        autoClose: 3000,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      };
    e.preventDefault();
    const {userId, email} = this.state;
    console.log(userId, email);
    fetch("http://localhost:5000/user/resendOTPVerificationCode", {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        userId : userId,
        email : email,
      }), 
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "OTP Send");

        if (data.status === "ok") {

           toast.success("Re-send OTP successful!", toastOptions);
           window.localStorage.setItem("token", data.act);

         window.setTimeout(function() {
            window.location.href = './VerifyOTP';
        }, 3000);

        }
      });
  }
  
  render() {
    return (
      <>

      <button id='backbtn' variant="primary" type="submit" className="back"
     onClick={this.handleBackBtnClick}>
            {'<-'}Back
       </button>

       <div className="verify">
      <form className="box"  onSubmit={this.handleSubmit}>
    
    <meta charSet="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="style.css" />
    
        <h3>OTP Verification</h3>

          <label>Your Email</label>
           <h5>{this.state.user.email}</h5>
        

        <div className="mb-3">
          <label>Enter OTP Code</label>
        </div>
       <div className="OTP">

        <div className="otp-field">

            <input type="text" maxLength="4" onKeyPress={(event) => {
                    if (!/[0-9]/.test(event.key)) {
                        event.preventDefault();
                    }
                }} onChange={(e) => this.setState({ otp: e.target.value })}
            />
        
          </div>

        </div> <br></br>
        
          <button   className="verify-btn" >
            Verify
          </button>
        </form>
        
        <form className="box1" onSubmit={this.reSendOTPSubmit}>
         
         <button type="submit" variant="primary" >
            Re-Send
          </button>
          
        </form> 
         
      </div>
    
   
    <ToastContainer/>
    </>
    );
}
}