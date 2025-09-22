import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { MapPin, Wallet, CalendarClock, Video } from "lucide-react";
import { cn } from "@/lib/utils";

const benefits = [
  { icon: MapPin, key: "location", bg: "/bg/location.jpg" },
  { icon: Wallet, key: "affordability", bg: "/bg/affordable.jpg" },
  { icon: CalendarClock, key: "flexibility", bg: "/bg/flexible.jpg" },
  { icon: Video, key: "accessibility", bg: "/bg/accessible.jpg" },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function StudentBenefitsSection() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar" || i18n.language === "ar-EG";

  // always show timeline + video (no toggle)
  const showTimeline = true;

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
          {/* VIDEO - always visible */}
          <div className="relative w-full md:w-3/4 rounded-2xl shadow-lg z-10 overflow-visible">
            <div className="aspect-video w-full rounded-2xl">
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
          </div>

          {/* CARDS / TIMELINE */}
          <div
            className={cn(
              "relative w-full grid gap-8 transition-all duration-700",
              showTimeline ? "md:w-1/2 grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            )}
          >
            {/* Vertical timeline line (always present when timeline enabled) */}
            {showTimeline && (
              <div
                className="absolute top-0 bottom-0 w-1 bg-primary/40 z-0"
                style={{
                  left: isArabic ? "auto" : "1.25rem",
                  right: isArabic ? "1.25rem" : "auto",
                }}
              />
            )}

            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.key}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.25 }}
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
          </div>
        </div>
      </motion.div>
    </section>
  );
}
