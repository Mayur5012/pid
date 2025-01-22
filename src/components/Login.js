import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiCheckCircle } from 'react-icons/hi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import InteractiveBackground from './Interactibebg';
import logo from "../assests/logo.png";

const Login = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (data) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.token) {
        localStorage.setItem('token', result.token);
        setSuccess('Login successful');
        setError('');
        // Redirect to the protected page they tried to visit or home
        const from = location.state?.from || '/';
        setTimeout(() => {
          navigate(from);
        }, 1000);
      } else {
        setError(result.message || 'Error occurred! Invalid Information.');
        setSuccess('');
      }
    } catch (err) {
      setError('Failed to login');
      setSuccess('');
    }
  };

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className="relative min-h-screen font-roboto flex items-center justify-center overflow-hidden">
      <InteractiveBackground />

      {/* Login Card */}
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
                LOGICLENS
              </h1>
              <p className="text-gray-600 text-center mt-2">Your virtual lookout partner.</p>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-50/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </motion.div>


             {/* Forgot Password route  */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Password Input */}
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
                 type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-50/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-blue-500 transition-colors focus:outline-none"
              >
                {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
              </button>
              </div>
              
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
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

            {/* Login Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
              type="submit"
            >
              Login
            </motion.button>

            {/* Sign Up Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mt-6"
            >
              Don't have an account?
              <Link
                to="/signup"
                className="text-blue-600 ml-2 hover:text-blue-700 font-medium transition-colors"
              >
                Sign Up
              </Link>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;