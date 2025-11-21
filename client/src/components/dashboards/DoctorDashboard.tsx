import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, MessageSquare, Clock, Star, FileText, RefreshCw, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { documentsAPI, DocumentListItem, aiAPI, QueryAnswer } from '../../api';

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
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState<string | null>(null);

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
    setIsRefreshing(false);
  };

  const loadDocuments = async () => {
    setDocumentsLoading(true);
    setDocumentsError(null);

    const response = await documentsAPI.list();

    if (response.data && response.status === 200) {
      setDocuments(response.data);
    } else {
      setDocumentsError(response.error || 'Unable to fetch uploaded documents.');
    }

    setDocumentsLoading(false);
  };

  // Auto-refresh stats every 5 minutes
  useEffect(() => {
    fetchStats(); // Initial fetch
    loadDocuments();
    
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

  // Recent queries state
  const [recentQueries, setRecentQueries] = useState<Array<{
    id: number;
    query: string;
    time: string;
    status: string;
  }>>([]);
  const [queriesLoading, setQueriesLoading] = useState(true);
  const [queriesError, setQueriesError] = useState<string | null>(null);

  // Helper function to format time ago
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  // Fetch recent queries from API
  const fetchRecentQueries = async () => {
    setQueriesLoading(true);
    setQueriesError(null);
    
    try {
      const response = await aiAPI.history(10); // Fetch last 10 queries
      
      if (response.data && response.status === 200) {
        const queries = response.data.queries.map((query: QueryAnswer, index: number) => ({
          id: index + 1,
          query: query.question,
          time: formatTimeAgo(query.created_at),
          status: query.answer ? 'answered' : 'pending'
        }));
        setRecentQueries(queries);
      } else {
        setQueriesError(response.error || 'Unable to fetch query history.');
        setRecentQueries([]);
      }
    } catch (error) {
      setQueriesError('Failed to load query history. Please try again.');
      setRecentQueries([]);
    } finally {
      setQueriesLoading(false);
    }
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
    <div className="p-4 sm:p-6 space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-2xl p-6 border border-teal-200/20 dark:border-teal-700/20"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {getGreeting()}, {user?.full_name || user?.name}!
          </h1>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-3 py-2 bg-white/20 dark:bg-gray-800/20 rounded-lg hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-teal-600 dark:text-teal-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-xs sm:text-sm text-teal-600 dark:text-teal-400 font-medium">
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </span>
          </button>
        </div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2">
          Ready to assist your patients with AI-powered medical insights today.
        </p>
        {/* <p className="text-xs text-gray-500 dark:text-gray-500">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p> */}
      </motion.div>

      {/* Stats Grid */}
     

      {/* Uploaded Documents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Patient Documents</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Files uploaded via MedQuery</p>
          </div>
          <button
            onClick={loadDocuments}
            disabled={documentsLoading}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100/80 dark:bg-gray-700/70 rounded-lg hover:bg-gray-200/80 dark:hover:bg-gray-600/70 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-gray-700 dark:text-gray-200 ${documentsLoading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Refresh</span>
          </button>
        </div>

        {documentsLoading ? (
          <div className="flex items-center justify-center py-10 text-gray-500 dark:text-gray-400 space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Fetching your files…</span>
          </div>
        ) : documentsError ? (
          <div className="flex items-center space-x-3 p-4 border border-red-200 dark:border-red-800 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-semibold text-sm">Unable to load documents</p>
              <p className="text-xs">{documentsError}</p>
            </div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <p className="font-medium">No documents uploaded yet.</p>
            <p className="text-sm mt-2">Upload your first patient report to see it here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 bg-gray-50/70 dark:bg-gray-700/50 rounded-xl border border-gray-200/40 dark:border-gray-600/40"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{doc.filename}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Uploaded on {new Date(doc.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                      doc.processed
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    {doc.processed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Processed</span>
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Processing</span>
                      </>
                    )}
                  </span>
                </div>
                {doc.preview ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 line-clamp-2">
                    {doc.preview}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-3 italic">
                    No preview available for this file.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
      >
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
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
         
        </div>
      </motion.div>

      {/* Recent Queries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Your Recent Questions
          </h2>
         
        </div>
        
        {queriesLoading ? (
          <div className="flex items-center justify-center py-10 text-gray-500 dark:text-gray-400 space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading query history…</span>
          </div>
        ) : queriesError ? (
          <div className="flex items-center space-x-3 p-4 border border-red-200 dark:border-red-800 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-semibold text-sm">Unable to load query history</p>
              <p className="text-xs">{queriesError}</p>
            </div>
          </div>
        ) : recentQueries.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <p className="font-medium">No queries yet.</p>
            <p className="text-sm mt-2">Start asking questions to see your query history here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentQueries.map((query, index) => (
              <motion.div
                key={query.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleQueryClick(query.id)}
                className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl border border-gray-200/20 dark:border-gray-600/20 transition-all hover:bg-gray-100/50 dark:hover:bg-gray-600/50 cursor-pointer hover:shadow-md"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900 dark:text-white">
                    {query.query}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {query.time}
                  </p>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  query.status === 'answered'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {query.status}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DoctorDashboard;