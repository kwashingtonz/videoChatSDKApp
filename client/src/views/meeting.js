import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const VideoCall = () => {

  const {roomId} = useParams();

  useEffect(() => {
    const domain = "https://videochattestalpha.daily.co/";

    axios
      .get(`/room/${roomId}`)
      .then((res) => {
        console.log(res)
        if (res.status === 200) {
          
          if(res.data.meetingtoken){
            const script = document.createElement("script");
            script.innerHTML = `window.DailyIframe.createFrame(videocall,{
              iframeStyle: {
                position: "fixed",
                width: "100%",
                height: "100%",
                border: "0",
                zIndex: 9999
              },
              showLeaveButton: true,
              showFullscreenButton: true,
            }).join({
              url: "${domain}${roomId}?t=${res.data.meetingtoken.token}",
            });`;

            document.body.appendChild(script);

          }else{

            const script = document.createElement("script");
            script.innerHTML = `window.DailyIframe.createFrame(videocall,{
            iframeStyle: {
              position: "fixed",
              width: "100%",
              height: "100%",
              border: "0",
              zIndex: 9999
            },
            showLeaveButton: true,
            showFullscreenButton: true,
          }).join({
            url: "${domain}${roomId}",
          });`;

          document.body.appendChild(script);

          }
        }
      })
      .catch((err) => console.log(err));
  }, [roomId]);

  return(
    <>
      <div id="over">
        
      </div>
      <div id="videocall"> 
        
      </div>
    </>
  );
}

export default VideoCall
