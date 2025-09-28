import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

interface ChatRequest {
  message: string;
}

interface NeoData {
  id: string;
  name: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: Array<{
    close_approach_date: string;
    close_approach_date_full: string;
    relative_velocity: {
      kilometers_per_second: string;
      kilometers_per_hour: string;
    };
    miss_distance: {
      astronomical: string;
      lunar: string;
      kilometers: string;
    };
    orbiting_body: string;
  }>;
}

interface NeoFeedResponse {
  element_count: number;
  near_earth_objects: {
    [date: string]: NeoData[];
  };
}

function classifyQuery(message: string): 'hazardous' | 'size' | 'speed' | 'distance' | 'count' | 'general' | 'greeting' | 'space_related' {
  const msg = message.toLowerCase();
  
  // Check if message is asteroid/space related first
  const spaceKeywords = [
    'asteroid', 'meteor', 'meteorite', 'comet', 'neo', 'near earth object', 'space', 'nasa', 'orbit', 'planet', 'solar system',
    'hazard', 'dangerous', 'threat', 'impact', 'collision', 'size', 'diameter', 'big', 'large', 'small', 'huge',
    'fast', 'speed', 'velocity', 'distance', 'close', 'near', 'approach', 'mission', 'dart', 'spacecraft',
    'count', 'many', 'statistics', 'stats', 'data', 'current', 'week', 'today', 'moon', 'earth', 'jupiter', 'mars',
    'rock', 'object', 'celestial', 'sky', 'universe', 'cosmos', 'tracking', 'monitor', 'discovery', 'approach',
    'what', 'when', 'where', 'how', 'why', 'tell', 'show', 'find', 'search', 'info', 'information'
  ];
  
  const hasSpaceKeywords = spaceKeywords.some(keyword => msg.includes(keyword));
  
  // If this is a space-related query, classify it specifically
  if (hasSpaceKeywords) {
    // Specific asteroid/meteor queries with priority to distance queries
    if (msg.includes('close') || msg.includes('near') || msg.includes('distance') || msg.includes('approach') || 
        msg.includes('closest') || msg.includes('nearest')) {
      return 'distance';
    }
    if (msg.includes('hazard') || msg.includes('dangerous') || msg.includes('threat')) {
      return 'hazardous';
    }
    if (msg.includes('large') || msg.includes('size') || msg.includes('diameter') || msg.includes('biggest') || 
        msg.includes('largest') || msg.includes('smallest')) {
      return 'size';
    }
    if (msg.includes('fast') || msg.includes('speed') || msg.includes('velocity') || msg.includes('fastest')) {
      return 'speed';
    }
    if (msg.includes('count') || msg.includes('how many') || msg.includes('statistics') || msg.includes('stats')) {
      return 'count';
    }
    
    return 'general';
  }
  
  // Only check for greetings if it's NOT a space-related query
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('good morning') || msg.includes('good afternoon') || msg.includes('good evening')) {
    return 'greeting';
  }
  
  // For non-space queries, still try to use API data
  return 'space_related';
}

function formatDistance(kilometers: number): string {
  if (kilometers > 1000000) {
    return `${(kilometers / 1000000).toFixed(2)} million km`;
  }
  return `${kilometers.toLocaleString()} km`;
}

function formatSpeed(kmPerSecond: number): string {
  const kmPerHour = kmPerSecond * 3600;
  return `${kmPerSecond.toFixed(2)} km/s (${kmPerHour.toFixed(0)} km/h)`;
}

function analyzeAsteroids(asteroids: NeoData[]) {
  const hazardousAsteroids = asteroids.filter(a => a.is_potentially_hazardous_asteroid);
  
  // Find closest asteroid
  const closestAsteroid = asteroids.reduce((prev, current) => {
    const prevDistance = parseFloat(prev.close_approach_data[0]?.miss_distance.kilometers || '999999999');
    const currentDistance = parseFloat(current.close_approach_data[0]?.miss_distance.kilometers || '999999999');
    return prevDistance < currentDistance ? prev : current;
  });
  
  // Find largest asteroid
  const largestAsteroid = asteroids.reduce((prev, current) => 
    (prev.estimated_diameter.kilometers.estimated_diameter_max > current.estimated_diameter.kilometers.estimated_diameter_max) ? prev : current
  );
  
  // Find fastest asteroid
  const fastestAsteroid = asteroids.reduce((prev, current) => {
    const prevSpeed = parseFloat(prev.close_approach_data[0]?.relative_velocity.kilometers_per_second || '0');
    const currentSpeed = parseFloat(current.close_approach_data[0]?.relative_velocity.kilometers_per_second || '0');
    return prevSpeed > currentSpeed ? prev : current;
  });

  const closestDistance = parseFloat(closestAsteroid.close_approach_data[0]?.miss_distance.kilometers || '0');
  const moonDistance = 384400; // km to moon

  return {
    totalCount: asteroids.length,
    hazardousCount: hazardousAsteroids.length,
    hazardousAsteroids,
    closest: {
      asteroid: closestAsteroid,
      distance: closestDistance,
      distanceFromMoon: closestDistance / moonDistance,
    },
    largest: {
      asteroid: largestAsteroid,
      diameter: largestAsteroid.estimated_diameter.kilometers.estimated_diameter_max,
    },
    fastest: {
      asteroid: fastestAsteroid,
      speed: parseFloat(fastestAsteroid.close_approach_data[0]?.relative_velocity.kilometers_per_second || '0'),
    },
  };
}

