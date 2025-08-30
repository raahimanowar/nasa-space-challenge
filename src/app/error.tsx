"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

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

  // Animated stars for background
  const stars = Array.from({ length: 20 }, (_, i) => (
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
  ));

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
        <motion.div
          className="absolute bg-gradient-to-r from-white to-transparent h-0.5 w-[100px]"
          initial={{ x: -100, y: -100, opacity: 1 }}
          animate={{
            x: ["10vw", "90vw"],
            y: ["20vh", "60vh"],
            opacity: [1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 4,
            ease: "linear",
          }}
          style={{ transform: "rotate(25deg)" }}
        />
      </div>

      <motion.div
        className="max-w-lg w-full bg-space-blue/20 backdrop-blur-md p-8 rounded-xl border border-space-teal/30 z-10 shadow-xl shadow-space-purple/10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500"
          //   @ts-expect-error blah
          variants={itemVariants}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-red-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </motion.div>

        <motion.h1
          className="text-3xl md:text-4xl font-bold text-white text-center mb-4"
          //   @ts-expect-error blah

          variants={itemVariants}
        >
          Houston, We Have a Problem
        </motion.h1>

        <motion.p
          className="text-gray-300 text-center mb-6"
          //   @ts-expect-error blah

          variants={itemVariants}
        >
          Something went wrong while loading this page. Our space engineers are
          working on fixing it.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          //   @ts-expect-error blah

          variants={itemVariants}
        >
          <button
            onClick={reset}
            className="px-6 py-3 bg-space-purple hover:bg-space-pink transition-colors duration-300 rounded-full text-white font-medium"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="px-6 py-3 bg-transparent hover:bg-space-teal/10 border border-space-teal transition-colors duration-300 rounded-full text-space-teal font-medium text-center"
          >
            Return to Mission Control
          </Link>
        </motion.div>

        <motion.div
          className="mt-8 p-4 bg-space-black/30 rounded-lg border border-yellow-500/20 text-sm text-gray-400"
          //   @ts-expect-error blah

          variants={itemVariants}
        >
          <p className="font-mono">
            Error Code: {error.digest || "UNKNOWN"}
            <br />
            {process.env.NODE_ENV === "development" && error.message}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
