'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';

export default function GoTo3D() {
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: false
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0, 0, 0.58, 1] } // cubic-bezier for easeOut
    }
  };

  return (
    <section 
      id="3d-section" 
      className="py-24 px-4 relative overflow-hidden"
      ref={ref}
    >
      <div className="absolute inset-0 bg-space-purple/10 backdrop-blur-sm z-0"></div>
      
      <motion.div 
        className="container mx-auto relative z-10"
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-3xl md:text-5xl font-bold mb-6 text-white"
              // @ts-expect-error blah
            variants={itemVariants}
          >
            Experience The <span className="text-space-pink">3D Simulation</span>
          </motion.h2>
          
          <motion.p 
            className="text-lg text-gray-300 mb-12"
              // @ts-expect-error blah
            variants={itemVariants}
          >
            Our interactive 3D visualization allows you to witness the dramatic effects of an asteroid 
            impact on Earth. Launch the simulation to control the size, velocity, and impact location 
            of the asteroid and see the resulting effects in real-time.
          </motion.p>
          
          <motion.div 
            className="bg-space-black/50 p-8 rounded-2xl mb-12 backdrop-blur-md border border-space-teal/20"
              // @ts-expect-error blah
            variants={itemVariants}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div>
                <h3 className="text-xl font-bold mb-2 text-space-teal">Select Asteroid</h3>
                <p className="text-gray-300">Choose from different asteroid sizes and compositions</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-space-teal">Set Trajectory</h3>
                <p className="text-gray-300">Adjust velocity, angle, and target location on Earth</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-space-teal">View Impact</h3>
                <p className="text-gray-300">Witness the collision and resulting environmental effects</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
              // @ts-expect-error blah
          variants={itemVariants}>
            <Link 
              href="/visual"
              className="inline-flex items-center px-8 py-4 rounded-full bg-space-teal hover:bg-space-pink transition-all duration-300 text-white font-bold text-lg group"
            >
              Launch 3D Experience
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}