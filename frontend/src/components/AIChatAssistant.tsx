import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Minimize2, Maximize2, Sparkles, Bot } from 'lucide-react';
import { apiFetch } from '../config/api';
import '../styles/AIChatAssistant.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const AIChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI marketing assistant. I can help you create content, search your database, generate campaigns, and answer questions about the platform. What would you like to do today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Create assistant message with streaming
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Use real AI endpoint with session
      const response = await apiFetch<{ message: string }>({
        path: '/api/ai/chat',
        method: 'POST',
        body: JSON.stringify({ 
          message: input.trim(),
          sessionId: sessionId
        })
      });

      // Simulate streaming effect
      const fullResponse = response.message;
      let currentContent = '';
      
      for (let i = 0; i < fullResponse.length; i += 3) {
        currentContent = fullResponse.slice(0, i + 3);
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content: currentContent }
            : msg
        ));
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Final update
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: fullResponse, isStreaming: false }
          : msg
      ));
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: 'Sorry, I encountered an error. Please try again.', isStreaming: false }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button 
        className="ai-chat-toggle"
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Assistant"
      >
        <Bot size={30} strokeWidth={2} />
      </button>
    );
  }

  return (
    <div className={`ai-chat-container ${isMinimized ? 'minimized' : ''}`}>
      <div className="ai-chat-header">
        <div className="ai-chat-title">
          <Sparkles size={20} />
          <span>AI Marketing Assistant</span>
        </div>
        <div className="ai-chat-controls">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            aria-label={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="ai-chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`ai-message ${message.role}`}>
                <div className="ai-message-content">
                  {message.content}
                  {message.isStreaming && <span className="typing-indicator">▋</span>}
                </div>
                <div className="ai-message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="ai-chat-input">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about marketing, content, or strategy..."
              disabled={isLoading}
              style={{ overflow: 'hidden' }}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AIChatAssistant;