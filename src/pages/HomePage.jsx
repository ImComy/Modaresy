
    import React from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { useTranslation } from 'react-i18next';
    import { Search, UserCheck, FileText, MessageSquare, Sparkles, GraduationCap, MapPin as MapPinIcon } from 'lucide-react'; // Added icons
    import TutorGrid from '@/components/tutors/TutorGrid';
    import HorizontalFilters from '@/components/tutors/HorizontalFilters';
    import { mockTutors } from '@/data/mockTutors';
    import { useTutorFilterSort } from '@/hooks/useTutorFilterSort';
    import { Card, CardContent } from '@/components/ui/card'; // Import Card components

    const HomePage = () => {
      const { t } = useTranslation();
      const {
        searchTerm,
        setSearchTerm,
        filters,
        handleFilterChange,
        handleRateChange,
        sortBy,
        setSortBy,
        sortedTutors,
      } = useTutorFilterSort(mockTutors);

      const fadeIn = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
          opacity: 1,
          transition: { duration: 0.3, delay: i * 0.1 }, // Simple fade-in
        }),
      };

      const fadeInUp = {
         hidden: { opacity: 0, y: 15 },
         visible: (i = 1) => ({
           opacity: 1,
           y: 0,
           transition: { duration: 0.3, delay: i * 0.1 }, // Simple fade-in up
         }),
      };

      return (
        <div className="space-y-12 md:space-y-16 ">
          {/* New Hero Section Design */}
          <section className="relative py-16 md:py-20 lg:py-24 overflow-hidden bg-gradient-to-b from-background via-blue-50 dark:via-blue-900/10 to-background">
            <div className="absolute inset-0 -z-10">
              {/* Subtle background pattern or shapes */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-72 h-72 bg-secondary/5 rounded-full filter blur-3xl opacity-40 animate-pulse animation-delay-2000"></div>
            </div>
            <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Text Content */}
              <div className="space-y-5 text-center lg:text-left rtl:lg:text-right">
                <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={1}>
                  <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-2">
                    <Sparkles size={12} className="inline mr-1 rtl:ml-1" /> {t('platformHighlight')} {/* Add new translation key */}
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
                  <Button size="lg" className="shadow-lg hover:shadow-primary/40 transition-shadow duration-300">
                    {t('getStarted')} <Search size={18} className="ml-2 rtl:mr-2 rtl:ml-0" />
                  </Button>
                </motion.div>
              </div>

              {/* Right Animated Cards/Image */}
              <motion.div
                variants={fadeIn} initial="hidden" animate="visible" custom={2}
                className="relative hidden lg:block"
              >
                <div className="grid grid-cols-2 gap-4">
                   <motion.div variants={fadeInUp} custom={2.5}>
                     <Card className="shadow-md hover:shadow-lg transition-shadow glass-effect">
                         <CardContent className="p-4 flex items-center gap-3">
                            <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-full"> <GraduationCap size={20}/> </div>
                             <div>
                                 <p className="font-semibold text-sm">{t('subjectsCount')}</p> {/* Add key */}
                                 <p className="text-xs text-muted-foreground">{t('subjectsAvailable')}</p> {/* Add key */}
                             </div>
                         </CardContent>
                     </Card>
                   </motion.div>
                   <motion.div variants={fadeInUp} custom={3}>
                      <Card className="shadow-md hover:shadow-lg transition-shadow glass-effect mt-8">
                         <CardContent className="p-4 flex items-center gap-3">
                            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-full"> <UserCheck size={20}/> </div>
                             <div>
                                 <p className="font-semibold text-sm">{t('verifiedTutors')}</p> {/* Add key */}
                                 <p className="text-xs text-muted-foreground">{t('verifiedTutorsDesc')}</p> {/* Add key */}
                             </div>
                         </CardContent>
                     </Card>
                   </motion.div>
                    <motion.div variants={fadeInUp} custom={3.5}>
                      <Card className="shadow-md hover:shadow-lg transition-shadow glass-effect -mt-4">
                         <CardContent className="p-4 flex items-center gap-3">
                            <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 p-2 rounded-full"> <MapPinIcon size={20}/> </div>
                             <div>
                                 <p className="font-semibold text-sm">{t('locationsCovered')}</p> {/* Add key */}
                                 <p className="text-xs text-muted-foreground">{t('locationsCoveredDesc')}</p> {/* Add key */}
                             </div>
                         </CardContent>
                     </Card>
                   </motion.div>
                    <motion.div variants={fadeInUp} custom={4}>
                      <Card className="shadow-md hover:shadow-lg transition-shadow glass-effect mt-4">
                         <CardContent className="p-4 flex items-center gap-3">
                            <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-2 rounded-full"> <MessageSquare size={20}/> </div>
                             <div>
                                 <p className="font-semibold text-sm">{t('easyCommunication')}</p> {/* Add key */}
                                 <p className="text-xs text-muted-foreground">{t('easyCommunicationDesc')}</p> {/* Add key */}
                             </div>
                         </CardContent>
                     </Card>
                   </motion.div>
                </div>
              </motion.div>
            </div>
          </section>


          {/* Filter and Tutor List Section */}
          <section className="space-y-6 container mx-auto px-4">
             <motion.h2 variants={fadeInUp} initial="hidden" animate="visible" custom={1} className="text-2xl md:text-3xl font-bold text-center">{t('findYourTutor')}</motion.h2>
             <HorizontalFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filters={filters}
                handleFilterChange={handleFilterChange}
                handleRateChange={handleRateChange}
                sortBy={sortBy}
                setSortBy={setSortBy}
             />
             <TutorGrid tutors={sortedTutors} />
          </section>

          {/* How It Works Section */}
           <section className="py-12 md:py-16 bg-muted/40">
             <div className="container mx-auto text-center space-y-8">
               <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} className="text-2xl md:text-3xl font-bold">{t('howItWorks')}</motion.h2>
               <div className="grid md:grid-cols-3 gap-8">
                 <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}>
                   <div className="p-6 space-y-3 flex flex-col items-center">
                     <div className="bg-primary/10 text-primary rounded-full p-3 mb-3"> <Search size={28} /> </div>
                     <h3 className="text-lg font-semibold">{t('step1Title')}</h3>
                     <p className="text-sm text-muted-foreground">{t('step1Desc')}</p>
                   </div>
                 </motion.div>
                 <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2.5}>
                   <div className="p-6 space-y-3 flex flex-col items-center">
                      <div className="bg-primary/10 text-primary rounded-full p-3 mb-3"> <UserCheck size={28} /> </div>
                     <h3 className="text-lg font-semibold">{t('step2Title')}</h3>
                     <p className="text-sm text-muted-foreground">{t('step2Desc')}</p>
                   </div>
                 </motion.div>
                 <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3}>
                   <div className="p-6 space-y-3 flex flex-col items-center">
                      <div className="bg-primary/10 text-primary rounded-full p-3 mb-3"> <MessageSquare size={28} /> </div>
                     <h3 className="text-lg font-semibold">{t('step3Title')}</h3>
                     <p className="text-sm text-muted-foreground">{t('step3Desc')}</p>
                   </div>
                 </motion.div>
               </div>
             </div>
           </section>
        </div>
      );
    };

    export default HomePage;
  