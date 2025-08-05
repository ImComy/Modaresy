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
        console.log("Fetched stats from backend:", data); 

        const studentCount = data.studentCount || 0;
        const teacherCount = data.teacherCount || 0;
        const districtCount = data.totalDistricts || 0; 

        console.log("Parsed counts:", { studentCount, teacherCount, districtCount }); 

        setTargetValues([studentCount, teacherCount, districtCount]);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setTargetValues([9000, 1000, 50]); // fallback values
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    console.log("Animating to target values:", targetValues); 

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
                  {Math.round(counts[index]) > stat.value - 10 ? `${stat.value.toLocaleString()}+` : Math.round(counts[index]).toLocaleString()}
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
