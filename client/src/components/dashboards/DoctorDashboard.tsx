import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, MessageSquare, Clock, Star, TrendingUp, FileText, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Types for stats
interface StatData {
  label: string;
  value: string;
  icon: any;
  change: string;
  isLoading?: boolean;
  trend: 'up' | 'down' | 'neutral';
}

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Dynamic stats state
  const [stats, setStats] = useState<StatData[]>([
    { label: 'Queries Today', value: '0', icon: MessageSquare, change: '0%', isLoading: true, trend: 'neutral' },
    { label: 'Reports Uploaded', value: '0', icon: Upload, change: '0%', isLoading: true, trend: 'neutral' },
    { label: 'Avg Response Time', value: '0s', icon: Clock, change: '0%', isLoading: true, trend: 'neutral' },
    { label: 'Accuracy Rating', value: '0/5', icon: Star, change: '0%', isLoading: true, trend: 'neutral' },
  ]);
  
  // const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate API call to fetch stats
  const fetchStats = async () => {
    setIsRefreshing(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Generate dynamic data
    const currentTime = new Date();
    const hour = currentTime.getHours();
    
    // Make stats more realistic based on time of day
    const baseQueries = Math.floor(Math.random() * 15) + (hour > 8 && hour < 18 ? 10 : 5);
    const baseReports = Math.floor(Math.random() * 20) + (hour > 9 && hour < 17 ? 15 : 8);
    const responseTime = (1.5 + Math.random() * 3).toFixed(1);
    const accuracy = (4.2 + Math.random() * 0.7).toFixed(1);
    
    // Calculate changes (simulate comparison with yesterday)
    const queriesChange = Math.floor(Math.random() * 30) - 10; // -10 to +20
    const reportsChange = Math.floor(Math.random() * 25) - 5;  // -5 to +20
    const responseChange = Math.floor(Math.random() * 30) - 15; // -15 to +15
    const accuracyChange = Math.floor(Math.random() * 10) - 2;  // -2 to +8
    
    const newStats: StatData[] = [
      {
        label: 'Queries Today',
        value: baseQueries.toString(),
        icon: MessageSquare,
        change: `${queriesChange > 0 ? '+' : ''}${queriesChange}%`,
        isLoading: false,
        trend: queriesChange > 0 ? 'up' : queriesChange < 0 ? 'down' : 'neutral'
      },
      {
        label: 'Reports Uploaded',
        value: baseReports.toString(),
        icon: Upload,
        change: `${reportsChange > 0 ? '+' : ''}${reportsChange}%`,
        isLoading: false,
        trend: reportsChange > 0 ? 'up' : reportsChange < 0 ? 'down' : 'neutral'
      },
      {
        label: 'Avg Response Time',
        value: `${responseTime}s`,
        icon: Clock,
        change: `${responseChange > 0 ? '+' : ''}${responseChange}%`,
        isLoading: false,
        trend: responseChange < 0 ? 'up' : responseChange > 0 ? 'down' : 'neutral' // Lower response time is better
      },
      {
        label: 'Accuracy Rating',
        value: `${accuracy}/5`,
        icon: Star,
        change: `${accuracyChange > 0 ? '+' : ''}${accuracyChange}%`,
        isLoading: false,
        trend: accuracyChange > 0 ? 'up' : accuracyChange < 0 ? 'down' : 'neutral'
      },
    ];
    
    setStats(newStats);
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  // Auto-refresh stats every 5 minutes
  useEffect(() => {
    fetchStats(); // Initial fetch
    
    const interval = setInterval(() => {
      fetchStats();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  // Handle quick action clicks
  const handleQuickAction = (action: string) => {
    navigate(`/${action}`);
  };

  // Handle recent query click
  const handleQueryClick = (queryId: number) => {
    // Navigate to chat with the specific query context
    navigate('/chat', { state: { queryId } });
  };

  // Manual refresh handler
  const handleRefresh = () => {
    fetchStats();
  };

  // Dynamic recent queries
  const [recentQueries, setRecentQueries] = useState([
    { id: 1, query: 'Loading recent queries...', time: 'Just now', status: 'loading' },
  ]);

  // Simulate fetching recent queries
  const fetchRecentQueries = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const sampleQueries = [
      'Chest X-ray interpretation for 45-year-old patient',
      'Blood work analysis - elevated white cell count',
      'MRI scan findings consultation',
      'Medication interaction check',
      'ECG rhythm analysis for cardiac patient',
      'CT scan interpretation - abdominal pain',
      'Dermatology consultation - skin lesion',
      'Pediatric growth chart evaluation',
      'Orthopedic assessment - joint pain',
      'Neurological symptoms evaluation'
    ];
    
    const statuses = ['answered', 'bookmarked', 'answered', 'answered'];
    const times = [
      `${Math.floor(Math.random() * 30) + 5} minutes ago`,
      `${Math.floor(Math.random() * 45) + 15} minutes ago`,
      `${Math.floor(Math.random() * 3) + 1} hour ago`,
      `${Math.floor(Math.random() * 5) + 2} hours ago`
    ];
    
    const dynamicQueries = Array.from({ length: 4 }, (_, index) => ({
      id: index + 1,
      query: sampleQueries[Math.floor(Math.random() * sampleQueries.length)],
      time: times[index],
      status: statuses[index]
    }));
    
    setRecentQueries(dynamicQueries);
  };

  // Fetch recent queries when component mounts
  useEffect(() => {
    fetchRecentQueries();
  }, []);

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return 'Good morning';
    if (currentHour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-2xl p-6 border border-teal-200/20 dark:border-teal-700/20"
      >
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getGreeting()}, {user?.full_name || user?.name}!
          </h1>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-3 py-2 bg-white/20 dark:bg-gray-800/20 rounded-lg hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-teal-600 dark:text-teal-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm text-teal-600 dark:text-teal-400 font-medium">
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </span>
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Ready to assist your patients with AI-powered medical insights today.
        </p>
        {/* <p className="text-xs text-gray-500 dark:text-gray-500">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p> */}
      </motion.div>

      {/* Stats Grid */}
     

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => handleQuickAction('upload')}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-xl border border-teal-200/20 dark:border-teal-700/20 hover:from-teal-500/20 hover:to-blue-500/20 transition-all"
          >
            <Upload className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span className="font-medium text-gray-900 dark:text-white">Upload Patient Report</span>
          </button>
          <button 
            onClick={() => handleQuickAction('chat')}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-200/20 dark:border-purple-700/20 hover:from-purple-500/20 hover:to-pink-500/20 transition-all"
          >
            <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="font-medium text-gray-900 dark:text-white">Ask AI Assistant</span>
          </button>
          <button 
            onClick={() => handleQuickAction('history')}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-200/20 dark:border-orange-700/20 hover:from-orange-500/20 hover:to-red-500/20 transition-all"
          >
            <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="font-medium text-gray-900 dark:text-white">View Query History</span>
          </button>
        </div>
      </motion.div>

      {/* Recent Queries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Queries
        </h2>
        <div className="space-y-3">
          {recentQueries.map((query, index) => (
            <motion.div
              key={query.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => query.status !== 'loading' && handleQueryClick(query.id)}
              className={`flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl border border-gray-200/20 dark:border-gray-600/20 transition-all ${
                query.status === 'loading' 
                  ? 'opacity-70' 
                  : 'hover:bg-gray-100/50 dark:hover:bg-gray-600/50 cursor-pointer hover:shadow-md'
              }`}
            >
              <div className="flex-1">
                <p className={`font-medium text-sm ${
                  query.status === 'loading' 
                    ? 'text-gray-500 dark:text-gray-400' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {query.query}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {query.time}
                </p>
              </div>
              
              {query.status === 'loading' ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  <span className="text-xs text-gray-500">Loading...</span>
                </div>
              ) : (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  query.status === 'answered'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {query.status}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DoctorDashboard;