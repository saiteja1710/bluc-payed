import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ProfileModal = ({ onClose, onSubmit }) => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || ''
  });
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleGenderSelect = (gender) => {
    setFormData(prev => ({ ...prev, gender }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic form validation
    if (!formData.fullName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!formData.dateOfBirth) {
      setError('Please enter your date of birth');
      return;
    }
    
    if (!formData.gender) {
      setError('Please select your gender');
      return;
    }
    
    try {
      // Update user profile with form data
      await updateProfile(formData);
      onSubmit();
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
  };
  
  return (
    <div className="bluc-modal">
      <div className="bluc-modal-content slide-up">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Complete Your Profile</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Full Name</label>
              <input 
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="bluc-input"
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Date of Birth</label>
              <input 
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="bluc-input"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Gender</label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`gender-option ${formData.gender === 'male' ? 'selected' : ''}`}
                  onClick={() => handleGenderSelect('male')}
                >
                  <span className="text-yellow-500 text-2xl mb-2">👨</span>
                  <span>Male</span>
                </div>
                <div 
                  className={`gender-option ${formData.gender === 'female' ? 'selected' : ''}`}
                  onClick={() => handleGenderSelect('female')}
                >
                  <span className="text-pink-500 text-2xl mb-2">👩</span>
                  <span>Female</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                type="button"
                onClick={onClose}
                className="bluc-btn-secondary flex-1"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bluc-btn-primary flex-1"
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;