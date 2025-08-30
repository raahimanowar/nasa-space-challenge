"use client";

import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import Link from "next/link";
import ImpactScene from "./ImpactScene";
import ScrollDown from "./ScrollDown";

export default function Hero() {
  const asteroid = useAnimation();
  const earth = useAnimation();

  const approachDuration = 1.1;
  const impactShakeDuration = 0.6;
  const destroyedHold = 0.9;
  const pauseBetween = 0.6;

  const orbitVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  const [destroyed, setDestroyed] = React.useState(false);

  useEffect(() => {
    let mounted = true;

    async function loop() {
      while (mounted) {
        try {
          // Position asteroid at starting position
          if (!mounted) break;
          await asteroid.start({
            x: 140,
            y: -140,
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: { duration: 0 },
          });

          // Wait before approach
          if (!mounted) break;
          await new Promise((r) => {
            const timeout = setTimeout(r, 220);
            return () => clearTimeout(timeout);
          });

          // Asteroid approach animation
          if (!mounted) break;
          await asteroid.start({
            x: 0,
            y: 0,
            rotate: 720,
            transition: { duration: approachDuration, ease: "linear" },
          });

          // Impact happened
          if (!mounted) break;
          setDestroyed(true);

          // Earth shake animation
          if (!mounted) break;
          await earth.start({
            scale: [1, 1.08, 0.98, 1.02, 1],
            x: [0, 6, -6, 3, 0],
            y: [0, -5, 5, -2, 0],
            transition: { duration: impactShakeDuration, ease: "easeInOut" },
          });

          // Asteroid explosion animation
          if (!mounted) break;
          await asteroid.start({
            opacity: 0,
            scale: 1.8,
            transition: { duration: 0.8, ease: "easeOut" },
          });

          // Hold on destroyed state
          if (!mounted) break;
          await new Promise((r) => {
            const timeout = setTimeout(r, (impactShakeDuration + destroyedHold) * 1000);
            return () => clearTimeout(timeout);
          });

          // Reset destroyed state
          if (!mounted) break;
          setDestroyed(false);

          // Earth reset animation
          if (!mounted) break;
          await earth.start({
            scale: 1,
            x: 0,
            y: 0,
            rotate: 0,
            transition: { duration: 0.6, ease: "easeOut" },
          });

          // Pause before next loop
          if (!mounted) break;
          await new Promise((r) => {
            const timeout = setTimeout(r, pauseBetween * 1000);
            return () => clearTimeout(timeout);
          });
        } catch (error) {
          // If we get an error (like component unmounted), break the loop
          console.log("Animation loop interrupted:", error);
          break;
        }
      }
    }

    // Start the animation loop
    loop();

    // Cleanup function
    return () => {
      mounted = false;
      asteroid.stop();
      earth.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-4 overflow-hidden bg-black">
      {/* 🔹 Background video */}
      <div className="absolute inset-0 w-full h-full">
        <video
          src="https://res.cloudinary.com/dj1brd57q/video/upload/v1756443692/video_c7a86c18_1756443244480.mp4_lirphz.mp4"
          className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-80"
          autoPlay
          loop
          muted
          playsInline
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>



      {/* 🔹 Bottom fade overlay (to blend video edge) */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#050714] via-black/40 to-transparent z-10" />

      <div className="container relative z-20 mx-auto flex flex-col md:flex-row items-center justify-between gap-12 px-4 md:px-0">
        {/* Left side (text) */}
        <div className="md:w-1/2 lg:ml-10 z-20 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
            <span className="block text-white">Witness The</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-outline">
              Asteroid Impact
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-8 max-w-xl mx-auto md:mx-0">
            Explore a 3D visualization of asteroid impacts on Earth. Discover
            the dynamic consequences of cosmic collisions through our
            interactive simulation.
          </p>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-4 justify-center md:justify-start">
            <Link
              href="/visual"
              className="inline-block w-full sm:w-auto text-center pr-8 py-3 rounded-full bg-space-purple hover:bg-space-pink transition-all duration-300 font-medium text-white"
            >
              Launch 3D Experience
            </Link>

            <a
              href="#info"
              className="inline-block w-full sm:w-auto text-center px-4 py-3 rounded-full bg-transparent hover:bg-space-teal/10 border border-space-teal transition-all duration-300 font-medium text-space-teal"
            >
              Learn More
            </a>

            <ScrollDown />
          </div>
        </div>

        {/* Right side empty (video is full background now) */}
        <div className="md:w-1/2"></div>
      </div>

    </section>


  );
}
