import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Wallet,
  CalendarClock,
  Video,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const benefits = [
  { icon: MapPin, key: "location", bg: "/bg/location.jpg" },
  { icon: Wallet, key: "affordability", bg: "/bg/affordable.jpg" },
  { icon: CalendarClock, key: "flexibility", bg: "/bg/flexible.jpg" },
  { icon: Video, key: "accessibility", bg: "/bg/accessible.jpg" },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const slideVariants = (isArabic) => ({
  initial: {
    x: isArabic ? 500 : -500,
    opacity: 0,
    position: "absolute",
  },
  animate: {
    x: 0,
    opacity: 1,
    position: "relative",
    transition: { type: "spring", stiffness: 80, damping: 20 },
  },
  exit: {
    x: isArabic ? 500 : -500,
    opacity: 0,
    position: "absolute",
    transition: { duration: 0.5, ease: "easeInOut" },
  },
});

const StudentBenefitsSection = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [showTimeline, setShowTimeline] = useState(false);

  return (
    <section
      className={cn(
        "relative overflow-hidden py-24 px-6 sm:px-12 md:px-20 rounded-xl bg-gradient-to-br from-blue-100/40 to-white dark:from-gray-900 dark:to-gray-950 ",
        isArabic ? "rtl text-right" : "ltr text-left"
      )}
    >
      <div className="absolute -top-20 left-[400px] w-[30rem] h-[30rem] bg-primary/20 blur-[150px] rounded-full pointer-events-none z-0" />

      <motion.div
        layout
        transition={{ type: "spring", damping: 30, stiffness: 350 }}
        className="relative z-10 max-w-7xl mx-auto"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-extrabold mb-12 text-center text-foreground"
            >
            {t("students.title")}
          </motion.h2>

        <div className="relative flex flex-col md:flex-row gap-12 mt-12 min-h-[300px] h-full">
          <AnimatePresence mode="wait">
            {showTimeline && (
              <motion.div
                key="video-panel"
                variants={slideVariants(isArabic)}
                initial="initial"
                animate="animate"
                exit="exit"
                className="relative w-full md:w-3/4 rounded-2xl shadow-lg z-10 overflow-visible"
                >
                <div className="aspect-video w-full  rounded-2xl">
                    <video
                        className="w-full h-fit md:h-[920px] object-cover rounded-2xl"
                        src="/videoHome.mp4"
                        autoPlay
                        controls
                        loop
                        muted
                        playsInline
                        preload="auto"
                        poster="/fallback-image.jpg" 
                    />
                </div>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowTimeline(false)}
                    className={cn(
                    "absolute top-1/2 transform -translate-y-1/2 bg-primary text-white p-2 rounded-full shadow hover:bg-primary/80 transition z-20",
                    isArabic ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"
                    )}
                >
                    {isArabic ? <ChevronRight /> : <ChevronLeft />}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            layout
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={cn(
              "relative w-full grid gap-8 transition-all duration-700",
              showTimeline ? "md:w-1/2 grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            )}
          >
            {/* Open toggle button (only when video is hidden) */}
            {!showTimeline && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTimeline(true)}
                className={cn(
                  "absolute top-[230px] md:top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-full shadow hover:bg-primary/80 transition z-20",
                  isArabic ? "left-full mr-2" : "right-full ml-2"
                )}
              >
                {isArabic ? <ChevronLeft /> : <ChevronRight />}
              </motion.button>
            )}

            {/* Timeline vertical line */}
            {showTimeline && (
              <motion.div
                layoutId="timeline-line"
                className="absolute top-0 bottom-0 w-1 bg-primary/40 z-0"
                style={{
                  left: isArabic ? "auto" : "1.25rem",
                  right: isArabic ? "1.25rem" : "auto",
                }}
              />
            )}

            {/* Cards */}
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.key}
                  variants={cardVariants}
                  layout
                  className={cn(
                    "relative group flex rounded-2xl p-6 sm:p-8 border border-border shadow-md bg-white/60 dark:bg-white/5 backdrop-blur-md overflow-hidden",
                    showTimeline ? "flex-row items-start gap-4" : "flex-col text-center items-center"
                  )}
                >
                  <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center rounded-2xl opacity-10 z-0"
                    style={{ backgroundImage: `url(${benefit.bg})` }}
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-10 transition-opacity z-0" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {t(`students.${benefit.key}.title`)}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {t(`students.${benefit.key}.description`)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default StudentBenefitsSection;
