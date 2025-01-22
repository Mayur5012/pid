import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Protected from "./components/Protected";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Forgotpassword from "./components/Forgotpassword";
import ResetPassword from "./components/Resetpassword";
import Dashboard from "./components/Dashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<Forgotpassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
};

export default App;
