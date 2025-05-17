import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, User, LogOut, Crown } from 'lucide-react';

const Header = () => {
  const { user, logout, setShowAuthModal } = useAuth();
  const navigate = useNavigate();
  
  const handleLoginClick = () => {
    navigate('/pricing');
  };
  
  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <MessageSquare className="text-blue-600 mr-2" size={28} />
          <span className="text-2xl font-bold text-blue-600">BLUC</span>
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="text-right mr-4">
            <div className="text-md font-semibold">Talk to strangers!</div>
            <div className="text-sm text-green-500 flex items-center">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              <span className="font-medium">{Math.floor(30000 + Math.random() * 5000)}</span>
              <span className="text-gray-500 ml-1">online now</span>
            </div>
          </div>
          
          {user ? (
            <div className="flex items-center">
              {user.isPremium && (
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center mr-3">
                  <Crown size={16} className="mr-1 text-yellow-600" />
                  <span className="text-sm font-medium">Premium</span>
                </div>
              )}
              
              <Link to="/profile" className="bluc-btn-secondary mr-2 flex items-center">
                <User size={18} className="mr-1" />
                <span>Profile</span>
              </Link>
              
              <button 
                onClick={handleLogoutClick}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLoginClick}
              className="bluc-btn-primary flex items-center"
            >
              <Crown size={18} className="mr-2" />
              Premium
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;