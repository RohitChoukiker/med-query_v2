import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Stethoscope, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  forceVisible?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ forceVisible = false }) => {
  const { user, logout } = useAuth();
  const isNavbarVisible = forceVisible || true;
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setProfileOpen(false);
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleKey);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [profileOpen]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: isNavbarVisible ? 0 : -100 }}
      transition={{ duration: 0.3 }}
      className="fixed w-full top-0 z-50 backdrop-blur-xl 
                 bg-surface-light/80 dark:bg-black/60 
                 border-b border-light-border/50 dark:border-dark-border/50 
                 shadow-professional dark:shadow-professional-dark 
                 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Medical Logo (clickable: navigate home) */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 focus:outline-none"
            aria-label="Go to home"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-blue-light dark:to-accent-blue-dark rounded-lg flex items-center justify-center shadow-medical dark:shadow-medical-dark">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-accent-blue-light dark:from-brand-400 dark:to-accent-blue-dark bg-clip-text text-transparent">
              MedQuery Agent
            </span>
            {user && (
              <span className="hidden sm:inline-flex items-center px-2 py-1 bg-brand-100/50 dark:bg-brand-900/30 rounded-full text-xs font-medium text-brand-700 dark:text-brand-300">
                Medical AI Platform
              </span>
            )}
          </button>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">
            {/* Medical User Menu - Only show when authenticated */}
            {user && (
              <>
                <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  aria-haspopup="true"
                  aria-expanded={profileOpen}
                  className="flex items-center space-x-3 rounded-lg p-2 transition-all focus:outline-none"
                >
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                      {user?.full_name}
                    </p>
                    <p className="text-xs text-light-text-muted dark:text-dark-text-muted capitalize flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-1 ${
                        user?.role === 'doctor' ? 'bg-brand-500' :
                        user?.role === 'researcher' ? 'bg-accent-purple-light' :
                        user?.role === 'patient' ? 'bg-accent-green-light' :
                        'bg-accent-orange-light'
                      }`}></span>
                      {user?.role}
                    </p>
                  </div>

                  <motion.div
                    className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-blue-light dark:to-accent-blue-dark rounded-full flex items-center justify-center shadow-medical dark:shadow-medical-dark"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <User className="w-4 h-4 text-white" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-dark/90 border border-light-border/30 dark:border-dark-border/30 rounded-lg shadow-lg overflow-hidden z-50"
                      role="menu"
                      aria-label="User menu"
                    >
                        <div className="px-4 py-3 flex items-start space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-accent-blue-light dark:to-accent-blue-dark rounded-full flex items-center justify-center shadow-sm">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary truncate">{user.full_name}</p>
                            <p className="text-xs text-light-text-muted dark:text-dark-text-muted truncate">{user.email}</p>
                           
                           
                           
                          </div>
                        </div>
                        <div className="px-2">
                          <div className="flex items-center justify-between px-2 py-1 text-xs text-light-text-muted dark:text-dark-text-muted">
                            <span className="capitalize">{user.role}</span>
                            <span className="text-emerald-500 text-xs font-semibold">● OK</span>
                          </div>
                        </div>
                        <div className="border-t border-light-border/20 dark:border-dark-border/20" />
                      <button
                        onClick={() => { navigate('/profile'); setProfileOpen(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-surface-light/60 dark:hover:bg-surface-dark/60 flex items-center space-x-2"
                        role="menuitem"
                      >
                        <User className="w-4 h-4" />
                        <span>View Profile</span>
                      </button>
                      <button
                        onClick={() => { navigate('/settings'); setProfileOpen(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-surface-light/60 dark:hover:bg-surface-dark/60 flex items-center space-x-2"
                        role="menuitem"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      <div className="border-t border-light-border/20 dark:border-dark-border/20" />
                      <button
                        onClick={() => { logout(); setProfileOpen(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-surface-light/60 dark:hover:bg-surface-dark/60 flex items-center space-x-2 text-red-600"
                        role="menuitem"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

                <motion.button
                  onClick={() => { logout(); setProfileOpen(false); }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Logout"
                  className="p-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-medical-emergency transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </>
            )}
          </div>
          
          {/* we keep left logo; the right side (theme toggle, profile and logout) stays unchanged */}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;