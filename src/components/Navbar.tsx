"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        staggerChildren: 0.07,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={navVariants}
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-b-black/90 bg-space-black/80 backdrop-blur-md shadow-lg
      `}
    >
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              className="relative"
            >
              <div className="w-8 h-8 rounded-full bg-white bg-space-teal flex items-center justify-center">
                <span className="font-bold text-black">C</span>
              </div>
            </motion.div>
            <motion.span
              variants={itemVariants}
              className="font-bold text-xl tracking-tight text-white"
            >
              CosmoImpact
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <motion.nav
            variants={itemVariants}
            className="hidden md:flex space-x-8"
          >
            <NavLink href="#3d-section" isButton>
              Launch 3D View
            </NavLink>
            <NavLink href="/ask-astronomer" isButton>
              AskAstronomer
            </NavLink>
            {/* <NavLink href="#info">Info</NavLink> */}
            {/* <NavLink href="#contact">Contact</NavLink> */}
          </motion.nav>

          {/* Mobile Menu Button */}
          <motion.button
            variants={itemVariants}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden focus:outline-none"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <motion.span
                animate={
                  isMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }
                }
                className="w-full h-0.5 bg-white block transition-all"
              />
              <motion.span
                animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-full h-0.5 bg-white block transition-all"
              />
              <motion.span
                animate={
                  isMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }
                }
                className="w-full h-0.5 bg-white block transition-all"
              />
            </div>
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial="closed"
          animate={isMenuOpen ? "open" : "closed"}
          // @ts-expect-error blah
          variants={menuVariants}
          className="md:hidden overflow-hidden"
        >
          <div className="pt-4 pb-4 space-y-3">
            {/* <MobileNavLink href="#info" onClick={() => setIsMenuOpen(false)}>
              Info
            </MobileNavLink> */}
            <MobileNavLink
              href="#3d-section"
              onClick={() => setIsMenuOpen(false)}
            >
              Go to 3D
            </MobileNavLink>
            {/* <MobileNavLink href="#contact" onClick={() => setIsMenuOpen(false)}>
              Contact
            </MobileNavLink> */}
            <MobileNavLink
              href="/3d"
              onClick={() => setIsMenuOpen(false)}
              isButton
            >
              Launch 3D View
            </MobileNavLink>
            <MobileNavLink
              href="/ask-astronomer"
              onClick={() => setIsMenuOpen(false)}
              isButton
            >
              AskAstronomer
            </MobileNavLink>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}

function NavLink({
  href,
  children,
  isButton,
  newTab,
}: {
  href: string;
  children: React.ReactNode;
  isButton?: boolean;
  newTab?: boolean;
}) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
      <Link
        href={href}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
        className={`font-medium transition-all duration-300 ${
          isButton
            ? "bg-space-teal hover:bg-space-pink text-space-black px-6 py-2 rounded-full"
            : "text-white hover:text-space-teal"
        }`}
      >
        {children}
      </Link>
    </motion.div>
  );
}

function MobileNavLink({
  href,
  onClick,
  children,
  isButton,
  newTab,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
  isButton?: boolean;
  newTab?: boolean;
}) {
  const menuItemVariants = {
    closed: { opacity: 0, y: -10 },
    open: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={menuItemVariants}>
      <Link
        href={href}
        onClick={onClick}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
        className={`block font-medium transition-all duration-300 ${
          isButton
            ? "bg-space-teal hover:bg-space-pink text-space-black px-6 py-2 rounded-full text-center"
            : "text-white hover:text-space-teal py-2 text-center"
        }`}
      >
        {children}
      </Link>
    </motion.div>
  );
}
