import { useRef } from 'react'; 
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

  const targetRef = useRef(null);
  const handleScroll = () => {
    targetRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className=" ">
      {/* New Hero Section Design */}
      <section className="relative py-10 md:py-20 lg:py-24 overflow-hidden bg-gradient-to-b from-background via-blue-50 dark:via-blue-900/10 to-background">
        <div className="absolute inset-0 -z-10">
          {/* Subtle background pattern or shapes */}
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
              <Button size="lg"  onClick={handleScroll} className="shadow-lg hover:shadow-primary/40 transition-shadow duration-300">
                {t('getStarted')} <Search size={18} className="ml-2 rtl:mr-2 rtl:ml-0" />
              </Button>
            </motion.div>
          </div>

          {/* Right Animated Cards/Image */}
          <motion.div
            variants={fadeIn}
            initial="visible"
            animate="visible"
            custom={2}
            className="relative hidden lg:block"
          >
            <div className="grid grid-cols-2 gap-4">
              <motion.div variants={fadeInUp} custom={2.5}>
                <Card
                  className="shadow-md hover:shadow-lg transition-shadow glass-effect
                    hover:scale-105 hover:-translate-y-1 transition-transform duration-300 ease-out"
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <motion.div
                      className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-full"
                      whileHover={{
                        scale: [1, 1.3, 1.1],
                        transition: { duration: 0.35, ease: "easeOut" },
                      }}
                    >
                      <GraduationCap size={20} />
                    </motion.div>
                    <motion.div
                      whileHover={{ y: -3, transition: { duration: 0.3 } }}
                      className="flex flex-col"
                    >
                      <p className="font-semibold text-sm">{t("subjectsCount")}</p>
                      <p className="text-xs text-muted-foreground">{t("subjectsAvailable")}</p>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp} custom={3}>
                <Card
                  className="shadow-md hover:shadow-lg transition-shadow glass-effect mt-8
                    hover:scale-105 hover:-translate-y-1 transition-transform duration-300 ease-out"
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <motion.div
                      className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-full"
                      whileHover={{
                        scale: [1, 1.3, 1.1],
                        transition: { duration: 0.35, ease: "easeOut" },
                      }}
                    >
                      <UserCheck size={20} />
                    </motion.div>
                    <motion.div
                      whileHover={{ y: -3, transition: { duration: 0.3 } }}
                      className="flex flex-col"
                    >
                      <p className="font-semibold text-sm">{t("verifiedTutors")}</p>
                      <p className="text-xs text-muted-foreground">{t("verifiedTutorsDesc")}</p>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp} custom={3.5}>
                <Card
                  className="shadow-md hover:shadow-lg transition-shadow glass-effect -mt-4
                    hover:scale-105 hover:-translate-y-1 transition-transform duration-300 ease-out"
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <motion.div
                      className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 p-2 rounded-full"
                      whileHover={{
                        scale: [1, 1.3, 1.1],
                        transition: { duration: 0.35, ease: "easeOut" },
                      }}
                    >
                      <MapPinIcon size={20} />
                    </motion.div>
                    <motion.div
                      whileHover={{ y: -3, transition: { duration: 0.3 } }}
                      className="flex flex-col"
                    >
                      <p className="font-semibold text-sm">{t("locationsCovered")}</p>
                      <p className="text-xs text-muted-foreground">{t("locationsCoveredDesc")}</p>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp} custom={4}>
                <Card
                  className="shadow-md hover:shadow-lg transition-shadow glass-effect mt-4
                    hover:scale-105 hover:-translate-y-1 transition-transform duration-300 ease-out"
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <motion.div
                      className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-2 rounded-full"
                      whileHover={{
                        scale: [1, 1.3, 1.1],
                        transition: { duration: 0.35, ease: "easeOut" },
                      }}
                    >
                      <MessageSquare size={20} />
                    </motion.div>
                    <motion.div
                      whileHover={{ y: -3, transition: { duration: 0.3 } }}
                      className="flex flex-col"
                    >
                      <p className="font-semibold text-sm">{t("easyCommunication")}</p>
                      <p className="text-xs text-muted-foreground">{t("easyCommunicationDesc")}</p>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-muted/40 rounded-3xl shadow-xl mb-16">
        <div className="container mx-auto text-center space-y-10">
          <motion.h2
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        custom={1}
        className="text-3xl md:text-4xl font-extrabold tracking-tight"
          >
        {t("HOW MODARESY WORKS")}
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-10 px-4 md:px-0">
        {[
          {
            icon: Search,
            title: t("Discover Teachers"),
            desc: t("Discover Teachers Desc"),
            custom: 2,
          },
          {
            icon: UserCheck,
            title: t("Choose the Right Fit"),
            desc: t("Choose the Right Fit Desc"),
            custom: 2.5,
          },
          {
            icon: MessageSquare,
            title: t("Connect & Learn"),
            desc: t("Connect & Learn Desc"),
            custom: 3,
          },
        ].map(({ icon: Icon, title, desc, custom }, idx) => (
          <motion.div
            key={idx}
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={custom}
            className="bg-white dark:bg-background border border-border rounded-xl p-6 shadow-md flex flex-col items-center text-center space-y-4 cursor-pointer relative overflow-hidden"
            whileHover={{
          scale: 1.05,
          y: -6,
          boxShadow: "0 8px 20px rgba(99, 102, 241, 0.3)",
          transition: { duration: 0.3, ease: "easeOut" },
            }}
          >
            <motion.div
          className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary rounded-full p-4"
          whileHover={{ scale: 1.1, transition: { duration: 0.3, ease: "easeInOut" } }}
            >
          <Icon size={28} />
            </motion.div>

            <h3 className="text-xl font-semibold relative">
          {title}
          <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary rounded transition-all" />
            </h3>

            <p className="text-muted-foreground text-sm leading-relaxed max-w-[280px]">
          {desc}
            </p>

            {/* Glowing gradient border */}
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{
                  opacity: 1,
                  background: "linear-gradient(270deg, #6366F1, #A78BFA, #6366F1)",
                  backgroundSize: "600% 600%",
                  animation: "glowAnim 3s ease infinite",
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
      <div ref={targetRef}></div>

      <style jsx>{`
        @keyframes glowAnim {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </section>

      {/* Filter and Tutor List Section */}
      <section className="space-y-6 container mx-auto px-4" >
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
    </div>
  );
};

export default HomePage;
