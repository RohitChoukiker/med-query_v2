import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/landing/LandingPage';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import ChatInterface from './components/chat/ChatInterface';
import AIMedicalAssistant from './components/chat/AIMedicalAssistant';
import DoctorDashboard from './components/dashboards/DoctorDashboard';
import ResearcherDashboard from './components/dashboards/ResearcherDashboard';
import PatientDashboard from './components/dashboards/PatientDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import MedicalLibrary from './components/dashboards/MedicalLibrary';
import FileUpload from './components/common/FileUpload';

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Sync activeTab with current route
  React.useEffect(() => {
    const path = location.pathname.substring(1); // Remove leading slash
    if (path && path !== 'login' && path !== 'signup') {
      setActiveTab(path);
    }
  }, [location.pathname]);
  
  // Use React Router for navigation
  // Show authentication flow if not authenticated
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={
          <>
            <Navbar showThemeToggle={true} />
            <LoginPage 
              onSwitchToSignup={() => navigate('/signup')}
            />
          </>
        } />
        <Route path="/signup" element={
          <>
            <Navbar showThemeToggle={true} />
            <SignupPage 
              onBackToLanding={() => navigate('/')}
              onSwitchToLogin={() => navigate('/login')}
            />
          </>
        } />
        <Route path="/" element={
          <>
            <Navbar showThemeToggle={true} />
            <LandingPage 
              onLoginClick={() => navigate('/login')}
              onSignupClick={() => navigate('/signup')}
            />
          </>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  const renderChatExperience = () => {
    if (user?.role === 'researcher' || user?.role === 'patient') {
      const headerCopy =
        user?.role === 'researcher'
          ? {
              title: 'AI Research Assistant',
              description: 'Ask contextual research questions grounded in your uploaded datasets.',
            }
          : {
              title: 'AI Medical Assistant',
              description: 'Ask health questions powered by your shared medical documents.',
            };

      return (
        <div className="p-6 h-full flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
              {headerCopy.title}
            </h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              {headerCopy.description}
            </p>
          </motion.div>
          <div className="flex-1 min-h-[520px]">
            <AIMedicalAssistant />
          </div>
        </div>
      );
    }

    return <ChatInterface />;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        switch (user?.role) {
          case 'doctor':
            return <DoctorDashboard />;
          case 'researcher':
            return <ResearcherDashboard />;
          case 'patient':
            return <PatientDashboard />;
          case 'admin':
            return <AdminDashboard />;
          default:
            return <DoctorDashboard />;
        }
      case 'chat':
        return renderChatExperience();
      case 'upload':
      case 'datasets':
        return (
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                {activeTab === 'upload' ? 'Upload Patient Reports' : 'Upload Research Datasets'}
              </h1>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                {activeTab === 'upload' 
                  ? 'Upload patient reports and medical documents for AI analysis.'
                  : 'Upload research datasets and clinical papers for analysis.'}
              </p>
            </motion.div>
            <FileUpload />
          </div>
        );
      case 'history':
        return (
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                Query History
              </h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                View your previous medical queries and AI responses.
              </p>
            </motion.div>
          </div>
        );
      case 'bookmarks':
        return (
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                Bookmarked Answers
              </h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                Access your saved medical insights and answers.
              </p>
            </motion.div>
          </div>
        );
      case 'library':
        return <MedicalLibrary />;
      case 'analytics':
        return (
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                Analytics Dashboard
              </h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                View detailed analytics and insights from your queries.
              </p>
            </motion.div>
          </div>
        );
      case 'users':
        return (
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                User Management
              </h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                Manage users, roles, and permissions across the platform.
              </p>
            </motion.div>
          </div>
        );
      case 'guidelines':
        return (
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                Global Guidelines
              </h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                Manage hospital guidelines and medical protocols.
              </p>
            </motion.div>
          </div>
        );
      case 'hipaa':
        return (
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                HIPAA Compliance
              </h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                Monitor and ensure HIPAA compliance across all operations.
              </p>
            </motion.div>
          </div>
        );
      case 'health-tips':
        return (
          <div className="p-6 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-2xl p-6 border border-green-200/20 dark:border-green-700/20"
            >
              <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                Health Guidance & Wellness
              </h1>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                Expert-curated health tips, preventive care advice, and wellness strategies for your daily life.
              </p>
            </motion.div>

            {/* Daily Health Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
                  Daily Health Tips
                </h2>
                <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                  Updated Daily
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    id: 1,
                    title: 'Stay Hydrated',
                    description: 'Drink at least 8 glasses of water daily for optimal health and energy levels.',
                    source: 'WHO Guidelines',
                    image: 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=400',
                    tip: 'Start your day with a glass of water and keep a bottle nearby.'
                  },
                  {
                    id: 2,
                    title: 'Regular Exercise',
                    description: '30 minutes of moderate exercise can improve your overall well-being and mental health.',
                    source: 'CDC Recommendations',
                    image: 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=400',
                    tip: 'Take the stairs, walk during breaks, or do a quick home workout.'
                  },
                  {
                    id: 3,
                    title: 'Balanced Diet',
                    description: 'Include fruits, vegetables, and whole grains in your daily meals for better nutrition.',
                    source: 'Mayo Clinic',
                    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
                    tip: 'Fill half your plate with vegetables, quarter with protein, quarter with grains.'
                  },
                ].map((tip) => (
                  <div
                    key={tip.id}
                    className="bg-gradient-to-br from-green-50/50 to-teal-50/50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-green-200/20 dark:border-green-700/20 hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={tip.image}
                      alt={tip.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                      {tip.title}
                    </h3>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-3">
                      {tip.description}
                    </p>
                    <div className="bg-white/70 dark:bg-black/30 border border-gray-200/50 dark:border-gray-700/50 rounded-lg px-3 py-2 mb-3">
                      <p className="text-xs text-light-text-primary dark:text-dark-text-primary">
                        <span className="font-semibold text-green-600 dark:text-green-400">💡 Tip: </span>
                        {tip.tip}
                      </p>
                    </div>
                    <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                      {tip.source}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Wellness Checklist */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
            >
              <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                Personal Wellness Checklist
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: 1,
                    title: 'Daily Movement',
                    description: 'Aim for at least 30 minutes of light-to-moderate activity to keep joints flexible and boost mood.',
                    tip: 'Break it into 10-minute walks after meals.',
                    icon: '🏃',
                    badge: 'Routine'
                  },
                  {
                    id: 2,
                    title: 'Balanced Meals',
                    description: 'Fill half your plate with colorful vegetables, add lean protein, and choose whole grains.',
                    tip: 'Plan Sunday meal prep to stay consistent.',
                    icon: '🥗',
                    badge: 'Nutrition'
                  },
                  {
                    id: 3,
                    title: 'Rest & Recovery',
                    description: 'Your body repairs itself during sleep—target 7–8 hours and keep bedtime consistent.',
                    tip: 'Power down screens 45 minutes before bed.',
                    icon: '😴',
                    badge: 'Sleep'
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                        <span className="text-2xl">{item.icon}</span>
                        {item.title}
                      </div>
                      <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/30 text-gray-600 dark:text-gray-300">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-3">
                      {item.description}
                    </p>
                    <div className="text-xs text-light-text-primary dark:text-dark-text-primary bg-white/70 dark:bg-black/30 border border-gray-200/50 dark:border-gray-700/50 rounded-lg px-3 py-2">
                      <span className="font-semibold text-green-600 dark:text-green-400 mr-1">Pro tip:</span>
                      {item.tip}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Preventive Care */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
            >
              <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                Preventive Care Guidelines
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    id: 1,
                    title: 'Regular Check-ups',
                    description: 'Schedule annual physical exams and screenings as recommended by your healthcare provider.',
                    frequency: 'Annual',
                    icon: '🩺'
                  },
                  {
                    id: 2,
                    title: 'Vaccinations',
                    description: 'Stay up-to-date with recommended vaccinations including flu shots and COVID-19 boosters.',
                    frequency: 'As recommended',
                    icon: '💉'
                  },
                  {
                    id: 3,
                    title: 'Mental Health',
                    description: 'Prioritize mental wellness through stress management, meditation, or professional support.',
                    frequency: 'Daily practices',
                    icon: '🧘'
                  },
                  {
                    id: 4,
                    title: 'Screenings',
                    description: 'Follow age-appropriate screening guidelines for cancer, diabetes, and heart disease.',
                    frequency: 'As per guidelines',
                    icon: '🔍'
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-purple-500/10 to-pink-500/10"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{item.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                            {item.title}
                          </h3>
                          <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                            {item.frequency}
                          </span>
                        </div>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Health Facts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-200/20 dark:border-blue-700/20"
            >
              <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                Quick Health Facts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { fact: '8 hours', label: 'Recommended Sleep' },
                  { fact: '2.5L', label: 'Daily Water Intake' },
                  { fact: '30 min', label: 'Daily Exercise' },
                  { fact: '5-9', label: 'Daily Fruit & Veg Servings' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="text-center p-4 bg-white/50 dark:bg-black/30 rounded-lg border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      {item.fact}
                    </p>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        );
      case 'tags':
        return (
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                Manage Tags
              </h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                Organize and manage document tags for better categorization.
              </p>
            </motion.div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                Settings
              </h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                Customize your preferences and account settings.
              </p>
            </motion.div>
          </div>
        );
      default:
        return (
          <div className="p-6 flex items-center justify-center h-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                Coming Soon
              </h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                This feature is under development.
              </p>
            </motion.div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      <Navbar />
      <div className="pt-16 h-[calc(100vh-4rem)]">
        <div className="flex h-[calc(100vh-4rem)]">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="flex-1 overflow-y-auto h-full">
          <Routes>
            <Route path="/dashboard" element={renderContent()} />
            <Route path="/chat" element={renderChatExperience()} />
            <Route path="/upload" element={renderContent()} />
            <Route path="/datasets" element={renderContent()} />
            <Route path="/history" element={renderContent()} />
            <Route path="/bookmarks" element={renderContent()} />
            <Route path="/library" element={renderContent()} />
            <Route path="/analytics" element={renderContent()} />
            <Route path="/users" element={renderContent()} />
            <Route path="/guidelines" element={renderContent()} />
            <Route path="/hipaa" element={renderContent()} />
            <Route path="/health-tips" element={renderContent()} />
            <Route path="/tags" element={renderContent()} />
            <Route path="/settings" element={renderContent()} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/*" element={<AppContent />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'rgba(30, 41, 59, 0.9)',
                color: '#F8FAFC',
                border: '1px solid rgba(51, 65, 85, 0.3)',
                borderRadius: '12px',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;