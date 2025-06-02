import { createBrowserRouter } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Authentication from "./components/Authentication";
import Home from "./components/Home";
import App from "./routes/App";
import Meet from "./components/Meet";
import NotFound from "./components/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/register", element: <Authentication state={"register"} /> },
      { path: "/login", element: <Authentication state={"login"} /> },
      { path: "/home", element: <Home /> },
    ],
  },
  { path: "/meet/:id", element: <Meet /> },

  { path: "*", element: <NotFound /> },
]);

export default router;
