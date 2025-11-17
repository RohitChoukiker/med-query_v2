import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, MessageSquare, Sun } from 'lucide-react';
import { aiAPI, QueryAnswer } from '../../api';

const PatientDashboard: React.FC = () => {
  const [queryHistory, setQueryHistory] = useState<QueryAnswer[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const healthTips = [
    {
      id: 1,
      title: 'Stay Hydrated',
      description: 'Drink at least 8 glasses of water daily for optimal health.',
      source: 'WHO Guidelines',
      image: 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 2,
      title: 'Regular Exercise',
      description: '30 minutes of moderate exercise can improve your overall well-being.',
      source: 'CDC Recommendations',
      image: 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 3,
      title: 'Balanced Diet',
      description: 'Include fruits, vegetables, and whole grains in your daily meals.',
      source: 'Mayo Clinic',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
  ];

  const healthGuidance = [
    {
      id: 1,
      title: 'Daily Movement',
      description: 'Aim for at least 30 minutes of light-to-moderate activity to keep joints flexible and boost mood.',
      tip: 'Break it into 10-minute walks after meals.',
      icon: Activity,
      accent: 'from-blue-500/10 to-indigo-500/10',
      badge: 'Routine'
    },
    {
      id: 2,
      title: 'Balanced Meals',
      description: 'Fill half your plate with colorful vegetables, add lean protein, and choose whole grains over refined carbs.',
      tip: 'Plan Sunday meal prep to stay consistent.',
      icon: Heart,
      accent: 'from-green-500/10 to-emerald-500/10',
      badge: 'Nutrition'
    },
    {
      id: 3,
      title: 'Rest & Recovery',
      description: 'Your body repairs itself during sleep—target 7–8 hours and keep bedtime consistent, even on weekends.',
      tip: 'Power down screens 45 minutes before bed.',
      icon: Sun,
      accent: 'from-amber-500/10 to-orange-500/10',
      badge: 'Sleep'
    },
  ];

  
  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      setIsHistoryLoading(true);
      setHistoryError(null);
      const response = await aiAPI.history(8);

      if (!isMounted) {
        return;
      }

      if (response.error) {
        setHistoryError(response.error);
        setQueryHistory([]);
      } else {
        setQueryHistory(response.data?.queries ?? []);
      }

      setIsHistoryLoading(false);
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-2xl p-6 border border-green-200/20 dark:border-green-700/20"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to Your Health Hub
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Get reliable health information and track your wellness journey.
        </p>
      </motion.div>

      {/* Health Guidance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Health Guidance</p>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Wellness Checklist</h2>
          </div>
          <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
            Updated Daily
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {healthGuidance.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 bg-gradient-to-br ${item.accent}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  <item.icon className="w-4 h-4 text-green-500" />
                  {item.title}
                </div>
                <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/30 text-gray-600 dark:text-gray-300">
                  {item.badge}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{item.description}</p>
              <div className="text-xs text-gray-900 dark:text-white bg-white/70 dark:bg-black/30 border border-gray-200/50 dark:border-gray-700/50 rounded-lg px-3 py-2">
                <span className="font-semibold text-green-600 dark:text-green-400 mr-1">Pro tip:</span>
                {item.tip}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

     
      {/* AI Medical Assistant Chat & History */}
      <div className="flex flex-col gap-6">
        {/*  */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Your Recent Questions
        </h2>
          </div>

          {isHistoryLoading ? (
            <div className="py-10 text-center text-gray-500 dark:text-gray-400">Fetching your recent questions…</div>
          ) : historyError ? (
            <div className="py-10 text-center text-red-500 dark:text-red-400 text-sm">
              Unable to load history: {historyError}
            </div>
          ) : queryHistory.length === 0 ? (
            <div className="py-10 text-center text-gray-500 dark:text-gray-400 text-sm">
              Ask your first question to see it appear here.
            </div>
          ) : (
            <div className="space-y-4">
              {queryHistory.map((entry) => (
                <div
                  key={`${entry.created_at}-${entry.question}`}
                  className="p-4 rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-gray-50/70 dark:bg-gray-900/30 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                      <MessageSquare className="w-4 h-4 text-green-500" />
                      {entry.question}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 bg-white/70 dark:bg-black/20 p-3 rounded-lg border border-gray-200/50 dark:border-gray-800/50">
                    {entry.answer}
                  </p>
                  {entry.sources?.length > 0 && (
                    <div className="text-xs text-green-600 dark:text-green-400">
                      Sourced from {entry.sources.length} {entry.sources.length === 1 ? 'document' : 'documents'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Health Tips Carousel */}
     

     
    </div>
  );
};

export default PatientDashboard;