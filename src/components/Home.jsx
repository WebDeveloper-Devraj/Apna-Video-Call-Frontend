import { useRef, useState } from "react";
import { Button, TextField } from "@mui/material";
import rightPanelImg from "../assets/logo3.png";
import styles from "../styles/Home.module.css";
import { useDispatch } from "react-redux";
import { meetSliceActions } from "../store/slices/meetSlice";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const meetingCodeRef = useRef();

  let handleJoinVideoCall = async () => {
    dispatch(meetSliceActions.setMeetingCode(meetingCodeRef.current.value));
    navigate(`/meet/${meetingCodeRef.current.value}`);
  };

  return (
    <>
      <div className={styles.meetContainer}>
        <div className={styles.leftPanel}>
          <h2>Providing Quality Video Call Just Like Quality Education</h2>

          <div style={{ display: "flex", gap: "10px" }}>
            <TextField
              inputRef={meetingCodeRef}
              id="outlined-basic"
              label="Meeting Code"
              variant="outlined"
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
              }}
            />
            <Button onClick={handleJoinVideoCall} variant="contained">
              Join
            </Button>
          </div>
        </div>
        <div className={styles.rightPanel}>
          <img src={rightPanelImg} alt="" />
        </div>
      </div>
    </>
  );
};

export default Home;
