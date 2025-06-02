import { Outlet } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "./App.css";
import FlashMessage from "../components/FlashMessage.jsx";

const App = () => {
  return (
    <div className="app-container">
      <FlashMessage />
      <Header />
      <div className="content">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default App;
