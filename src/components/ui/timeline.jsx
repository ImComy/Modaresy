import React, { useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useEffect } from 'react';

const studentBenefits = [
  {
    title: 'Find top-rated tutors',
    description: 'Browse thousands of verified, high-quality educators in your area or subject.',
  },
  {
    title: 'Learn your way',
    description: 'Choose between one-on-one sessions, group lessons, or video courses.',
  },
 {
    title: 'Track your progress',
    description: 'See your achievements, completed sessions, and skill improvements over time.',
  },
  {
    title: 'Tailored to your curriculum',
    description: 'Support for Thanaweya Amma, IGCSE, American, and more.',
  },
];

const teacherBenefits = [
  {
    title: 'Grow your student base',
    description: 'Reach thousands of students looking for your skills and subjects.',
  },
  {
    title: 'Flexible scheduling',
    description: 'Set your own availability and teach when it suits you.',
  },
  {
    title: 'Easy payments',
    description: 'Get paid securely and on time for every lesson.',
  },
  {
    title: 'Build your brand',
    description: 'Showcase your expertise with profiles, reviews, and badges.',
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export const ScrollableTimeline = ({ userType }) => {
  const benefits = userType === 'teacher' ? teacherBenefits : studentBenefits;

  return (
    <div className="relative bg-background">
      <div className="relative mx-auto px-6">
        {/* Central connecting vertical line */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[3px] bg-primary/20 z-0" />

        <ul className="space-y-32 relative z-10">
          {benefits.map((item, index) => {
            const ref = useRef(null);
            const inView = useInView(ref, { once: true, margin: '-120px' });
            const controls = useAnimation();

            useEffect(() => {
              if (inView) {
                controls.start('visible');
              }
            }, [inView, controls]);

            const isEven = index % 2 === 0;

            return (
              <motion.li
                key={index}
                ref={ref}
                initial="hidden"
                animate={controls}
                variants={itemVariants}
                className="relative flex items-center"
              >
                {/* Timeline Dot */}
                <div className="absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary border-4 border-background z-10 shadow-md" />

                {/* Connecting line segment above dot */}
                {index > 0 && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-[-64px] h-16 w-[3px] bg-primary/30 z-0" />
                )}

                {/* Card */}
                <div
                  className={`
                    w-full sm:w-[48%] bg-white dark:bg-muted rounded-xl shadow-xl border border-border px-6 py-8 
                    ${isEven ? 'ml-auto text-left' : 'mr-auto text-right'}
                  `}
                >
                  <h3 className="text-xl md:text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">{item.description}</p>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
