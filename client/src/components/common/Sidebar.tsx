import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  Upload, 
  BookOpen, 
  Settings, 
  Users,
  FileText,
  Heart,
  Brain,
  Shield,
  Activity,
  Stethoscope
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getMenuItems = () => {
    const commonItems = [
      { id: 'dashboard', label: 'Medical Dashboard', icon: Home, description: 'Overview & Analytics' },
      { id: 'chat', label: 'AI Assistant', icon: MessageSquare, description: 'Ask Medical Questions' },
    ];

    switch (user?.role) {
      case 'doctor':
        return [
          ...commonItems,
          { id: 'upload', label: 'Patient Reports', icon: Upload, description: 'Upload Medical Files' },
         
         
        ];
      
      case 'researcher':
        return [
          ...commonItems,
          { id: 'datasets', label: 'Research Datasets', icon: Upload, description: 'Clinical Data Upload' },
          { id: 'library', label: 'Medical Library', icon: BookOpen, description: 'Research Documents' },
         // { id: 'analytics', label: 'Research Analytics', icon: BarChart3, description: 'Data Insights' },
         // { id: 'tags', label: 'Medical Tags', icon: Tag, description: 'Categorization System' },
          //{ id: 'settings', label: 'Research Settings', icon: Settings, description: 'Platform Configuration' },
        ];
      
      case 'patient':
        return [
          ...commonItems,
          { id: 'health-tips', label: 'Health Guidance', icon: Heart, description: 'Wellness Tips & Advice' },
         // { id: 'bookmarks', label: 'Saved Health Info', icon: BookOpen, description: 'Important Answers' },
       
        ];
      
      case 'admin':
        return [
          ...commonItems,
          { id: 'users', label: 'User Management', icon: Users, description: 'Healthcare Staff Control' },
          // { id: 'analytics', label: 'System Analytics', icon: BarChart3, description: 'Platform Metrics' },
          // { id: 'guidelines', label: 'Medical Guidelines', icon: FileText, description: 'Clinical Protocols' },
          // { id: 'hipaa', label: 'HIPAA Compliance', icon: Shield, description: 'Privacy & Security' },
          // { id: 'settings', label: 'System Configuration', icon: Settings, description: 'Platform Management' },
        ];
      
      default:
        return commonItems;
    }
  };

  const menuItems = getMenuItems();

  const getRoleInfo = () => {
    switch (user?.role) {
      case 'doctor':
        return { icon: Stethoscope, label: 'Dashboard', color: 'from-brand-500 to-accent-blue-light dark:to-accent-blue-dark' };
      case 'researcher':
        return { icon: Brain, label: 'Research Portal', color: 'from-accent-blue-light to-accent-blue-dark' };
      case 'patient':
        return { icon: Heart, label: 'Health Portal', color: 'from-accent-green-light to-brand-600 dark:from-accent-green-dark dark:to-brand-500' };
      case 'admin':
        return { icon: Shield, label: 'Admin Console', color: 'from-accent-orange-light to-red-500 dark:from-accent-orange-dark dark:to-red-400' };
      default:
        return { icon: Activity, label: 'Medical Portal', color: 'from-brand-500 to-accent-blue-light dark:to-accent-blue-dark' };
    }
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-16 md:w-64 h-full bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-xl border-r border-light-border/50 dark:border-dark-border/50 overflow-y-auto shadow-professional dark:shadow-professional-dark"
    >
      <div className="p-2 md:p-6 flex flex-col items-center md:items-start">
        {/* Medical Role Badge */}
        <div className={`mb-6 p-2 md:p-4 bg-gradient-to-br ${roleInfo.color} rounded-2xl shadow-medical dark:shadow-medical-dark w-full flex items-center justify-center md:justify-start`}> 
          <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
            <RoleIcon className="w-5 h-5 text-white" />
          </div>
          <div className="hidden md:block ml-3">
            <p className="text-white font-semibold text-sm">{roleInfo.label}</p>
            <p className="text-white/80 text-xs capitalize">{user?.full_name || user?.email}</p>
          </div>
        </div>

        {/* Medical Navigation Menu */}
        <div className="space-y-2 w-full">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || location.pathname === `/${item.id}`;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  navigate(`/${item.id}`);
                }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
                  isActive || location.pathname === `/${item.id}`
                    ? 'bg-gradient-to-r from-brand-500/10 to-accent-blue-light/10 dark:to-accent-blue-dark/10 text-brand-600 dark:text-brand-400 border border-brand-200/20 dark:border-brand-700/20 shadow-medical dark:shadow-medical-dark'
                    : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-surface-light/70 dark:hover:bg-surface-dark/70 hover:text-light-text-primary dark:hover:text-dark-text-primary border border-transparent hover:border-light-border/30 dark:hover:border-dark-border/30'
                }`}
              >
                <div className="flex items-center md:space-x-3 justify-center md:justify-start px-0 md:px-4 py-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-gradient-to-br from-brand-500 to-accent-blue-light dark:to-accent-blue-dark shadow-lg' 
                      : 'bg-light-text-muted/10 dark:bg-dark-text-muted/10 group-hover:bg-brand-100/50 dark:group-hover:bg-brand-900/30'
                  }`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-current'}`} />
                  </div>
                  <div className="hidden md:block flex-1 text-left">
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs opacity-70">{item.description}</p>
                  </div>
                </div>
                
                {/* Active Indicator for md screens */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="hidden md:block absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-500 to-accent-blue-light dark:to-accent-blue-dark rounded-l-full"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Medical Status Indicator (hidden on small screens, full on md+) */}
        <div className="mt-6 w-full hidden md:block">
          <div className="flex items-center md:flex-col md:items-start justify-center md:justify-start p-2 md:p-4 bg-gradient-to-br from-accent-green-light/10 to-brand-50/50 dark:from-accent-green-dark/10 dark:to-brand-900/20 rounded-xl border border-accent-green-light/20 dark:border-accent-green-dark/20 w-full">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 bg-accent-green-light rounded-full animate-pulse" />
              <span className="hidden md:inline-block text-xs font-medium text-accent-green-light dark:text-accent-green-dark">
                System Status
              </span>
            </div>

            <p className="hidden md:block text-xs text-light-text-muted dark:text-dark-text-muted mt-2 md:mt-3">
              All medical systems operational
            </p>

            {/* Small badge for mobile */}
            <span className="md:hidden ml-3 text-[10px] px-2 py-1 rounded-full bg-accent-green-light/20 text-accent-green-light font-semibold">
              OK
            </span>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;