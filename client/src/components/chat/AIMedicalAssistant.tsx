import React, { useState } from 'react';
import { askAI, QuerySource } from '../../api';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sources?: QuerySource[];
  isError?: boolean;
}

const AIMedicalAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      text: "Hello! I'm your AI medical assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const prompt = input;
    setInput('');
    setLoading(true);

    try {
      const res = await askAI(prompt);
      if (res.error || !res.data) {
        throw new Error(res.error || 'Unable to fetch answer.');
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: res.data.answer,
        isUser: false,
        timestamp: res.data.created_at ? new Date(res.data.created_at) : new Date(),
        sources: res.data.sources || [],
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          text: 'Error: Unable to get answer from AI.',
          isUser: false,
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg ${
              msg.isUser
                ? 'bg-blue-100 dark:bg-blue-800 text-right ml-auto'
                : msg.isError
                ? 'bg-red-100 dark:bg-red-800 text-left mr-auto'
                : 'bg-gray-100 dark:bg-gray-800 mr-auto'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>

            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sources:</p>
                <ul className="space-y-1">
                  {msg.sources.map((source) => (
                    <li key={source.chunk_id} className="text-xs text-gray-600 dark:text-gray-300">
                      <span className="font-medium">{source.filename}</span>
                      <span className="block text-gray-500 dark:text-gray-400">
                        {source.snippet.slice(0, 120)}...
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
        {loading && <div className="text-gray-400 text-sm">AI is analyzing your documents...</div>}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask a medical question about your uploaded files..."
          disabled={loading}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default AIMedicalAssistant;