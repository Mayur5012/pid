import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMail, HiCheckCircle } from 'react-icons/hi';
import InteractiveBackground from './Interactibebg';
import logo from "../assests/logo.png";
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:8000/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage('Password reset email sent successfully!');
        setError('');
      } else {
        setError(data.message || 'Error occurred');
      }
    } catch (error) {
      setError('Failed to send reset email');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <InteractiveBackground />

      {/* Forgot Password Card */}
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
                Forgot Password
              </h1>
              <p className="text-gray-600 mt-2 text-center">
                Enter your email address below and we'll send you a link to reset your password.
              </p>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center text-gray-400 group-hover:text-blue-500 transition-colors">
                  <HiMail size={20} />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-50/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  required
                />
              </div>
            </motion.div>

            {/* Success and Error Messages */}
            <AnimatePresence>
              {(message || error) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-4 p-3 rounded-lg flex items-center ${
                    message ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}
                >
                  {message && <HiCheckCircle className="mr-2" size={20} />}
                  {message || error}
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
              Send Reset Link
            </motion.button>

            {/* Back to Login Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mt-6"
            >
              Remember your password?
              <Link
                to="/login"
                className="text-blue-600 ml-2 hover:text-blue-700 font-medium transition-colors"
              >
                Back to Login
              </Link>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;