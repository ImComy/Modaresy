import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Users, BookOpen, School } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const StatsSection = () => {
  const { t } = useTranslation();

  // Define stats data with target values
  const stats = [
    { icon: Users, value: 9000, label: t('stats.students') },
    { icon: School, value: 1000, label: t('stats.tutors') },
    { icon: BookOpen, value: 50, label: t('stats.subjects') },
  ];

  // State for animated numbers
  const [counts, setCounts] = useState(stats.map(() => 0));

  // Count-up animation effect
  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60; // 60 frames (assuming 30fps)
    const increments = stats.map(stat => stat.value / steps);

    const interval = setInterval(() => {
      setCounts(prevCounts =>
        prevCounts.map((count, index) =>
          Math.min(count + increments[index], stats[index].value)
        )
      );
    }, duration / steps);

    return () => clearInterval(interval);
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 15 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, delay: i * 0.1 },
    }),
  };

  return (
    <div className="
    grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
    gap-6 sm:gap-6 lg:gap-8 
    mt-12 sm:mt-16 lg:mt-20 
    px-4 sm:px-6 lg:px-10 py-8 
    rtl:rounded-tr-lg rtl:rounded-bl-md 
    ltr:rounded-tl-lg ltr:rounded-br-md 
    rtl:bg-gradient-to-bl ltr:bg-gradient-to-br 
    from-transparent via-background to-background
    ">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={index + 1}
        >
          <Card className="shadow-md hover:shadow-lg transition-shadow glass-effect hover:scale-105 hover:-translate-y-1 transition-transform duration-300 ease-out">
            <CardContent className="p-4 flex items-center gap-3">
              <motion.div
                className="bg-primary/10 text-primary p-2 rounded-full"
                whileHover={{ scale: [1, 1.3, 1.1], transition: { duration: 0.35, ease: "easeOut" } }}
              >
                <stat.icon size={20} />
              </motion.div>
              <motion.div whileHover={{ y: -3, transition: { duration: 0.3 } }} className="flex flex-col">
                <motion.p
                  className="text-2xl font-bold text-foreground"
                  animate={{ textContent: Math.round(counts[index]) }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                >
                  {Math.round(counts[index]) > stats[index].value - 10 ? `${stats[index].value.toLocaleString()}+` : Math.round(counts[index]).toLocaleString()}
                </motion.p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsSection;