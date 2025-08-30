"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import StarField from "@/components/StarField";
import Navbar from "@/components/Navbar";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

export default function AskAstronomer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{
      id: "welcome",
      type: "bot",
      content: "Hi! I'm AskAstronomer, your AI assistant for real-time asteroid data from NASA.\n\nAsk me about current asteroids, potentially hazardous objects, or space missions!",
      timestamp: new Date(),
    }]);
    setMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/ask-astronomer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentMessage }),
      });

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: data.response || data.error || "I'm sorry, I couldn't process your request.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "I'm sorry, I encountered a network error while processing your question. Please check your connection and try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickMessage = async (message: string) => {
    if (isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ask-astronomer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message }),
      });

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: data.response || data.error || "I'm sorry, I couldn't process your request.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "I'm sorry, I encountered a network error while processing your question. Please check your connection and try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-space-black relative overflow-hidden">
        <StarField />
        <Navbar />
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-space-blue/20 backdrop-blur-md rounded-lg border border-space-teal/30 h-[calc(100vh-8rem)] flex flex-col mt-20">
            <div className="p-6 border-b border-space-teal/30">
              <h1 className="text-3xl font-bold text-white text-center">
                AskAstronomer
              </h1>
              <p className="text-space-teal text-center mt-2">
                Loading NASA data...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-black relative overflow-hidden">
      <StarField />
      <Navbar />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-space-blue/20 backdrop-blur-md rounded-lg border border-space-teal/30 h-[calc(100vh-8rem)] flex flex-col mt-20"
        >
          <div className="p-6 border-b border-space-teal/30">
            <h1 className="text-3xl font-bold text-white text-center">
              AskAstronomer
            </h1>
            <p className="text-space-teal text-center mt-2">
              Learn what lies beyond our world.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl shadow-lg ${
                    message.type === "user"
                      ? "bg-gradient-to-br from-space-teal to-space-teal/80 text-space-black ml-12"
                      : "bg-gradient-to-br from-space-purple/60 to-space-purple/40 text-white border border-space-pink/30 mr-12 backdrop-blur-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <span className="text-xs opacity-60 mt-3 block text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-gradient-to-br from-space-purple/60 to-space-purple/40 text-white border border-space-pink/30 p-4 rounded-2xl shadow-lg mr-12 backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-space-teal rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-space-teal rounded-full animate-bounce-delay-1"></div>
                      <div className="w-2 h-2 bg-space-teal rounded-full animate-bounce-delay-2"></div>
                    </div>
                    <span className="text-sm text-space-teal opacity-80">AI is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 border-t border-space-teal/30">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => handleQuickMessage("What hazardous asteroids are approaching Earth?")}
                disabled={isLoading}
                className="px-3 py-1 text-sm bg-space-purple/30 hover:bg-space-purple/50 text-space-teal rounded-full border border-space-teal/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hazardous asteroids
              </button>
              <button
                onClick={() => handleQuickMessage("Show me the largest asteroid this week")}
                disabled={isLoading}
                className="px-3 py-1 text-sm bg-space-purple/30 hover:bg-space-purple/50 text-space-teal rounded-full border border-space-teal/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Largest asteroid
              </button>
              <button
                onClick={() => handleQuickMessage("Which asteroid is closest to Earth?")}
                disabled={isLoading}
                className="px-3 py-1 text-sm bg-space-purple/30 hover:bg-space-purple/50 text-space-teal rounded-full border border-space-teal/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Closest approach
              </button>
              <button
                onClick={() => handleQuickMessage("What is the fastest asteroid?")}
                disabled={isLoading}
                className="px-3 py-1 text-sm bg-space-purple/30 hover:bg-space-purple/50 text-space-teal rounded-full border border-space-teal/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Fastest speed
              </button>
            </div>
            <div className="flex space-x-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about current asteroids, hazardous NEOs, sizes, speeds..."
                className="flex-1 bg-space-black/50 border border-space-teal/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-space-teal"
                disabled={isLoading}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-space-teal hover:bg-space-pink text-space-black px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
