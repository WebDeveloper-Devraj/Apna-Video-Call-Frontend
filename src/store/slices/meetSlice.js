import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  state: "",
  lobby: true,
  username: "",
  meetingCode: "",
  title: "",
  videoAvailable: true, // user permission
  audioAvailable: true, // user permission
  screenAvailable: true, // user permission
  video: true, // for on or off
  audio: true, // for on or off
  screen: true, // for on or off
  socket: null,
  socketId: null,
  videos: [],
};

const meetSlice = createSlice({
  name: "meet",
  initialState,
  reducers: {
    setState: (state, action) => {
      state.state = action.payload;
    },

    setTitle: (state, action) => {
      state.title = action.payload;
    },

    setMeetingCode: (state, action) => {
      state.meetingCode = action.payload;
    },

    setUsername: (state, action) => {
      state.username = action.payload;
    },

    setVideoAvailable: (state, action) => {
      state.videoAvailable = action.payload;
    },

    setAudioAvailable: (state, action) => {
      state.audioAvailable = action.payload;
    },

    setScreenAvailable: (state, action) => {
      state.screenAvailable = action.payload;
    },

    setVideo: (state, action) => {
      state.video = action.payload;
    },

    setAudio: (state, action) => {
      state.audio = action.payload;
    },

    setSocket: (state, action) => {
      state.socket = action.payload;
    },

    setSocketId: (state, action) => {
      state.socketId = action.payload;
    },

    setVideos: (state, action) => {
      state.videos = action.payload;
    },
    setLobby: (state, action) => {
      state.lobby = action.payload;
    },
  },
});

export const meetSliceActions = meetSlice.actions;
export default meetSlice;
