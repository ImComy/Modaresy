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
        "relative py-20 px-4 sm:px-8 md:px-12 bg-gradient-to-br from-yellow-100/30 to-white dark:from-gray-900 dark:to-gray-950",
        isArabic ? "rtl text-right" : "ltr text-left"
      )}
    >
      <div className="absolute -top-20 left-[400px] w-[30rem] h-[30rem] bg-primary/20 blur-[150px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold mb-12 text-center text-foreground"
        >
          {t("tutorss.title", "How Modaresy Benefits Tutors")}
        </motion.h2>

        <div className="flex flex-col-reverse lg:flex-row items-center gap-10">
          {/* Cards */}
          <div className="relative w-full lg:w-1/2 max-w-md lg:mx-0 mx-auto flex flex-col lg:block">
            {tutorBenefits.map((benefit, index) => {
              const Icon = benefit.icon;
              const rotation = [-4, -2, 2, 4][index % 4];

              return (
                <motion.div
                  key={benefit.key}
                  whileHover={{ scale: 1.06, rotate: 0, zIndex: 30 }}
                  className={cn(
                    "group cursor-pointer transition-all duration-100",
                    "rounded-2xl p-5 sm:p-6 border border-border shadow-md bg-white/70 dark:bg-white/10 backdrop-blur-sm w-full",
                    "hover:shadow-xl",
                    "lg:absolute left-1/2 lg:-translate-x-1/2 ml-0 lg:-ml-[200px] mt-0 lg:-mt-[150px]"
                  )}
                  style={
                    {
                      ...(index !== undefined && {
                        top: `${index * 55}px`,
                        rotate: `${rotation}deg`,
                        zIndex: index,
                      }),
                    } 
                  }
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center rounded-2xl opacity-10 z-0"
                    style={{ backgroundImage: `url(${benefit.bg})` }}
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-10 transition-opacity z-0" />

                  <div className="relative z-10 flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-yellow-300/20 text-yellow-700 dark:text-yellow-300 dark:bg-yellow-300/10">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
                        {t(`tutorss.${benefit.key}.title`)}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        {t(`tutorss.${benefit.key}.description`)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Video */}
          <div className="w-full lg:w-1/2 max-w-[640px] aspect-video rounded-2xl overflow-hidden shadow-lg">
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default TutorBenefitsSection;
