import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { askAssistant } from '../api';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  relatedCases?: string[];
  relatedVendors?: string[];
  timestamp: Date;
}

const SUGGESTIONS = [
  'What are the highest risk cases?',
  'Show single bidder patterns',
  'Explain split contract anomalies',
  'Health department analysis',
  'Shared address vendor network',
  'Show escalated cases',
];

interface AIPanelProps {
  open: boolean;
  onClose: () => void;
}

function MessageBubble({ msg, onCaseClick }: { msg: Message; onCaseClick: (id: string) => void }) {
  const isUser = msg.role === 'user';

  // Format markdown-like content
  const formatContent = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-semibold text-white">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith('- **')) {
          const parts = line.slice(2).split('**');
          return (
            <p key={i} className="flex gap-1">
              <span className="text-gray-500">•</span>
              <span><strong className="text-gray-200">{parts[1]}</strong>{parts[2]}</span>
            </p>
          );
        }
        if (line.startsWith('- ')) {
          return <p key={i} className="flex gap-1"><span className="text-gray-500">•</span><span>{line.slice(2)}</span></p>;
        }
        if (line === '') return <div key={i} className="h-1.5" />;
        return <p key={i}>{line}</p>;
      });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-accent-600 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className={`max-w-xs ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-3 py-2.5 rounded-xl text-xs leading-relaxed space-y-0.5 ${
            isUser
              ? 'bg-accent-600 text-white rounded-tr-sm'
              : 'bg-gray-800 text-gray-300 rounded-tl-sm'
          }`}
        >
          {formatContent(msg.content)}
        </div>

        {/* Related cases links */}
        {msg.relatedCases && msg.relatedCases.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {msg.relatedCases.slice(0, 5).map(id => (
              <button
                key={id}
                onClick={() => onCaseClick(id)}
                className="text-xs px-2 py-0.5 bg-accent-600/20 text-accent-400 border border-accent-600/30 rounded hover:bg-accent-600/30 transition-colors"
              >
                {id}
              </button>
            ))}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 ml-2 mt-1">
          <User className="w-3.5 h-3.5 text-gray-300" />
        </div>
      )}
    </div>
  );
}

export default function AIPanel({ open, onClose }: AIPanelProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm the TenderLens AI assistant. I can help you analyse procurement anomalies, investigate flagged cases, and explore vendor relationships.\n\nWhat would you like to know?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await askAssistant(text);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        relatedCases: result.relatedCases,
        relatedVendors: result.relatedVendors,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCaseClick = (caseId: string) => {
    navigate(`/cases/${caseId.replace('CASE-', '')}`);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-gray-900 border-l border-gray-800 flex flex-col z-40 shadow-2xl animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 flex-shrink-0 bg-gradient-to-r from-navy-800 to-navy-900">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent-600 flex items-center justify-center shadow-glow-blue">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">AI Assistant</p>
            <p className="text-[10px] text-accent-400 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> TenderLens Intelligence
            </p>
          </div>
        </div>
        <button onClick={onClose} className="btn-ghost p-1.5">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} onCaseClick={handleCaseClick} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-accent-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="px-3 py-2.5 bg-gray-800 rounded-xl rounded-tl-sm flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
              <span className="text-xs text-gray-400">Analysing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-3 flex-shrink-0">
          <p className="text-xs text-gray-500 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.slice(0, 4).map(s => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs px-2.5 py-1.5 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-800 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Ask about cases, vendors, risks..."
            className="input flex-1 text-xs"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="btn-primary p-2 flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
