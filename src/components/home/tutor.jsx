import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Megaphone,
  ThumbsUp,
  HeartHandshake,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tutorBenefits = [
  {
    icon: Megaphone,
    key: "freeAdvertising",
    bg: "/bg/megaphone.jpg",
  },
  {
    icon: ThumbsUp,
    key: "noRisk",
    bg: "/bg/thumbsup.jpg",
  },
  {
    icon: HeartHandshake,
    key: "winWin",
    bg: "/bg/handshake.jpg",
  },
  {
    icon: Lightbulb,
    key: "standOut",
    bg: "/bg/lightbulb.jpg",
  },
];

const TutorBenefitsSection = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  return (
    <section
      className={cn(
        "relative py-20 px-4 sm:px-8 md:px-12 rounded-xl bg-gradient-to-br from-yellow-100/30 to-white dark:from-gray-900 dark:to-gray-950 overflow-hidden",
        isArabic ? "rtl text-right" : "ltr text-left"
      )}
    >
      <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-[30rem] h-[30rem] bg-primary/20 blur-[150px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold mb-12 text-center text-foreground"
        >
          {t("tutorss.title", "How Modaresy Benefits Tutors")}
        </motion.h2>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Video */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/3 aspect-video max-w-[500px] rounded-2xl overflow-hidden shadow-xl mx-auto"
          >
            <video
              className="w-full h-full object-cover"
              src="/videoHome.mp4"
              controls
              loop
              muted
              playsInline
              preload="auto"
              poster="/fallback-image.jpg"
            />
          </motion.div>

          {/* Horizontal Scroll Cards */}
          <div className="relative w-full lg:w-2/3">
            <div className="overflow-x-auto pb-4 hide-scrollbar overflow-y-hidden">
              <div className="flex gap-6 min-w-[600px]">
                {tutorBenefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div
                      key={benefit.key}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="min-w-[280px] max-w-sm w-full rounded-2xl p-5 sm:p-6 border border-border shadow-md bg-white/70 dark:bg-white/10 backdrop-blur-sm hover:shadow-xl relative cursor-pointer transition-all"
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center rounded-2xl opacity-10 z-0"
                        style={{ backgroundImage: `url(${benefit.bg})` }}
                      />
                      <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-10 transition-opacity z-0" />

                      <div className="relative z-10 flex items-start gap-4">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-yellow-300/20 text-yellow-700 dark:text-yellow-300 dark:bg-yellow-300/10">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-1">
                            {t(`tutorss.${benefit.key}.title`)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t(`tutorss.${benefit.key}.description`)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Decorative Glow Line */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 blur-md opacity-60 bottom-2 pointer-events-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TutorBenefitsSection;
