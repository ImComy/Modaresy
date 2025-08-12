import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Presentation, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { studentService } from '@/api/student';

const StatsSection = () => {
  const { t } = useTranslation();

  const [counts, setCounts] = useState([0, 0, 0]); 
  const [targetValues, setTargetValues] = useState([0, 0, 0]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await studentService.getPlatformStats();
        const studentCount = data.studentCount || 0;
        const teacherCount = data.teacherCount || 0;
        const districtCount = data.totalDistricts || 0; 
        setTargetValues([studentCount, teacherCount, districtCount]);
      } catch (error) {
        setTargetValues([9000, 1000, 50]); // fallback values
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increments = targetValues.map(value => value / steps);

    const interval = setInterval(() => {
      setCounts(prev =>
        prev.map((count, i) => Math.min(count + increments[i], targetValues[i]))
      );
    }, duration / steps);

    return () => clearInterval(interval);
  }, [targetValues]);

  const stats = [
    { icon: GraduationCap, value: targetValues[0], label: t('stats.students') },
    { icon: Presentation, value: targetValues[1], label: t('stats.tutors') },
    { icon: MapPin, value: targetValues[2], label: t('stats.districts') },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 15 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, delay: i * 0.1 },
    }),
  };

  return (
    <div className="relative -mt-20 lg:mt-20 px-4 sm:px-6 lg:px-8">
      {/* Smooth fade-out container */}
<div className="relative w-full">
  {/* Natural fade overlay - no borders, no hard stops */}
  <div className="absolute inset-0 -z-10 
    rtl:bg-[linear-gradient(to_left,transparent_0%,hsl(var(--background))_100%)] 
    ltr:bg-[linear-gradient(to_right,transparent_0%,hsl(var(--background))_100%)]
    [mask-image:linear-gradient(to_bottom,black_20%,transparent_100%)]
  "></div>

  {/* Secondary subtle fade from bottom */}
  <div className="absolute inset-0 -z-10
    bg-gradient-to-t from-background/70 via-transparent to-transparent
    opacity-80
  "></div>
</div>

      
      {/* Stats cards container */}
      <div className="
        relative z-10
        flex flex-row flex-wrap justify-center
        gap-3 sm:gap-6 lg:gap-8
        py-6
      ">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={index + 1}
            className="flex-1 min-w-[150px] max-w-[250px]"
          >
            <Card className="
              shadow-md hover:shadow-lg
              transition-shadow glass-effect
              hover:scale-[1.02] hover:-translate-y-0.5
              transition-transform duration-300 ease-out
              h-full
            ">
              <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                <motion.div
                  className="bg-primary/10 text-primary p-2 rounded-full"
                  whileHover={{ scale: [1, 1.3, 1.1], transition: { duration: 0.35, ease: "easeOut" } }}
                >
                  <stat.icon size={20} />
                </motion.div>
                <motion.div whileHover={{ y: -2, transition: { duration: 0.3 } }} className="flex flex-col">
                  <motion.p
                    className="text-xl sm:text-2xl font-bold text-foreground"
                    animate={{ textContent: Math.round(counts[index]) }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                  >
                    {Math.round(counts[index]) > stat.value - 10 ? `${stat.value.toLocaleString()}+` : Math.round(counts[index]).toLocaleString()}
                  </motion.p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StatsSection;