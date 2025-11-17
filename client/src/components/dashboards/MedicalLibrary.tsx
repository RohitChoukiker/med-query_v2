import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ExternalLink, Calendar, User, Loader2, AlertCircle, RefreshCw, Search } from 'lucide-react';
import { pubmedAPI, PubMedPaper } from '../../api';

const MedicalLibrary: React.FC = () => {
  const [papers, setPapers] = useState<PubMedPaper[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('medical research');
  const [currentQuery, setCurrentQuery] = useState<string>('');

  const fetchPubMedPapers = async (query: string = 'medical research') => {
    setLoading(true);
    setError(null);
    setCurrentQuery(query);

    const response = await pubmedAPI.search(query, 20);

    if (response.data && response.status === 200) {
      setPapers(response.data.papers);
    } else {
      setError(response.error || 'Unable to fetch papers from PubMed. Please try again.');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPubMedPapers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchPubMedPapers(searchQuery.trim());
    }
  };

  const getPubMedLink = (pmid: string) => {
    return `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
  };

  const getDoiLink = (doi: string) => {
    if (doi && doi !== 'N/A') {
      return `https://doi.org/${doi}`;
    }
    return null;
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-brand-500/20 to-accent-blue-light/20 rounded-2xl p-6 border border-purple-200/20 dark:border-purple-700/20"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Medical Library
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Search medical research papers from PubMed
              </p>
            </div>
            <button
              onClick={() => fetchPubMedPapers(currentQuery || searchQuery)}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search PubMed (e.g., diabetes treatment, cancer research)"
                className="w-full pl-10 pr-4 py-2 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Search
            </button>
          </form>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400 space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading medical papers from PubMed...</span>
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex items-center space-x-3 p-4 border border-red-200 dark:border-red-800 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-semibold text-sm">Unable to load papers</p>
                <p className="text-xs">{error}</p>
              </div>
            </div>
          </div>
        ) : papers.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-gray-500 dark:text-gray-400">
            <div>
              <p className="font-medium text-sm">No papers found</p>
              <p className="text-xs mt-1">Try a different search query</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pr-1">
            {currentQuery && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Found {papers.length} paper{papers.length !== 1 ? 's' : ''} for: <span className="font-semibold text-gray-900 dark:text-white">"{currentQuery}"</span>
              </div>
            )}
            {papers.map((paper, index) => {
              const doiLink = getDoiLink(paper.doi);
              return (
                <motion.div
                  key={paper.pmid}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
                      {paper.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={getPubMedLink(paper.pmid)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-brand-500 hover:bg-brand-100 dark:hover:bg-brand-900/30 rounded-lg transition-colors"
                        title="View on PubMed"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      {doiLink && (
                        <a
                          href={doiLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 text-sm font-medium text-white bg-[#0EA5E9] hover:bg-[#0EA5E9]/80 rounded-lg transition-colors"
                        >
                          DOI
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span className="text-xs">
                        {paper.authors.length > 0
                          ? paper.authors.length === 1
                            ? paper.authors[0]
                            : `${paper.authors[0]} et al.`
                          : 'Unknown Author'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs">{paper.year}</span>
                    </div>
                    <div className="text-xs text-brand-600 dark:text-brand-400">
                      {paper.journal !== 'N/A' && paper.journal}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      PMID: {paper.pmid}
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed mb-3">
                    {paper.abstract !== 'N/A' ? paper.abstract : 'No abstract available.'}
                  </p>

                  {paper.authors.length > 1 && (
                    <details className="mt-3">
                      <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                        View all {paper.authors.length} authors
                      </summary>
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 pl-4">
                        {paper.authors.join(', ')}
                      </div>
                    </details>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalLibrary;

