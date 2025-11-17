import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Search, RefreshCw, Loader2, AlertCircle, CheckCircle2, Sparkles, NotebookPen } from 'lucide-react';
import { documentsAPI, DocumentListItem, aiAPI, QueryAnswer } from '../../api';

const ResearcherDashboard: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState<boolean>(true);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<QueryAnswer | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const datasetCountDisplay = documentsLoading ? '...' : documents.length.toString();
  const datasetProcessedDisplay = documentsLoading
    ? 'Syncing uploads'
    : `${documents.filter((doc) => doc.processed).length} processed`;

  const stats = [
    { label: 'Datasets Uploaded', value: datasetCountDisplay, icon: Upload, change: datasetProcessedDisplay }
    
  ];

 
  const loadDocuments = async () => {
    setDocumentsLoading(true);
    setDocumentsError(null);

    const response = await documentsAPI.list();

    if (response.data && response.status === 200) {
      setDocuments(response.data);
    } else {
      setDocumentsError(response.error || 'Unable to fetch uploaded datasets.');
    }

    setDocumentsLoading(false);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleAskAI = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!aiQuestion.trim()) {
      setAiError('Please enter a research question.');
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiResponse(null);

    const response = await aiAPI.ask(aiQuestion.trim());

    if (response.data && response.status === 200) {
      setAiResponse(response.data);
    } else {
      setAiError(response.error || 'Unable to fetch AI response. Please try again.');
    }

    setAiLoading(false);
  };

  // const trendingQueries = [
  //   { query: 'Latest mRNA vaccine efficacy studies', count: 45, trend: '+12%' },
  //   { query: 'AI applications in diagnostic imaging', count: 38, trend: '+8%' },
  //   { query: 'Personalized medicine approaches', count: 32, trend: '+15%' },
  //   { query: 'Gene therapy clinical outcomes', count: 28, trend: '+5%' },
  // ];

  // const tagCategories = [
  //   { name: 'Oncology', count: 234, color: 'bg-red-500' },
  //   { name: 'Cardiology', count: 189, color: 'bg-blue-500' },
  //   { name: 'Neurology', count: 156, color: 'bg-purple-500' },
  //   { name: 'Immunology', count: 123, color: 'bg-green-500' },
  // ];

  return (
    <div className="p-6 h-full flex flex-col gap-6 overflow-hidden">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-brand-500/20 to-accent-blue-light/20 rounded-2xl p-6 border border-purple-200/20 dark:border-purple-700/20"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Research Analytics Hub
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze medical research data and discover insights with AI assistance.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="flex flex-col gap-6 shrink-0">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-black/20 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {stat.label}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {stat.change}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="flex flex-col gap-6 flex-1 min-h-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Research Files</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Fetched from documents</p>
            </div>
            <button
              onClick={loadDocuments}
              disabled={documentsLoading}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100/80 dark:bg-gray-700/70 rounded-lg hover:bg-gray-200/80 dark:hover:bg-gray-600/70 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${documentsLoading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>

          <div className="flex-1 min-h-0">
            {documentsLoading ? (
              <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400 space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading uploads…</span>
              </div>
            ) : documentsError ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex items-center space-x-3 p-4 border border-red-200 dark:border-red-800 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <p className="font-semibold text-sm">Unable to load files</p>
                    <p className="text-xs">{documentsError}</p>
                  </div>
                </div>
              </div>
            ) : documents.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-gray-500 dark:text-gray-400">
                <div>
                  <p className="font-medium text-sm">No research documents uploaded yet.</p>
                  <p className="text-xs mt-1">Uploads from File Upload will appear here.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto pr-1 h-full scrollbar-thin">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-gray-50/70 dark:bg-gray-700/50 rounded-xl border border-gray-200/40 dark:border-gray-600/40"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">{doc.filename}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(doc.created_at).toLocaleDateString()} • {new Date(doc.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-[11px] font-medium ${
                          doc.processed
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}
                      >
                        {doc.processed ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Processed</span>
                          </>
                        ) : (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Processing</span>
                          </>
                        )}
                      </span>
                    </div>
                    {doc.preview ? (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                        {doc.preview}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

       
      </div>


    </div>
  );
};

export default ResearcherDashboard;