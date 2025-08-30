"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { JSX, useEffect, useState } from "react";

export default function NotFound() {
  const [stars, setStars] = useState<JSX.Element[]>([]);

  useEffect(() => {
    // Generate stars on client side to avoid hydration mismatch
    setStars(
      Array.from({ length: 50 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full"
          initial={{
            opacity: 0,
            scale: 0,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            opacity: [0, Math.random() * 0.8, 0],
            scale: [0, Math.random() * 1.5, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2 + Math.random() * 3,
            delay: Math.random() * 2,
          }}
          style={{
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
          }}
        />
      ))
    );
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Planet animation
  const planetVariants = {
    rotate: {
      rotate: 360,
      transition: {
        duration: 200,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  // Floating animation
  const floatingVariants = {
    float: {
      y: [0, -20, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-gradient-to-b from-space-black to-space-blue overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {stars}

        {/* Meteor animations */}
        <motion.div
          className="absolute bg-gradient-to-r from-white to-transparent h-0.5 w-[150px]"
          initial={{ x: -100, y: -100, opacity: 1 }}
          animate={{
            x: ["0vw", "100vw"],
            y: ["0vh", "70vh"],
            opacity: [1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "linear",
          }}
          style={{ transform: "rotate(15deg)" }}
        />
      </div>

      {/* Planet in the background */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-space-purple/20 to-space-blue/40 blur-lg"
        style={{ top: "5%", right: "-15%" }}
        // @ts-expect-error blah
        variants={planetVariants}
        animate="rotate"
      />

      <motion.div
        className="max-w-lg w-full bg-space-blue/20 backdrop-blur-md p-8 rounded-xl border border-space-teal/30 z-10 shadow-xl shadow-space-purple/10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="w-28 h-28 mx-auto mb-8"
          // @ts-expect-error blah

          variants={floatingVariants}
          animate="float"
        >
          {/* Lost astronaut illustration */}
          <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-600 to-gray-900 flex items-center justify-center relative">
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-gray-400 to-gray-700 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-800 to-space-black flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-space-black flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full absolute top-3 right-3"></div>
                </div>
              </div>
              <div className="absolute -top-4 -right-2 w-5 h-5 rounded-full bg-red-500 animate-pulse"></div>
            </div>
          </div>
        </motion.div>

        <motion.h1
          className="text-4xl md:text-5xl font-bold text-white text-center mb-2"
          // @ts-expect-error blah

          variants={itemVariants}
        >
          404
        </motion.h1>

        <motion.h2
          className="text-2xl md:text-3xl font-bold text-space-teal text-center mb-6"
          // @ts-expect-error blah

          variants={itemVariants}
        >
          Lost in Space
        </motion.h2>

        <motion.p
          className="text-gray-300 text-center mb-8"
          // @ts-expect-error blah

          variants={itemVariants}
        >
          The page you&apos;re looking for has drifted beyond our reach. It might
          have been moved, deleted, or never existed in our universe.
        </motion.p>

        <motion.div
          className="flex justify-center"
          // @ts-expect-error blah

          variants={itemVariants}
        >
          <Link
            href="/"
            className="px-8 py-3 bg-space-purple hover:bg-space-pink transition-colors duration-300 rounded-full text-white font-medium"
          >
            Return to Mission Control
          </Link>
        </motion.div>

        <motion.p
          className="mt-8 text-sm text-gray-400 text-center"
          // @ts-expect-error blah

          variants={itemVariants}
        >
          &quot;In space, no one can hear you 404.&quot;
        </motion.p>
      </motion.div>
    </div>
  );
}
