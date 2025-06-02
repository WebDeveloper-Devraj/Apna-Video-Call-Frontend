import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import styles from "../styles/Authentication.module.css";
import loginImage from "../assets/loginImage.svg";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { authSliceActions } from "../store/slices/authSlice";
import { flashMessageActions } from "../store/slices/flashMessage";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function Authentication({ state }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitted, setSubmitted] = useState(false);

  const emailValid = email.includes("@") && email.includes(".");
  const nameValid = name.trim().length > 1;
  const passwordValid = password.length >= 6;

  const [formState, setFormState] = useState("");

  useEffect(() => {
    setFormState(state);
    setName("");
    setEmail("");
    setPassword("");
    setSubmitted(false);
  }, [state]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);

    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (
      (formState === "register" && nameValid && emailValid && passwordValid) ||
      (formState === "login" && emailValid && passwordValid)
    ) {
      if (formState === "login") {
        const response = await fetch(`${BASE_URL}/api/v1/users/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include",
        });

        const result = await response.json();

        if (result.success) {
          dispatch(authSliceActions.login(result.user));
          navigate("/");
          dispatch(
            flashMessageActions.setFlashMessage({
              message: result.message,
              type: "success",
            })
          );
        } else {
          dispatch(
            flashMessageActions.setFlashMessage({
              message: result.message,
              type: "error",
            })
          );
        }
      } else {
        const response = await fetch(`${BASE_URL}/api/v1/users/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include",
        });

        const result = await response.json();

        if (result.success) {
          dispatch(authSliceActions.login(result.user));
          navigate("/");
          dispatch(
            flashMessageActions.setFlashMessage({
              message: result.message,
              type: "success",
            })
          );
        } else {
          dispatch(
            flashMessageActions.setFlashMessage({
              message: result.message,
              type: "error",
            })
          );
        }
      }
    }
  };

  return (
    <div className={styles.Authentication}>
      <Grid
        container
        className={styles.grid}
        component="main"
        sx={
          {
            // height: "100vh",
          }
        }
      >
        <Grid
          className={styles.imgGrid}
          sx={{
            backgroundColor: "#0a0a0a",
            width: "60%",
          }}
        >
          <img
            className={styles.loginImage}
            src={loginImage}
            alt="login image"
          />
        </Grid>

        <Grid
          component={Paper}
          elevation={6}
          className={styles.formGrid}
          square
          sx={{
            backgroundColor: "#0a0a0a",
            // width: "40%",
          }}
        >
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>

            <div>
              <Link to="/login">
                <Button
                  variant={formState === "login" ? "contained" : ""}
                  sx={{
                    color: "white",
                  }}
                  onClick={() => {
                    setFormState("login");
                  }}
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant={formState === "register" ? "contained" : ""}
                  sx={{
                    color: "white",
                  }}
                  onClick={() => {
                    setFormState("register");
                  }}
                >
                  Sign Up
                </Button>
              </Link>
            </div>

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ mt: 1 }}
            >
              {formState === "register" && (
                <TextField
                  error={submitted && !nameValid}
                  helperText={
                    submitted &&
                    !nameValid &&
                    "Name must be at least 2 characters."
                  }
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  value={name}
                  autoFocus
                  onChange={(e) => setName(e.target.value)}
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
              )}

              <TextField
                error={submitted && !emailValid}
                helperText={
                  submitted && !emailValid && "Please enter a valid email."
                }
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Id"
                name="email"
                value={email}
                autoFocus
                onChange={(e) => setEmail(e.target.value)}
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
              <TextField
                error={submitted && !passwordValid}
                helperText={
                  submitted &&
                  !passwordValid &&
                  "Password must be at least 6 characters."
                }
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                value={password}
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                id="password"
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

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                {formState === "login" ? "Login " : "Register"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </div>
  );
}
