import React, { useEffect } from "react";
import { Grid, Button } from "@material-ui/core"
import { useParams } from "react-router-dom";
import axios from "axios";

const VideoCall = () => {

  const {roomId} = useParams();

  const url = 'http://localhost:3000/room/';
  const handleCopy=()=>{
       navigator.clipboard.writeText(roomId)
       alert("copied")
  }

  const CopyUrl=()=>{
    navigator.clipboard.writeText(url+roomId)
    alert("copied")
}

  const onLeave=()=>{
    window.localStorage.clear();
    window.location.href = '/landing';
  }

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
        <Grid container spacing={2} alignItems="center">
        <Grid item>
            <Button
              size="small"
              variant="text"
              color="secondary"
              onClick={onLeave}
            >
              Back
            </Button>
          </Grid>
        <Grid item>
            <Button
              size= "small"
              variant="text"
              color= "primary"
              onClick={handleCopy}
            >
              Copy Meeting ID
            </Button>
          </Grid>

          <Grid item>
            <Button
              size= "small"
              variant="text"
              color= "primary"
              onClick={CopyUrl}
            >
              Copy Meeting Link
            </Button>
          </Grid>
        </Grid>
      </div>
      <div id="videocall"> 
        
      </div>
    </>
  );
}

export default VideoCall
