import React, { useCallback,useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";


const Landing = ({ currentUserId }) => {

  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    //eslint-disable-next-line
    if ((sessionStorage.length == "")) {
    window.location.href = "./sign-in";
  } //url
}, []);

    const navigate = useNavigate()
  
    const handleLogoutBtnClick = useCallback(async () => {
      console.log('Logoutbtn clicked');
      window.location.href = "./sign-in";
      window.sessionStorage.clear();
      window.localStorage.clear();
    },[]);

    const joinCreateRoom = useCallback(async () => {
      try {
          
          if(roomId !== ""){
            navigate(`/room/${roomId}`);
          }else{
            try {
              var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
              var newRoomId = ''
              for(var i = 20;i>0; --i) newRoomId += chars[Math.floor(Math.random() * chars.length)]
              navigate(`/room/${newRoomId}`);
          }
          catch (error) {
              console.error(error);
          }
          }   
      }
      catch (error) {
          console.error(error);
      }
  }, [roomId, navigate]);

    return (
      <div className="container">
      <h2>Meet Your Friends</h2> 
         <input type="text" placeholder="Enter Room Code" onChange={(e) =>setRoomId(e.target.value)}/>

          <button type="submit" onClick={joinCreateRoom}>
            Join/Create
          </button>

             
        <form  className="box2" >
         
         <button  type="submit" variant="primary" onClick={handleLogoutBtnClick}>
         Log Out
          </button>   
          
        </form> 
     

      </div>
      );
};
export default Landing;
