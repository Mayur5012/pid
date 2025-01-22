import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiLockClosed,HiEye, HiEyeOff, HiCheckCircle } from 'react-icons/hi';
import InteractiveBackground from './Interactibebg';
import logo from "../assests/logo.png";


const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState('');

  const token = new URLSearchParams(location.search).get('token');
  const email = new URLSearchParams(location.search).get('email');

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid or expired reset link.');
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, token }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('Password reset successful');
        setError('');
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      } else {
        setError(data.message || 'Error occurred');
      }
    } catch (error) {
      setError('Failed to reset password');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <InteractiveBackground />

      {/* Reset Password Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md mx-4"
      >
        <div className="backdrop-blur-sm bg-white/95 scale-90 shadow-xl rounded-xl p-6">
          {/* Logo Section */}
          <motion.div 
            className="flex flex-col items-center justify-center mb-8 space-x-4"
            whileHover={{ scale: 1.05 }}
          >
            <img
              src={logo}
              alt="LogicLens Logo"
              className="w-auto h-20"
            />
            <div>
              <h1 className="text-3xl text-center font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
                Reset Password
              </h1>
              <p className="text-gray-600 mt-2 text-center">Enter your new password below.</p>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center text-gray-400 group-hover:text-blue-500 transition-colors">
                  <HiLockClosed size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-50/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  required
                />
                  <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-blue-500 transition-colors focus:outline-none"
              >
                {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
              </button>
              </div>
            </motion.div>

            {/* Confirm Password Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center text-gray-400 group-hover:text-blue-500 transition-colors">
                  <HiLockClosed size={20} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-50/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  required
                />
                <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-blue-500 transition-colors focus:outline-none"
              >
                {showConfirmPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
              </button>
              </div>
            </motion.div>

            {/* Success and Error Messages */}
            <AnimatePresence>
              {(success || error) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-4 p-3 rounded-lg flex items-center ${
                    success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}
                >
                  {success && <HiCheckCircle className="mr-2" size={20} />}
                  {success || error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
              type="submit"
            >
              Reset Password
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;