import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Search, UserCheck, MessageSquare, Sparkles, GraduationCap, MapPin as MapPinIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import StatsSection from '@/components/home/stats';

const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { duration: 0.3, delay: i * 0.1 },
    }),
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 15 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, delay: i * 0.1 },
    }),
  };

  return (
    <section className="relative py-10 md:py-20 lg:py-24 overflow-hidden bg-gradient-to-b from-background via-blue-50 dark:via-blue-900/10 to-background">
      <div className="absolute top-0 bottom-0 w-full md:w-3/4 -z-10 ltr:right-0 rtl:left-0">
        <div className="
            absolute inset-0 -z-10 
            bg-[url('/teaching.jpg')] 
            bg-no-repeat bg-cover 
            ltr:bg-[right_center] rtl:bg-[left_center] 
            opacity-30 rounded-lg 
            after:content-[''] 
            after:absolute after:inset-0 
            after:rounded-lg 
            md:ltr:after:bg-gradient-to-l md:rtl:after:bg-gradient-to-r 
            md:after:from-primary/10 md:after:to-transparent
        ">
            <div className="absolute inset-0 md:ltr:bg-gradient-to-r md:rtl:bg-gradient-to-l md:from-background md:via-blue-50 md:dark:via-blue-900/10 md:to-background" />
        </div>
      </div>

      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-secondary/5 rounded-full filter blur-3xl opacity-40 animate-pulse animation-delay-2000"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-5 text-center lg:text-left rtl:lg:text-right leading-relaxed">
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={1}>
            <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-2">
              <Sparkles size={12} className="inline mr-1 rtl:ml-1" /> {t('platformHighlight')}
            </span>
          </motion.div>
          <motion.h1
            variants={fadeInUp} initial="hidden" animate="visible" custom={2}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-800 dark:from-primary dark:to-blue-400 py-2"
          >
            {t('heroTitle')}
          </motion.h1>
          <motion.p
            variants={fadeInUp} initial="hidden" animate="visible" custom={3}
            className="text-lg md:text-xl text-muted-foreground"
          >
            {t('heroSubtitle')}
          </motion.p>
          <motion.div
            variants={fadeInUp} initial="hidden" animate="visible" custom={4}
            className="pt-3"
          >
            <Button size="lg" onClick={() => navigate('/filters')} className="shadow-lg hover:shadow-primary/40 transition-shadow duration-300">
              {t('getStarted')} <Search size={20} className="ml-2 rtl:mr-2 rtl:ml-0" />
            </Button>
          </motion.div>
        </div>
        <motion.div
          variants={fadeIn}
          initial="visible"
          animate="visible"
          custom={2}
          className="relative hidden lg:block"
        >
          <div className="relative grid grid-cols-2 gap-4">
            <motion.div variants={fadeInUp} custom={2.5}>
              <Card className="shadow-md hover:shadow-lg transition-shadow glass-effect hover:scale-105 hover:-translate-y-1 transition-transform duration-300 ease-out">
                <CardContent className="p-4 flex items-center gap-3">
                  <motion.div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-full"
                    whileHover={{ scale: [1, 1.3, 1.1], transition: { duration: 0.35, ease: "easeOut" } }}>
                    <GraduationCap size={20} />
                  </motion.div>
                  <motion.div whileHover={{ y: -3, transition: { duration: 0.3 } }} className="flex flex-col">
                    <p className="font-semibold text-sm">{t("subjectsCount")}</p>
                    <p className="text-xs text-muted-foreground">{t("subjectsAvailable")}</p>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeInUp} custom={3}>
              <Card className="shadow-md hover:shadow-lg transition-shadow glass-effect mt-8 hover:scale-105 hover:-translate-y-1 transition-transform duration-300 ease-out">
                <CardContent className="p-4 flex items-center gap-3">
                  <motion.div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-full"
                    whileHover={{ scale: [1, 1.3, 1.1], transition: { duration: 0.35, ease: "easeOut" } }}>
                    <UserCheck size={20} />
                  </motion.div>
                  <motion.div whileHover={{ y: -3, transition: { duration: 0.3 } }} className="flex flex-col">
                    <p className="font-semibold text-sm">{t("verifiedTutors")}</p>
                    <p className="text-xs text-muted-foreground">{t("verifiedTutorsDesc")}</p>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeInUp} custom={3.5}>
              <Card className="shadow-md hover:shadow-lg transition-shadow glass-effect -mt-4 hover:scale-105 hover:-translate-y-1 transition-transform duration-300 ease-out">
                <CardContent className="p-4 flex items-center gap-3">
                  <motion.div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 p-2 rounded-full"
                    whileHover={{ scale: [1, 1.3, 1.1], transition: { duration: 0.35, ease: "easeOut" } }}>
                    <MapPinIcon size={20} />
                  </motion.div>
                  <motion.div whileHover={{ y: -3, transition: { duration: 0.3 } }} className="flex flex-col">
                    <p className="text-semibold text-sm">{t("locationsCovered")}</p>
                    <p className="text-xs text-muted-foreground">{t("locationsCoveredDesc")}</p>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeInUp} custom={4}>
              <Card className="shadow-md hover:shadow-lg transition-shadow glass-effect mt-4 hover:scale-105 hover:-translate-y-1 transition-transform duration-300 ease-out">
                <CardContent className="p-4 flex items-center gap-3">
                  <motion.div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-2 rounded-full"
                    whileHover={{ scale: [1, 1.3, 1.1], transition: { duration: 0.35, ease: "easeOut" } }}>
                    <MessageSquare size={20} />
                  </motion.div>
                  <motion.div whileHover={{ y: -3, transition: { duration: 0.3 } }} className="flex flex-col">
                    <p className="font-semibold text-sm">{t("easyCommunication")}</p>
                    <p className="text-xs text-muted-foreground">{t("easyCommunicationDesc")}</p>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={4.5}
            className="mt-4"
          >
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;