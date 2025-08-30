"use client";

import React, { useState, useEffect } from "react";

interface StarFieldProps {
  starCount?: number;
  meteorCount?: number;
}

interface StarData {
  id: string;
  top: number;
  left: number;
  width: number;
  height: number;
  opacity: number;
  duration: number;
  delay: number;
}

interface MeteorData {
  id: string;
  top: number;
  left: number;
  animationDelay: number;
  animationDuration: number;
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateStarData(count: number): StarData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `star-${i}`,
    top: seededRandom(i * 7 + 1) * 100,
    left: seededRandom(i * 7 + 2) * 100,
    width: seededRandom(i * 7 + 3) * 3 + 1,
    height: seededRandom(i * 7 + 4) * 3 + 1,
    opacity: seededRandom(i * 7 + 5) * 0.8 + 0.2,
    duration: seededRandom(i * 7 + 6) * 3 + 2,
    delay: seededRandom(i * 7 + 7) * 2,
  }));
}

function generateMeteorData(count: number): MeteorData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `meteor-${i}`,
    top: seededRandom(i * 13 + 1) * 50,
    left: seededRandom(i * 13 + 2) * 100,
    animationDelay: seededRandom(i * 13 + 3) * 10,
    animationDuration: seededRandom(i * 13 + 4) * 2 + 4,
  }));
}

export default function StarField({ starCount = 100, meteorCount = 5 }: StarFieldProps) {
  const [stars, setStars] = useState<StarData[]>([]);
  const [meteors, setMeteors] = useState<MeteorData[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setStars(generateStarData(starCount));
    setMeteors(generateMeteorData(meteorCount));
    setMounted(true);
  }, [starCount, meteorCount]);

  if (!mounted) {
    return <div className="stars" />;
  }

  return (
    <div className="stars">
      {stars.map((star) => (
        <div 
          key={star.id}
          className="star"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.width}px`,
            height: `${star.height}px`,
            '--opacity': star.opacity,
            '--duration': `${star.duration}s`,
            '--delay': `${star.delay}s`,
          } as React.CSSProperties}
        />
      ))}
      {meteors.map((meteor) => (
        <div 
          key={meteor.id}
          className="meteor"
          style={{
            top: `${meteor.top}%`,
            left: `${meteor.left}%`,
            animationDelay: `${meteor.animationDelay}s`,
            animationDuration: `${meteor.animationDuration}s`,
          }}
        />
      ))}
    </div>
  );
}
