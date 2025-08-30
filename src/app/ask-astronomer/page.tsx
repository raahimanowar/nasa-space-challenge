"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import StarField from "@/components/StarField";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

interface AsteroidData {
  name: string;
  diameter: {
    kilometers: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: Array<{
    close_approach_date: string;
    relative_velocity: {
      kilometers_per_second: string;
    };
    miss_distance: {
      kilometers: string;
    };
  }>;
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
      content: "Hello! I'm your asteroid expert. Ask me about Near-Earth Objects (NEOs), their orbits, sizes, or potential hazards. What would you like to know?",
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

  const fetchAsteroidData = async (query: string): Promise<string> => {
    try {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 7);
      
      const startDateStr = today.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const response = await fetch(
        `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDateStr}&end_date=${endDateStr}&api_key=DEMO_KEY`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch asteroid data');
      }
      
      const data = await response.json();
      const asteroids: AsteroidData[] = [];
      
      Object.values(data.near_earth_objects).forEach((dayAsteroids: unknown) => {
        if (Array.isArray(dayAsteroids)) {
          asteroids.push(...(dayAsteroids as AsteroidData[]));
        }
      });

      if (query.toLowerCase().includes('hazardous') || query.toLowerCase().includes('dangerous')) {
        const hazardousAsteroids = asteroids.filter(a => a.is_potentially_hazardous_asteroid);
        if (hazardousAsteroids.length > 0) {
          const asteroid = hazardousAsteroids[0];
          return `I found ${hazardousAsteroids.length} potentially hazardous asteroids approaching Earth this week. Here's one: ${asteroid.name} with a diameter between ${asteroid.diameter.kilometers.estimated_diameter_min.toFixed(2)} and ${asteroid.diameter.kilometers.estimated_diameter_max.toFixed(2)} kilometers. It will approach Earth on ${asteroid.close_approach_data[0]?.close_approach_date} at a distance of ${parseInt(asteroid.close_approach_data[0]?.miss_distance.kilometers).toLocaleString()} kilometers.`;
        }
        return "No potentially hazardous asteroids are approaching Earth this week according to current data.";
      }

      if (query.toLowerCase().includes('size') || query.toLowerCase().includes('diameter') || query.toLowerCase().includes('big')) {
        const largestAsteroid = asteroids.reduce((prev, current) => 
          (prev.diameter.kilometers.estimated_diameter_max > current.diameter.kilometers.estimated_diameter_max) ? prev : current
        );
        return `The largest asteroid approaching Earth this week is ${largestAsteroid.name} with an estimated diameter between ${largestAsteroid.diameter.kilometers.estimated_diameter_min.toFixed(2)} and ${largestAsteroid.diameter.kilometers.estimated_diameter_max.toFixed(2)} kilometers.`;
      }

      if (query.toLowerCase().includes('closest') || query.toLowerCase().includes('near')) {
        const closestAsteroid = asteroids.reduce((prev, current) => {
          const prevDistance = parseInt(prev.close_approach_data[0]?.miss_distance.kilometers || '999999999');
          const currentDistance = parseInt(current.close_approach_data[0]?.miss_distance.kilometers || '999999999');
          return prevDistance < currentDistance ? prev : current;
        });
        return `The closest asteroid this week is ${closestAsteroid.name}, which will pass at a distance of ${parseInt(closestAsteroid.close_approach_data[0]?.miss_distance.kilometers).toLocaleString()} kilometers on ${closestAsteroid.close_approach_data[0]?.close_approach_date}.`;
      }

      if (query.toLowerCase().includes('fast') || query.toLowerCase().includes('speed') || query.toLowerCase().includes('velocity')) {
        const fastestAsteroid = asteroids.reduce((prev, current) => {
          const prevSpeed = parseFloat(prev.close_approach_data[0]?.relative_velocity.kilometers_per_second || '0');
          const currentSpeed = parseFloat(current.close_approach_data[0]?.relative_velocity.kilometers_per_second || '0');
          return prevSpeed > currentSpeed ? prev : current;
        });
        return `The fastest asteroid this week is ${fastestAsteroid.name}, traveling at ${parseFloat(fastestAsteroid.close_approach_data[0]?.relative_velocity.kilometers_per_second).toFixed(2)} km/s (${(parseFloat(fastestAsteroid.close_approach_data[0]?.relative_velocity.kilometers_per_second) * 3600).toFixed(0)} km/h).`;
      }

      if (asteroids.length > 0) {
        return `This week, ${asteroids.length} Near-Earth Objects are being tracked. The average size ranges from ${(asteroids.reduce((sum, a) => sum + a.diameter.kilometers.estimated_diameter_min, 0) / asteroids.length).toFixed(2)} to ${(asteroids.reduce((sum, a) => sum + a.diameter.kilometers.estimated_diameter_max, 0) / asteroids.length).toFixed(2)} kilometers in diameter.`;
      }

      return "I found information about several asteroids, but I need a more specific question to provide detailed insights.";
    } catch {
      return "I'm having trouble accessing the latest asteroid data right now. However, I can tell you that NASA tracks thousands of Near-Earth Objects, with new discoveries made regularly. Most asteroids pose no threat to Earth, but we continuously monitor them for any potential impacts.";
    }
  };

