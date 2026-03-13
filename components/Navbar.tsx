import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Activity, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar = () => {
  const { currentUser, logout } = useData();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-primary shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white tracking-wide">MediConnect</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <div className="flex items-center space-x-2 text-teal-100">
                  <UserIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">{currentUser.name} ({currentUser.role})</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-teal-800 hover:bg-teal-900 text-white px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex space-x-4">
                 <Link to="/login" className="text-teal-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-white text-primary hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-medium transition">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};