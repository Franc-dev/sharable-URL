"use client"
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

const LoginRegister = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState({ type: '', content: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (activeTab === 'register' && !name) newErrors.name = 'Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', content: '' });
    if (validateForm()) {
      setIsLoading(true);
      try {
        if (activeTab === 'login') {
          await login(email, password);
          setMessage({ type: 'success', content: 'Login successful!' });
        } else {
          await register(email, password);
          setMessage({ type: 'success', content: 'Registration successful!' });
        }
        // Redirect or further actions can be added here
      } catch (error) {
        if (error instanceof Error) {
          setMessage({ type: 'error', content: error.message || 'An error occurred. Please try again.' });
        } else {
          setMessage({ type: 'error', content: 'An unexpected error occurred. Please try again.' });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="flex mb-6">
            <button
              className={`flex-1 py-2 text-lg font-semibold ${activeTab === 'login' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-400'}`}
              onClick={() => {
                setActiveTab('login');
                setErrors({});
                setMessage({ type: '', content: '' });
              }}
              disabled={isLoading}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 text-lg font-semibold ${activeTab === 'register' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-400'}`}
              onClick={() => {
                setActiveTab('register');
                setErrors({});
                setMessage({ type: '', content: '' });
              }}
              disabled={isLoading}
            >
              Register
            </button>
          </div>

          {message.content && (
            <div className={`mb-4 p-2 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.content}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.form
              key={activeTab}
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {activeTab === 'register' && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prevErrors) => ({ ...prevErrors, name: '' }));
                    }}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                               ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your name"
                    disabled={isLoading}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prevErrors) => ({ ...prevErrors, email: '' }));
                  }}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                             ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prevErrors) => ({ ...prevErrors, password: '' }));
                  }}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                             ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>
              <button
                type="submit"
                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-150 ease-in-out flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    {activeTab === 'login' ? 'Logging in...' : 'Registering...'}
                  </>
                ) : (
                  activeTab === 'login' ? 'Login' : 'Register'
                )}
              </button>
            </motion.form>
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default LoginRegister;