  const generateResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm here to help you learn about asteroids and Near-Earth Objects. You can ask me about their sizes, orbits, potential hazards, or any specific asteroid you're curious about.";
    }

    if (lowerMessage.includes('what is') && lowerMessage.includes('asteroid')) {
      return "An asteroid is a rocky object that orbits the Sun. Most asteroids are found in the asteroid belt between Mars and Jupiter, but some have orbits that bring them close to Earth - these are called Near-Earth Objects (NEOs). They range in size from small rocks to objects hundreds of kilometers across.";
    }

    if (lowerMessage.includes('impact') || lowerMessage.includes('hit earth')) {
      return "Large asteroid impacts are extremely rare. NASA and other space agencies continuously monitor Near-Earth Objects to detect any potential threats decades in advance. The last major impact was 66 million years ago, which contributed to the extinction of dinosaurs. Today, we have planetary defense systems in development to deflect dangerous asteroids if needed.";
    }

    if (lowerMessage.includes('how many') || lowerMessage.includes('count')) {
      const apiResponse = await fetchAsteroidData(userMessage);
      return apiResponse;
    }

    if (lowerMessage.includes('data') || lowerMessage.includes('current') || lowerMessage.includes('this week')) {
      const apiResponse = await fetchAsteroidData(userMessage);
      return apiResponse;
    }

    const keywordResponse = await fetchAsteroidData(userMessage);
    if (keywordResponse.includes('I found')) {
      return keywordResponse;
    }

    return "That's an interesting question about asteroids! While I can provide information about Near-Earth Objects using NASA's data, I'd be happy to help if you ask about specific aspects like sizes, speeds, potential hazards, or current asteroid approaches. What specific information are you looking for?";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await generateResponse(inputValue);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "I'm sorry, I encountered an error while processing your question. Please try again.",
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
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-space-blue/20 backdrop-blur-md rounded-lg border border-space-teal/30 h-[calc(100vh-4rem)] flex flex-col">
            <div className="p-6 border-b border-space-teal/30">
              <h1 className="text-3xl font-bold text-white text-center">
                AskAstronomer
              </h1>
              <p className="text-space-teal text-center mt-2">
                Loading...
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

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-space-blue/20 backdrop-blur-md rounded-lg border border-space-teal/30 h-[calc(100vh-4rem)] flex flex-col"
        >
          <div className="p-6 border-b border-space-teal/30">
            <h1 className="text-3xl font-bold text-white text-center">
              AskAstronomer
            </h1>
            <p className="text-space-teal text-center mt-2">
              Your AI companion for asteroid and Near-Earth Object information
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
                  className={`max-w-[80%] p-4 rounded-lg ${
                    message.type === "user"
                      ? "bg-space-teal text-space-black"
                      : "bg-space-purple/50 text-white border border-space-pink/30"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-2 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-space-purple/50 text-white border border-space-pink/30 p-4 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-space-teal rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-space-teal rounded-full animate-bounce-delay-1"></div>
                    <div className="w-2 h-2 bg-space-teal rounded-full animate-bounce-delay-2"></div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 border-t border-space-teal/30">
            <div className="flex space-x-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about asteroids, NEOs, sizes, hazards..."
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
