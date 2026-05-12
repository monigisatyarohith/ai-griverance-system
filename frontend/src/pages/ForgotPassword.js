import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setIsEmailSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div>
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Check your email</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            We've sent a password reset link to <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <button
            onClick={() => setIsEmailSent(false)}
            className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
          >
            Try another email
          </button>
          <Link
            to="/login"
            className="flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium mt-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Forgot password?</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          No worries, we'll send you reset instructions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
          <div className="relative">
            <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
              placeholder="you@college.edu"
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all duration-300 shadow-lg shadow-blue-500/25"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Sending...</span>
            </div>
          ) : 'Send Reset Link'}
        </motion.button>
      </form>

      <Link
        to="/login"
        className="flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium mt-6"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        <span>Back to Sign In</span>
      </Link>
    </div>
  );
};

export default ForgotPassword;
