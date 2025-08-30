'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function Info() {
  const [ref1, inView1] = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  const [ref2, inView2] = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const features = [
    {
      title: "3D Earth Model",
      description: "Highly detailed 3D model of Earth with realistic textures and atmosphere effects.",
      icon: "🌎"
    },
    {
      title: "Asteroid Simulation",
      description: "Realistic asteroid models with accurate physics-based trajectories and impact calculations.",
      icon: "☄️"
    },
    {
      title: "Impact Visualization",
      description: "Dynamic visualization of impact effects including shockwaves, debris, and environmental changes.",
      icon: "💥"
    },
    {
      title: "Scientific Accuracy",
      description: "Based on NASA data and scientific models for educational purposes and awareness.",
      icon: "🔬"
    }
  ];

  return (
    <section id="info" className="py-24 w-11/12 mx-auto px-4 relative overflow-hidden">
      <div className="container mx-auto">
        <motion.div
          ref={ref1}
          initial="hidden"
          animate={inView1 ? "visible" : "hidden"}
          // @ts-expect-error blah
          variants={fadeInUpVariants}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600">
            About The <span className="text-space-teal">Project</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Our NASA Space App Challenge project aims to create an educational and interactive
            visualization of asteroid impacts on Earth. By combining accurate scientific data
            with engaging 3D graphics, we hope to increase awareness about near-Earth objects
            and their potential consequences.
          </p>
        </motion.div>

        <motion.div
          ref={ref2}
          initial="hidden"
          animate={inView2 ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              // @ts-expect-error blah
              variants={fadeInUpVariants}
              className="bg-space-blue/30 backdrop-blur-sm p-6 rounded-xl border border-space-teal/20 hover:border-space-teal/50 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-space-teal">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}