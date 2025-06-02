import { NavLink } from "react-router-dom";
import styles from "../styles/Header.module.css";
import { authSliceActions } from "../store/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { flashMessageActions } from "../store/slices/flashMessage";

const Header = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  return (
    <header className={styles.headerContainer}>
      <NavLink to="/">
        <h2 className={styles.brandName}>Apna Video Call</h2>
      </NavLink>

      <nav className={styles.navigation}>
        <ul>
          {!user ? (
            <>
              <li>
                <NavLink
                  to="/register"
                  end
                  className={({ isActive }) =>
                    isActive ? styles.activeLink : null
                  }
                >
                  Register
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/login"
                  end
                  className={({ isActive }) =>
                    isActive ? styles.activeLink : null
                  }
                >
                  Login
                </NavLink>
              </li>
            </>
          ) : (
            <li>
              <button
                onClick={() => {
                  dispatch(
                    flashMessageActions.setFlashMessage({
                      message: "Logges out successfully!",
                      type: "success",
                    })
                  );
                  dispatch(authSliceActions.logout());
                }}
                className={styles.logoutButton}
              >
                Logout
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
