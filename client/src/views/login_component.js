import React, { Component } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount(){
    if (sessionStorage.getItem("chat-app-user")) {
       window.location.href = "/landing";
     } //url
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
    const { email, password } = this.state;
    
    fetch("http://localhost:5000/user/login-user", {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {

        console.log(data, "userRegister");

        if (data.status === "FAILED") {
          //alert("Please Verify the OTP. check your email inbox");

          toast.warning("Please Verify the OTP. check your email inbox!", toastOptions);

          window.sessionStorage.setItem("userdata", JSON.stringify(data.data));
          window.sessionStorage.setItem("otpdata", JSON.stringify(data.iddata));
          window.sessionStorage.setItem("token", data.act);
          
          //window.location.href = "/verifyOTP";

          window.setTimeout(function() {
            window.location.href = '/verifyOTP';
        }, 3000);

        } else if (data.status === "ok") {

          //alert("login successful");
          toast.success("Login Successful!", toastOptions);

          window.sessionStorage.setItem("token", data.act);
          window.sessionStorage.setItem("userdata", JSON.stringify(data.data));
          window.sessionStorage.setItem("chat-app-user", JSON.stringify(data.act)); //url

          //window.location.href = "/landing";
          window.setTimeout(function() {
            window.location.href = '/landing';
        }, 3000);

        } else if(data.status === "Invalid Credentials"){
          toast.error("Email or password not matching", toastOptions);

        }else if (email === "" || password === "" ){
          toast.error("please enter email and password", toastOptions);

        }else if (data.status === "error"){
          toast.error("invalid password", toastOptions);
        }
      });
  }


  render() {
    return (
      <>
      <form className="box" onSubmit={this.handleSubmit}>
        <h2>Sign In</h2>
          <input
            type="email"
            className="form-control"
            placeholder="Enter email"
            onChange={(e) => this.setState({ email: e.target.value })}
          />

          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            onChange={(e) => this.setState({ password: e.target.value })}
          />

          <button type="submit">
            Login
          </button>

        <p className="forgot-password text-right">
          <a href="/sign-up">Sign Up</a>
        </p>
      </form>

      <ToastContainer/>
      </>
    );
  }
}