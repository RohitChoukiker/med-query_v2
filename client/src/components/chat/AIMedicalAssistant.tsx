import React, { useState } from "react";
import { askAI, QuerySource } from "../../api";

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
      id: "welcome-msg",
      text: "Hello! I'm your AI medical assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
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
    setInput("");
    setLoading(true);

    try {
      const res = await askAI(prompt);
      if (res.error || !res.data) {
        throw new Error(res.error || "Unable to fetch answer.");
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: res.data.answer,
        isUser: false,
        timestamp: res.data.created_at
          ? new Date(res.data.created_at)
          : new Date(),
        sources: res.data.sources || [],
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          text: "Error: Unable to get answer from AI.",
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
    <div className="flex flex-col h-full w-full mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg) => {
          const alignment = msg.isUser ? "justify-end" : "justify-start";
          const bubbleStyles = msg.isError
            ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-200"
            : msg.isUser
            ? "bg-gray-100 text-black shadow-lg text-right"
            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow";

          return (
            <div key={msg.id} className={`flex ${alignment}`}>
              <div className="max-w-[80%] space-y-2">
                <div
                  className={`p-3 rounded-2xl whitespace-pre-wrap text-sm ${bubbleStyles}`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        {loading && <div className="text-gray-400 text-sm">Analyzing...</div>}
      </div>
      <div className="flex gap-2">
        <textarea
          className="flex-1 border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white resize-none max-h-40 min-h-[48px] overflow-y-auto"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask a medical query..."
          disabled={loading}
          rows={1}
        />
        <button
          className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/80 rounded-lg text-white px-4 py-2 disabled:opacity-50 flex items-center gap-2"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          aria-label="Send message"
        >
          {loading ? (
            "Sending..."
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AIMedicalAssistant;
