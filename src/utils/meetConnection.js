import { store } from "../store/store.js";
import { meetSliceActions } from "../store/slices/meetSlice";
import io from "socket.io-client";



const getDisplayMedia = () => {
  if (screen) {
    if (navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices
        .getDisplayMedia({ video: true, audio: true })
        .then(getDisplayMediaSuccess)
        .catch((e) => console.log(e));
    }
  }
};

const getDisplayMediaSuccess = (stream) => {
  try {
    window.localStream.getTracks().forEach((track) => track.stop());
  } catch (err) {
    console.log(err);
  }

  window.localStream = stream;
  localVideoRef.current.srcObject = stream;

  for (let id in connections) {
    if (id == socketIdRef.current) continue;

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
        .catch((err) => console.log(err));
    });
  }

  stream.getTracks().forEach(
    (track) =>
      (track.onended = () => {
        setScreen(false);

        try {
          let tracks = localVideoRef.current.srcObject.getTracks();
          tracks.forEach((track) => track.stop());
        } catch (err) {
          console.log(err);
        }

        let blackSilence = (...args) =>
          new MediaStream([black(...args), silence()]);
        window.localStream = blackSilence();
        localVideoRef.current.srcObject = window.localStream;

        getUserMedia();
      })
  );
};











export { connectMeeting, getUserMedia };
