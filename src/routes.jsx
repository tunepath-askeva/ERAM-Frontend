import { Routes, Route, useLocation } from "react-router-dom";
import Register from "./Auth/Register";
import Login from "./Auth/Login";
import Home from "./Pages/Home";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;
