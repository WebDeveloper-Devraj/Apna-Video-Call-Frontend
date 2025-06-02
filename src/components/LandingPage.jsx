import { useNavigate } from "react-router-dom";
import styles from "../styles/LandingPage.module.css";
import mobileImg from "../assets/mobile.png";
import { useDispatch, useSelector } from "react-redux";
import { meetSliceActions } from "../store/slices/meetSlice";

const LandingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((store) => store.auth.user);

  const handleMeeting = async (meeting) => {
    if (!user) {
      navigate("/login");
    } else {
      dispatch(meetSliceActions.setState(meeting));
      navigate("/home");
    }
  };

  return (
    <div className={styles.landingPageContainer}>
      <div className={styles.leftSide}>
        <h1>
          <span style={{ color: "#FF9839" }}>Connect</span> with your loved Ones
        </h1>

        <p>Cover a distance by Apna Video Call</p>
        <div className={styles.actionBtns}>
          <a
            className={styles.joinMeeting}
            onClick={() => handleMeeting("joinMeeting")}
          >
            Join Meeting
          </a>
          <a
            className={styles.createMeeting}
            onClick={() => handleMeeting("createMeeting")}
          >
            Create Meeting
          </a>
        </div>
      </div>

      <div className={styles.rightSide}>
        <img src={mobileImg} alt="" />
      </div>
    </div>
  );
};

export default LandingPage;
