import {BrowserRouter, Routes, Route} from "react-router-dom";
import App from "./App";
import Login from "./auth/Login";
import Signup from "./auth/Signup";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