interface AsteroidAnalysis {
  totalCount: number;
  hazardousCount: number;
  hazardousAsteroids: NeoData[];
  closest: {
    asteroid: NeoData;
    distance: number;
    distanceFromMoon: number;
  };
  largest: {
    asteroid: NeoData;
    diameter: number;
  };
  fastest: {
    asteroid: NeoData;
    speed: number;
  };
}

async function processWithGroq(nasaData: NeoFeedResponse, userMessage: string): Promise<string> {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `You are a friendly space expert. The user asked: "${userMessage}"

Based on this NASA asteroid data, provide a friendly, easy-to-understand response. Don't add any information that isn't in the data - just make the existing NASA data more accessible and conversational:

${JSON.stringify(nasaData, null, 2)}

Keep your response informative but friendly, and explain technical terms in simple language.`
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: false
    });

    return chatCompletion.choices[0]?.message?.content || 'Sorry, I had trouble processing that information.';
  } catch (error) {
    console.error('Groq API error:', error);
    // Fallback to original response if Groq fails
    return 'I have the NASA data but had trouble making it more readable. Please try again.';
  }
}

async function fetchWithTimeout(url: string, timeout: number = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'NASA-Space-Challenge-App/1.0'
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function fetchNASADataWithRetry(nasaUrl: string, maxRetries: number = 3): Promise<Response> {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting NASA API call (attempt ${attempt}/${maxRetries}): ${nasaUrl}`);
      const response = await fetchWithTimeout(nasaUrl, 15000); // 15 second timeout
      return response;
    } catch (error) {
      lastError = error;
      console.error(`NASA API attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Classify user query and generate response
    const queryType = classifyQuery(message);
    
    // Handle greetings with a quick response but still try to get data
    if (queryType === 'greeting') {
      // Still fetch NASA data for greetings to provide current info
    }

    // Get NASA API key from environment
    const nasaApiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
    
    // Get current week's asteroid data
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 7);
    
    const startDateStr = today.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Fetch data from NASA NeoWs API
    const nasaUrl = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDateStr}&end_date=${endDateStr}&api_key=${nasaApiKey}`;
    
    const response = await fetchNASADataWithRetry(nasaUrl);

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json(
          { 
            error: "NASA API rate limit exceeded. Please try again later.",
            response: "NASA API rate limit exceeded. Please wait a moment before making another request, or consider using your own API key for higher limits."
          },
          { status: 429 }
        );
      }
      if (response.status === 403) {
        return NextResponse.json(
          { 
            error: "Invalid NASA API key",
            response: "Invalid API key. Please check your NASA API key configuration."
          },
          { status: 403 }
        );
      }
      throw new Error(`NASA API error: ${response.status}`);
    }

    const nasaData: NeoFeedResponse = await response.json();
    
    // Flatten all asteroids from all dates
    const asteroids: NeoData[] = [];
    Object.values(nasaData.near_earth_objects).forEach((dayAsteroids) => {
      asteroids.push(...dayAsteroids);
    });

    if (asteroids.length === 0) {
      return NextResponse.json({
        response: "No asteroid data available for this week. This could be due to API maintenance or temporary issues. Please try again later!"
      });
    }

    // Analyze asteroid data
    const analysis = analyzeAsteroids(asteroids);
    
    const responseText = await processWithGroq(nasaData, message);

    return NextResponse.json({
      response: responseText,
      dataSource: "NASA NeoWs API",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing asteroid query:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch asteroid data',
        response: "Sorry, I'm having trouble accessing NASA's asteroid data right now. This could be due to API limits or network issues. Please try again in a moment!"
      },
      { status: 500 }
    );
  }
}
