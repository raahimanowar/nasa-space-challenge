import { NextRequest, NextResponse } from 'next/server';

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

function generateResponse(queryType: string, analysis: any, userMessage: string = ''): string {
  // If no data available, return "I don't have info"
  if (!analysis || !analysis.totalCount) {
    return "I don't have current asteroid data available right now. Please try again later.";
  }

  switch (queryType) {
    case 'greeting':
      // Still provide a greeting but with current data
      return `Hello! I have current data on ${analysis.totalCount} asteroids from NASA. What would you like to know about them?`;

    case 'hazardous':
      if (analysis.hazardousCount === 0) {
        return `Based on current NASA data, there are no potentially hazardous asteroids approaching Earth this week. I'm tracking ${analysis.totalCount} asteroids total.`;
      }

      const featured = analysis.hazardousAsteroids[0];
      const diameter = `${featured.estimated_diameter.kilometers.estimated_diameter_min.toFixed(3)} - ${featured.estimated_diameter.kilometers.estimated_diameter_max.toFixed(3)}`;
      const distance = formatDistance(parseFloat(featured.close_approach_data[0]?.miss_distance.kilometers || '0'));
      const date = featured.close_approach_data[0]?.close_approach_date;

      return `I found ${analysis.hazardousCount} potentially hazardous asteroids in current NASA data:\n\n${featured.name}\nDiameter: ${diameter} km\nClosest approach: ${date}\nDistance: ${distance}\n\nPotentially hazardous means larger than 140m and comes within 7.5 million km of Earth's orbit.`;

    case 'size':
      const asteroid = analysis.largest.asteroid;
      const sizeDiameter = `${asteroid.estimated_diameter.kilometers.estimated_diameter_min.toFixed(3)} - ${asteroid.estimated_diameter.kilometers.estimated_diameter_max.toFixed(3)}`;
      
      let comparison = '';
      if (analysis.largest.diameter > 1) {
        comparison = '\n\nThis is larger than most city blocks!';
      } else if (analysis.largest.diameter > 0.1) {
        comparison = '\n\nThis is about the size of a large building.';
      } else {
        comparison = '\n\nThis is roughly the size of a house.';
      }

      return `The largest asteroid in current NASA data:\n\n${asteroid.name}\nDiameter: ${sizeDiameter} km\nPotentially hazardous: ${asteroid.is_potentially_hazardous_asteroid ? 'Yes' : 'No'}${comparison}`;

    case 'distance':
      const closeAsteroid = analysis.closest.asteroid;
      const closeDistance = formatDistance(analysis.closest.distance);
      const closeDate = closeAsteroid.close_approach_data[0]?.close_approach_date;
      const moonRatio = analysis.closest.distanceFromMoon.toFixed(1);

      return `The closest asteroid in current NASA data:\n\n${closeAsteroid.name}\nDate: ${closeDate}\nDistance: ${closeDistance}\n\nThis is ${moonRatio} times the distance to the Moon.\n\n${analysis.closest.distance < 1000000 ? 'This is considered a close approach!' : 'This is a safe distance from Earth.'}`;

    case 'speed':
      const speedAsteroid = analysis.fastest.asteroid;
      const speed = formatSpeed(analysis.fastest.speed);
      const speedKmh = analysis.fastest.speed * 3600;
      
      let speedComparison = '';
      if (speedKmh > 100000) {
        speedComparison = `\n\nThat's about ${Math.round(speedKmh / 300)} times faster than a Formula 1 car!`;
      } else if (speedKmh > 50000) {
        speedComparison = `\n\nThat's about ${Math.round(speedKmh / 900)} times faster than a commercial jet!`;
      } else {
        speedComparison = `\n\nThat's about ${Math.round(speedKmh / 120)} times faster than highway speed!`;
      }

      return `The fastest asteroid in current NASA data:\n\n${speedAsteroid.name}\nSpeed: ${speed}${speedComparison}`;

    case 'count':
      return `Current NASA asteroid statistics:\n\nTotal NEOs tracked this week: ${analysis.totalCount}\nPotentially hazardous: ${analysis.hazardousCount}\n\nNASA monitors over 28,000 known Near-Earth Objects continuously.`;

    default:
      // For any other query, try to find relevant information in the data
      const userQuery = userMessage.toLowerCase();
      
      // Try to match user intent with available data
      if (userQuery.includes('smallest') || userQuery.includes('small')) {
        const smallestAsteroid = analysis.closest.asteroid; // Use closest as proxy for smaller ones
        const smallDiameter = `${smallestAsteroid.estimated_diameter.kilometers.estimated_diameter_min.toFixed(3)} - ${smallestAsteroid.estimated_diameter.kilometers.estimated_diameter_max.toFixed(3)}`;
        return `Based on current NASA data, here's information about ${smallestAsteroid.name}:\n\nDiameter: ${smallDiameter} km\nDistance: ${formatDistance(analysis.closest.distance)}`;
      }
      
      if (userQuery.includes('today') || userQuery.includes('now') || userQuery.includes('current')) {
        return `Current NASA data shows ${analysis.totalCount} asteroids being tracked this week. ${analysis.hazardousCount} are potentially hazardous. The closest is ${analysis.closest.asteroid.name} at ${formatDistance(analysis.closest.distance)}.`;
      }
      
      // Default: provide general current data
      const randomAsteroid = analysis.hazardousAsteroids.length > 0 
        ? analysis.hazardousAsteroids[Math.floor(Math.random() * analysis.hazardousAsteroids.length)]
        : analysis.closest.asteroid;
      
      const genDiameter = `${randomAsteroid.estimated_diameter.kilometers.estimated_diameter_min.toFixed(3)} - ${randomAsteroid.estimated_diameter.kilometers.estimated_diameter_max.toFixed(3)}`;
      const genDistance = formatDistance(parseFloat(randomAsteroid.close_approach_data[0]?.miss_distance.kilometers || '0'));

      return `Based on your question, here's current NASA data about ${randomAsteroid.name}:\n\nDiameter: ${genDiameter} km\nDistance: ${genDistance}\nPotentially hazardous: ${randomAsteroid.is_potentially_hazardous_asteroid ? 'Yes' : 'No'}\n\nI have data on ${analysis.totalCount} asteroids total. Ask me for specific details!`;
  }
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
    
    const response = await fetch(nasaUrl);
    
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
    
    const responseText = generateResponse(queryType, analysis, message);

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
