import React, { useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useEffect } from 'react';
import { 
  GraduationCap, 
  Target, 
  TrendingUp, 
  Users, 
  Clock, 
  CreditCard 
} from 'lucide-react';

const studentBenefits = [
  {
    title: 'Find top-rated tutors',
    description: 'Browse thousands of verified, high-quality educators in your area or subject.',
    icon: GraduationCap,
    color: 'bg-blue-500',
    gradient: 'from-blue-500 to-blue-400'
  },
  {
    title: 'Learn your way',
    description: 'Choose between one-on-one sessions, group lessons, or video courses.',
    icon: Target,
    color: 'bg-blue-500',
    gradient: 'from-blue-500 to-blue-400'
  },
  {
    title: 'Track your progress',
    description: 'See your achievements, completed sessions, and skill improvements over time.',
    icon: TrendingUp,
    color: 'bg-blue-500',
    gradient: 'from-blue-500 to-blue-400'
  },
];

const teacherBenefits = [
  {
    title: 'Grow your student base',
    description: 'Reach thousands of students looking for your skills and subjects.',
    icon: Users,
    color: 'bg-blue-500',
    gradient: 'from-blue-500 to-blue-400'
  },
  {
    title: 'Flexible scheduling',
    description: 'Set your own availability and teach when it suits you.',
    icon: Clock,
    color: 'bg-purple-500',
    gradient: 'from-purple-500 to-purple-400'
  },
  {
    title: 'Easy payments',
    description: 'Get paid securely and on time for every lesson.',
    icon: CreditCard,
    color: 'bg-green-500',
    gradient: 'from-green-500 to-green-400'
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    } 
  },
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.2,
      duration: 0.7,
      ease: [0.34, 1.56, 0.64, 1]
    }
  }
};

const pulseVariants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const gradientVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

export const ScrollableTimeline = ({ userType }) => {
  const benefits = userType === 'teacher' ? teacherBenefits : studentBenefits;
  const containerRef = useRef(null);

  return (
    <div className="relative bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-16 overflow-hidden rounded-xl">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          initial={{ x: '-20%', y: '-20%' }}
          animate={{ x: ['-20%', '-10%', '-20%'], y: ['-20%', '-30%', '-20%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/4 top-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-[100px]"
        />
        <motion.div 
          initial={{ x: '20%', y: '20%' }}
          animate={{ x: ['20%', '30%', '20%'], y: ['20%', '10%', '20%'] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-1/4 bottom-1/4 w-96 h-96 rounded-full bg-purple-500/10 blur-[100px]"
        />
        <motion.div 
          initial={{ x: '-10%', y: '10%' }}
          animate={{ x: ['-10%', '10%', '-10%'], y: ['10%', '-10%', '10%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 top-1/2 w-64 h-64 rounded-full bg-amber-500/10 blur-[80px]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="relative" ref={containerRef}>
          {/* Animated central line */}
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: '100%' }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-gray-200 to-transparent dark:via-gray-700 z-0"
          />

          <ul className="space-y-24 relative z-10">
            {benefits.map((item, index) => {
              const ref = useRef(null);
              const inView = useInView(ref, { once: true, margin: '-100px' });
              const controls = useAnimation();
              const IconComponent = item.icon;

              useEffect(() => {
                if (inView) {
                  controls.start('visible');
                }
              }, [inView, controls]);

              return (
                <motion.li
                  key={index}
                  ref={ref}
                  initial="hidden"
                  animate={controls}
                  variants={itemVariants}
                  className="relative"
                >
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Left content (alternates on desktop) */}
                    <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:order-1' : 'md:order-3'}`}>
                      <motion.div 
                        className="relative group"
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className={`absolute -inset-2 rounded-xl bg-${item.color}/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300`} />
                        <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
                          <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Center icon */}
                    <div className="hidden md:flex w-2/12 justify-center relative z-10">
                      <motion.div
                        variants={iconVariants}
                        className={`flex items-center justify-center w-16 h-16 rounded-full ${item.color} text-white shadow-lg`}
                        animate="pulse"
                      >
                        <IconComponent className="w-8 h-8" />
                      </motion.div>
                      {/* Connecting line */}
                      {index > 0 && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-[-60px] h-14 w-1 bg-gradient-to-b from-transparent via-gray-200 to-transparent dark:via-gray-700" />
                      )}
                    </div>

                    {/* Right gradient card (replaces image) */}
                    <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:order-3' : 'md:order-1'}`}>
                      <motion.div
                        variants={gradientVariants}
                        className={`relative overflow-hidden rounded-2xl shadow-xl h-64 md:h-80 flex items-center justify-center bg-gradient-to-br ${item.gradient}`}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="absolute w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm" />
                          <div className="absolute w-48 h-48 rounded-full bg-white/5 backdrop-blur-sm" />
                        </div>
                        <div className="relative z-10 text-center p-6">
                          <div className={`w-16 h-16 rounded-full ${item.color} flex items-center justify-center text-white mb-6 mx-auto shadow-lg`}>
                            <IconComponent className="w-8 h-8" />
                          </div>
                          <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                          <p className="text-white/80 mt-2">{item.description}</p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Mobile icon */}
                    <div className="md:hidden w-full flex justify-center">
                      <motion.div
                        variants={iconVariants}
                        className={`flex items-center justify-center w-14 h-14 rounded-full ${item.color} text-white shadow-lg`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </motion.div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};