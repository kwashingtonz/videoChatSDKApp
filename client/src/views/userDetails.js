import React, { Component } from "react";

export default class UserDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: "",
    };
  }

  handleLogoutBtnClick(e) { 
    console.log('Logoutbtn clicked');
    window.location.href = "./sign-in";
    window.sessionStorage.clear();
    //window.sessionStorage.removeItem("chat-app-user");
  }

  componentDidMount() {

    if ((sessionStorage.length === "")) {
      window.location.href = "./sign-in";
    } //url


    fetch("http://localhost:5000/user/userData", {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        token: window.sessionStorage.getItem("token"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {

        console.log(data, "userData");
        this.setState({ userData: data.data });

        window.sessionStorage.setItem("chat-app-user", JSON.stringify(data.data._id));  //url
      });
  }
  render() {
    return (
      <div>
        Name<h1>{this.state.userData.fname}</h1>
        Email <h1>{this.state.userData.email}</h1>
       
      <div>
         <button id='backbtn' variant="primary" type="submit"
          onClick={this.handleLogoutBtnClick}>
            Logout
        </button>
      </div>
      
      </div>
    );
  }
}