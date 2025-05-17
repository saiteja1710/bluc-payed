import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const LoginForm = ({ onSuccess }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(formData.email, formData.password);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="bluc-input"
          placeholder="your@email.com"
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="bluc-input"
          placeholder="••••••••"
          required
        />
      </div>
      
      <div className="flex justify-end mb-4">
        <button 
          type="button"
          className="text-blue-600 text-sm font-medium hover:underline"
        >
          Forgot password?
        </button>
      </div>
      
      <button
        type="submit"
        className="bluc-btn-primary w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
      
      <div className="mt-4 text-center">
        <p className="text-gray-600">Or continue with</p>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <button 
            type="button"
            className="border border-gray-300 rounded-lg py-2 flex items-center justify-center hover:bg-gray-50"
          >
            <img src="https://cdn.jsdelivr.net/npm/simple-icons@v4/icons/google.svg" className="w-5 h-5" alt="Google" />
          </button>
          <button 
            type="button"
            className="border border-gray-300 rounded-lg py-2 flex items-center justify-center hover:bg-gray-50"
          >
            <img src="https://cdn.jsdelivr.net/npm/simple-icons@v4/icons/facebook.svg" className="w-5 h-5" alt="Facebook" />
          </button>
          <button 
            type="button"
            className="border border-gray-300 rounded-lg py-2 flex items-center justify-center hover:bg-gray-50"
          >
            <img src="https://cdn.jsdelivr.net/npm/simple-icons@v4/icons/apple.svg" className="w-5 h-5" alt="Apple" />
          </button>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;