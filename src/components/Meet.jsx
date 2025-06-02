import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";
import { Badge, TextField, Button, IconButton } from "@mui/material";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import styles from "../styles/Meet.module.css";
import { meetSliceActions } from "../store/slices/meetSlice";
import { flashMessageActions } from "../store/slices/flashMessage";
import { useNavigate } from "react-router-dom";

const server_url = "http://localhost:8000";

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const connections = {};

const Meet = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);

  let [videos, setVideos] = useState([]);

  const localVideoRef = useRef();
  const socketRef = useRef();
  const socketIdRef = useRef();
  const videosRef = useRef([]);

  const titleRef = useRef();
  const usernameRef = useRef();
  const chatRef = useRef();

  const { state, meetingCode, username } = useSelector((store) => store.meet);
  const { user } = useSelector((store) => store.auth);

  const [lobby, setLobby] = useState(true);

  let [screenAvailable, setScreenAvailable] = useState();

  let [messages, setMessages] = useState([]);

  let [newMessages, setNewMessages] = useState(0);

  let [video, setVideo] = useState();

  let [audio, setAudio] = useState();

  let [screen, setScreen] = useState();

  let [showModal, setModal] = useState(false);

  // 1st useEffect for for getting permission
  useEffect(() => {
    getPermissions();
  }, []);

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (videoPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) {
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });

        if (userMediaStream) {
          window.localStream = userMediaStream;
          localVideoRef.current.srcObject = userMediaStream;
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleConnect = async () => {
    dispatch(meetSliceActions.setUsername(usernameRef.current.value));
    if (state === "createMeeting") {
      const title = titleRef.current.value;

      const response = await fetch(
        `http://localhost:8000/api/v1/meetings/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hostId: user._id,
            title: title,
            meetingCode,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        connectMeeting();
      } else {
        dispatch(
          flashMessageActions.setFlashMessage({
            message: "Meeting code already exist!",
            type: "error",
          })
        );
        navigate("/home");
      }
    } else if (state === "joinMeeting") {
      const response = await fetch(
        `http://localhost:8000/api/v1/meetings/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participant: user._id,
            meetingCode,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        connectMeeting();
      } else {
        dispatch(
          flashMessageActions.setFlashMessage({
            message: "Please enter valid meeting code!",
            type: "error",
          })
        );

        navigate("/home");
      }
    }
  };

  const connectMeeting = async () => {
    setLobby(false);
    getMediaAndConnectToSocket();
  };

  const getMediaAndConnectToSocket = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);

    connectToSocketServer(meetingCode);
  };

  // 2nd useEffect for geting userMedia
  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [video, audio]);

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        // .then((stream) => {})
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {}
    }
  };

  const getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;


    // it will not run first time
    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);

          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          for (let id in connections) {
            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {
              connections[id]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id,
                    JSON.stringify({ sdp: connections[id].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        })
    );
  };

  // connection logic
  const connectToSocketServer = (meetingCode) => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", meetingCode);

      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {

        clients.forEach((socketListId) => {
          // if (socketListId === socketIdRef.current) return;
          // if (connections[socketListId]) return; // TODO: debug this later if err comes

          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );

          // Wait for their ice candidate
          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          // Wait for their video stream
          connections[socketListId].onaddstream = (event) => {
            let videoExists = videosRef.current.find(
              (video) => video.socketId === socketListId
            );

            if (videoExists) {
              // Update the stream of the existing video
              setVideos((videos) => {
                const updatedVideos = videos.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream: event.stream }
                    : video
                );
                videosRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              // Create a new video
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoplay: true,
                playsinline: true,
              };

              setVideos((videos) => {
                const updatedVideos = [...videos, newVideo];
                videosRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          // Add the local video stream
          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            try {
              connections[id2].addStream(window.localStream);
            } catch (err) {
              console.log(err);
            }

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription })
                  );
                })
                .catch((err) => console.log(err));
            });
          }
        }
      });
    });
  };

  const black = ({ width = 640, height = 480 } = {}) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    const stream = canvas.captureStream();
    const track = stream.getVideoTracks()[0];

    // ✅ Manually tag this track so we can detect it later
    track._isBlack = true;

    return stream;
  };

  const silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  const gotMessageFromServer = (fromId, message) => {
    let signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        })
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  // 3rd useEffect for getting user Display media
  useEffect(() => {
    if (screen !== undefined) {
      getDislayMedia();
    }
  }, [screen]);

  let getDislayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDislayMediaSuccess)
          .then((stream) => {})
          .catch((e) => console.log(e));
      }
    }
  };

  let getDislayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);

          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          getUserMedia();
        })
    );
  };

  // button on off logic
  let handleVideo = () => {
    setVideo(!video);
  };

  let handleAudio = () => {
    setAudio(!audio);
  };

  let handleScreen = () => {
    setScreen(!screen);
  };

  let handleEndCall = () => {
    try {
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {}
    window.location.href = "/home";
  };

  const handleChat = () => {
    setNewMessages(0);
    setModal(!showModal);
  };

  // chatting logic
  let sendMessage = () => {
    socketRef.current.emit("chat-message", chatRef.current.value, username);
    chatRef.current.value = "";
  };

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data },
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevNewMessages) => prevNewMessages + 1);
    }
  };

  return (
    <>
      {lobby ? (
        <div className={styles.lobbyContainer}>
          {state == "createMeeting" ? (
            <>
              <h2 className={styles.lobbyHeading}>Create a New Meeting</h2>
              <TextField
                inputRef={titleRef}
                id="outlined-basic"
                label="Meeting Title"
                className={styles.lobbyInput}
                InputProps={{
                  style: { color: "white" },
                }}
                InputLabelProps={{
                  style: { color: "#ccc" },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#fff",
                    },
                    "&:hover fieldset": {
                      borderColor: "#fff",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#fff",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#fff",
                  },
                  "& .MuiInputBase-input": {
                    color: "#fff",
                  },
                  marginBottom: "0.5rem",
                }}
              />
            </>
          ) : (
            <h2 className={styles.lobbyHeading}>Join Meeting</h2>
          )}

          <TextField
            inputRef={usernameRef}
            id="outlined-basic"
            label="Username"
            className={styles.lobbyInput}
            InputProps={{
              style: { color: "white" },
            }}
            InputLabelProps={{
              style: { color: "#ccc" },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#fff",
                },
                "&:hover fieldset": {
                  borderColor: "#fff",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#fff",
                },
              },
              "& .MuiInputLabel-root": {
                color: "#fff",
              },
              "& .MuiInputBase-input": {
                color: "#fff",
              },
              marginBottom: "0.5rem",
            }}
          />
          <Button
            variant="contained"
            className={styles.lobbyButton}
            onClick={handleConnect}
          >
            Connect
          </Button>
          <div>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className={styles.lobbyVideo}
            ></video>
          </div>
        </div>
      ) : (
        <div>
          <div className={styles.meetVideoContainer}>
            {showModal ? (
              <div className={styles.chatRoom}>
                <div className={styles.chatContainer}>
                  <h1>Chat</h1>

                  <div className={styles.chattingDisplay}>
                    {messages.length !== 0 ? (
                      messages.map((item, index) => {
                        return (
                          <div style={{ marginBottom: "20px" }} key={index}>
                            <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                            <p>{item.data}</p>
                          </div>
                        );
                      })
                    ) : (
                      <p>No Messages Yet</p>
                    )}
                  </div>

                  <div className={styles.chattingArea}>
                    <TextField
                      inputRef={chatRef}
                      id="outlined-basic"
                      label="Enter Your chat"
                      variant="outlined"
                    />
                    <Button variant="contained" onClick={sendMessage}>
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}

            <div className={styles.buttonContainers}>
              <IconButton onClick={handleVideo} style={{ color: "white" }}>
                {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>
              <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                <CallEndIcon />
              </IconButton>
              <IconButton onClick={handleAudio} style={{ color: "white" }}>
                {audio === true ? <MicIcon /> : <MicOffIcon />}
              </IconButton>

              {screenAvailable === true ? (
                <IconButton onClick={handleScreen} style={{ color: "white" }}>
                  {screen === true ? (
                    <ScreenShareIcon />
                  ) : (
                    <StopScreenShareIcon />
                  )}
                </IconButton>
              ) : (
                <></>
              )}

              <Badge
                badgeContent={newMessages}
                max={999}
                color="orange"
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: "red",
                    color: "white",
                  },
                }}
              >
                <IconButton onClick={handleChat} style={{ color: "white" }}>
                  <ChatIcon />
                </IconButton>
              </Badge>
            </div>

            <div style={{ position: "relative" }}>
              <video
                className={styles.meetUserVideo}
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
              />
              {!video && (
                <div className={styles.myCameraOff}>
                  <VideocamOffIcon style={{ fontSize: 60 }} />
                </div>
              )}
            </div>

            <div
              className={`${styles.conferenceView} ${
                videos.length === 1
                  ? styles.one
                  : videos.length === 2
                  ? styles.two
                  : videos.length === 3
                  ? styles.three
                  : styles.four
              }`}
            >
              {videos.map((video, idx) => (
                <div key={video.socketId}>
                  <video
                    data-socket={video.socketId}
                    ref={(ref) => {
                      if (ref && video.stream) {
                        ref.srcObject = video.stream;
                      }
                    }}
                    autoPlay
                    playsInline
                  ></video>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Meet;
