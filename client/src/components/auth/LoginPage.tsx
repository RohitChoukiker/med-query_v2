import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Stethoscope, Microscope, Heart, Activity } from 'lucide-react';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../common/Navbar';

interface LoginPageProps {
  onSwitchToSignup?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('doctor');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberSession, setRememberSession] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const roleCredentials: Record<UserRole, { email: string; password: string }> = {
    doctor: { email: 'doctor@gmail.com', password: 'Doctor@123' },
    researcher: { email: 'researcher@gmail.com', password: 'Researcher@123' },
    patient: { email: 'patient@gmail.com', password: 'Patient@123' },
    admin: { email: 'airohit@protonmail.com', password: 'Rohit@123' }
  };

  const roles = [
    { 
      id: 'doctor' as UserRole, 
      label: 'Medical Doctor', 
      icon: Stethoscope, 
      color: 'from-brand-500 to-accent-blue-light dark:to-accent-blue-dark',
      description: 'Clinical Practice & Patient Care'
    },
    { 
      id: 'researcher' as UserRole, 
      label: 'Medical Researcher', 
      icon: Microscope, 
      color: 'from-accent-purple-light to-pink-500 dark:from-accent-purple-dark dark:to-pink-400',
      description: 'Research & Clinical Studies'
    },
    { 
      id: 'patient' as UserRole, 
      label: 'Patient', 
      icon: Heart, 
      color: 'from-accent-green-light to-brand-600 dark:from-accent-green-dark dark:to-brand-500',
      description: 'Health Information & Guidance'
    }
    // ,
    // { 
    //   id: 'admin' as UserRole, 
    //   label: 'System Administrator', 
    //   icon: Shield, 
    //   color: 'from-accent-orange-light to-red-500 dark:from-accent-orange-dark dark:to-red-400',
    //   description: 'Platform Management & Analytics'
    // },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all medical credentials');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email, password, selectedRole, { remember: rememberSession });
      if (success) {
        toast.success(`Welcome to MedQuery Agent, ${selectedRole}!`);
        
        // Role-based redirect
        switch (selectedRole) {
          case 'doctor':
            navigate('/dashboard');
            break;
          case 'researcher':
            navigate('/dashboard');
            break;
          case 'patient':
            navigate('/dashboard');
            break;
          case 'admin':
            navigate('/dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      
      // Show specific error message from backend
      let errorMessage = 'Medical system login failed. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const applyRoleCredentials = (role: UserRole) => {
    setSelectedRole(role);
    const creds = roleCredentials[role];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password);
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const fillDoctorCredentials = () => applyRoleCredentials('doctor');
  const fillResearcherCredentials = () => applyRoleCredentials('researcher');
  const fillPatientCredentials = () => applyRoleCredentials('patient');
 

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  return (
    <>
      <Navbar forceVisible />
      <div className="min-h-screen bg-white/10 rounded-t-2xl dark:bg-dark-bg transition-colors duration-300 flex items-center justify-center px-4 pb-6 pt-32 font-medical relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full"
      >
        {/* Medical Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 bg-gradient-to-br from-brand-500 to-accent-blue-light dark:to-accent-blue-dark rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-medical dark:shadow-medical-dark"
          >
            <Stethoscope className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-600 to-accent-blue-light dark:from-brand-400 dark:to-accent-blue-dark bg-clip-text text-transparent mb-2">
            MedQuery Agent
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            AI-Powered Medical Intelligence Platform
          </p>
         
        </div>

        {/* Medical Login Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 dark:bg-surface-dark/80 backdrop-blur-xl rounded-2xl border border-light-border/50 dark:border-dark-border/50 shadow-medical dark:shadow-medical-dark p-8 w-full h-full"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Medical Role Selection */}
            <div>
              <div className="flex flex-col gap-2 mb-3">
                <div className="flex items-center justify-between">
                 
                  <button
                    type="button"
                    onClick={togglePopup}
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Click here for sample login
                  </button>
                </div>
              </div>
              <div className="flex gap-3 w-full overflow-x-auto pb-2">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <motion.button
                      key={role.id}
                      type="button"
                      onClick={() => applyRoleCredentials(role.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-1 min-w-[180px] p-4 rounded-xl border-2 transition-all duration-300 ${
                        selectedRole === role.id
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/20 shadow-medical dark:shadow-medical-dark'
                          : 'border-light-border dark:border-dark-border bg-surface-light/30 dark:bg-surface-dark/30 hover:border-brand-300 dark:hover:border-brand-600'
                      }`}
                    >
                      <div className={`w-10 h-10 bg-gradient-to-r ${role.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary block mb-1">
                        {role.label}
                      </span>
                      <span className="text-xs text-light-text-muted dark:text-dark-text-muted">
                        {role.description}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

           

            {/* Medical Email and Password Input */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Medical Email Input */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Medical Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.com"
                  className="w-full px-4 py-3 bg-surface-light/50 dark:bg-surface-dark/50 border border-light-border/50 dark:border-dark-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all text-light-text-primary dark:text-dark-text-primary placeholder-light-text-muted dark:placeholder-dark-text-muted"
                  required
                />
              </div>

              {/* Medical Password Input */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Secure Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your secure password"
                    className="w-full px-4 py-3 bg-surface-light/50 dark:bg-surface-dark/50 border border-light-border/50 dark:border-dark-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all pr-12 text-light-text-primary dark:text-dark-text-primary placeholder-light-text-muted dark:placeholder-dark-text-muted"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-text-muted dark:text-dark-text-muted hover:text-light-text-secondary dark:hover:text-dark-text-secondary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Medical Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-brand-500 to-accent-blue-light dark:to-accent-blue-dark text-white py-3 rounded-xl font-medium transition-all hover:shadow-medical dark:hover:shadow-medical-dark disabled:opacity-50 disabled:cursor-not-allowed shadow-professional flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>Access Medical Platform</span>
                </>
              )}
            </motion.button>

            {/* Signup Link */}
            <div className="flex items-center justify-between mt-2">
              <label className="inline-flex items-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
                <input
                  type="checkbox"
                  checked={rememberSession}
                  onChange={(e) => setRememberSession(e.target.checked)}
                  className="mr-2 rounded"
                />
                Remember this device
              </label>
            </div>

            <div className="text-center">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                New to MedQuery Agent?{' '}
                <button
                  type="button"
                  onClick={onSwitchToSignup}
                  className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
                >
                  Create medical account
                </button>
              </p>
            </div>
          </form>
        </motion.div>
      </motion.div>

      {/* Popups Box Container */}
      <div 
        className="absolute top-20 right-4 bg-white dark:bg-dark-bg shadow-lg rounded-lg p-1 border border-light-border/50 dark:border-dark-border/50 hover:shadow-xl hover:border-brand-500  cursor-pointer"
        style={{ width: '200px' }}
        onClick={togglePopup}
      >
        
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={isPopupOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-1 gap-2">
            {/* Popup for Doctor Credentials */}
            <div 
              className="bg-white dark:bg-dark-bg shadow-md rounded-md p-2 border border-light-border/50 dark:border-dark-border/50 cursor-pointer hover:border-gray-400 hover:shadow-lg transition-all duration-500 ease-in-out"
              onClick={fillDoctorCredentials}
            >
              <h4 className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">Doctor</h4>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                <strong>Email:</strong> doctor@gmail.com
              </p>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                <strong>Password:</strong> Doctor@123
              </p>
            </div>

            {/* Popup for Researcher Credentials */}
            <div 
              className="bg-white dark:bg-dark-bg shadow-md rounded-md p-2 border border-light-border/50 dark:border-dark-border/50 cursor-pointer hover:border-gray-400 hover:shadow-lg transition-all duration-500 ease-in-out"
              onClick={fillResearcherCredentials}
            >
              <h4 className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">Researcher</h4>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                <strong>Email:</strong> researcher@gmail.com
              </p>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                <strong>Password:</strong> Researcher@123
              </p>
            </div>

            {/* Popup for Patient Credentials */}
            <div 
              className="bg-white dark:bg-dark-bg shadow-md rounded-md p-2 border border-light-border/50 dark:border-dark-border/50 cursor-pointer hover:border-gray-400 hover:shadow-lg transition-all duration-500 ease-in-out"
              onClick={fillPatientCredentials}
            >
              <h4 className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">Patient</h4>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                <strong>Email:</strong> patient@gmail.com
              </p>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                <strong>Password:</strong> Patient@123
              </p>
            </div>

            {/* Popup for Admin Credentials */}
           
          </div>
        </motion.div>
      </div>
      </div>
    </>
  );
};

export default LoginPage;