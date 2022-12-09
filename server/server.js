process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;
require("dotenv").config();
//mongodb
require('./config/db')

const fetch = require('node-fetch');
const express = require('express');
const app = express();

// const { json } = require('body-parser');
const logger = require("morgan");
const cors = require('cors');

const port = process.env.PORT || 5000;

const UserRouter = require('./api/User')

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use('/user', UserRouter)

const API_KEY = process.env.daily_API_KEY;

const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: "Bearer " + API_KEY,
  };
  
  const getRoom = (room) => {
    return fetch(`https://api.daily.co/v1/rooms/${room}`, {
      method: "GET",
      headers,
    })
      .then((res) => res.json())
      .then((json) => {
        return json;
      })
      .catch((err) => console.error("error:" + err));
  };
  
  const createRoom = (room) => {

    const exp = Math.round(Date.now() / 1000) + 60 * 30;

    return fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: room,
        privacy: "private",
        properties: {
          exp,
          enable_knocking:true,
          enable_screenshare: true,
          enable_chat: true,
          start_video_off: true,
          start_audio_off: true,
          lang: "en",
        },
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        return json;
      })
      .catch((err) => console.log("error:" + err));
  };
  
  
  const meetingToken = (room) => {
    return fetch("https://api.daily.co/v1/meeting-tokens", {
      method: "POST",
      headers,
      body: JSON.stringify({
        properties: {
          room_name:room,
          is_owner:true
        },
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        return json;
      })
      .catch((err) => console.log("error:" + err));
  };
  
  app.get("/room/:roomId", async function (req, res) {
    const roomId = req.params.roomId;
    const room = await getRoom(roomId);
  
    if (room.error) {
  
      const newRoom = await createRoom(roomId);
      const meetingtoken = await meetingToken(roomId)
      res.status(200).send({newRoom,meetingtoken});
  
    } else {
  
      res.status(200).send(room);
      
    }
  });
  
  app.listen(port, () => console.log(`Server Running on port ${port}`));