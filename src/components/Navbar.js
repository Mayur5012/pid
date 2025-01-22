import React from "react";
import { motion } from "framer-motion";
import { HiUserCircle, HiLogout } from "react-icons/hi";
import logo from "../assests/logo.png";

const Navbar = ({ username, onLogout }) => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md p-4 flex items-center justify-between"
    >
      {/* Logo Section */}
      <div className="flex items-center gap-4">
        <img src={logo} alt="Logo" className="w-auto h-14" />
        <h1 className="text-2xl font-bold text-gray-800">
          LOGICLENS
        </h1>
      </div>

      {/* User and Logout Section */}
      <div className="flex items-center gap-6">
        {/* Username */}
        <div className="flex items-center gap-2 ">
          <HiUserCircle className="text-blue-500 w-6 h-6" />
          <span className="text-gray-800 font-medium">{username || "User"}</span>
        </div>

        {/* Logout Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLogout}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition-all"
        >
          <HiLogout className="w-5 h-5" />
          Logout
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
