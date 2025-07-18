import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const MobileComingSoon = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  return (
    <div className="relative w-full overflow-hidden md:overflow-visible">
      {/* Floating Phone Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className={`hidden md:block absolute ${
          isArabic ? "left-8 lg:left-24 -top-[80px]" : " -top-[50px] right-8 lg:right-24"
        } z-30`}
      >
        <motion.img
          src={isArabic ? "/phone.png" : "/phone.png"}
          alt="Mobile Preview"
          className="w-[280px] lg:w-[360px] drop-shadow-2xl"
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Soft Glow Behind Image */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-yellow-300 to-pink-400 opacity-20 blur-[100px] rounded-full -z-10 pointer-events-none" />
      </motion.div>

      {/* Section Content */}
      <section
        className={cn(
          "relative pt-32 pb-24 px-6 sm:px-10 md:px-16 rounded-xl bg-gradient-to-br from-yellow-50 to-white dark:from-gray-900 dark:to-gray-950",
          isArabic ? "rtl text-right" : "ltr text-left"
        )}
      >
        {/* Background Glow */}
        <div className="rounded-full absolute left-1/2 top-10 
        w-[24rem] h-[24rem] blur-[80px] 
        sm:w-[32rem] sm:h-[32rem] sm:blur-[120px] 
        lg:w-[40rem] lg:h-[40rem] lg:blur-[160px] 
        -translate-x-1/2 bg-primary/20 z-0 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          {/* Text Section */}
          <motion.div
            initial={{ opacity: 0, x: isArabic ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <motion.div
              className="inline-block mb-4 px-4 py-1 bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-semibold rounded-full shadow-md text-md"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              🚀 {t("mobileComingSoon.badge", "Coming Soon")}
            </motion.div>

            <h2 className="text-4xl font-bold mb-4 text-foreground leading-tight">
              {t("mobileComingSoon.title", "A New Mobile Experience Is On The Way")}
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              {t(
                "mobileComingSoon.description",
                "We’re building a mobile-first experience to make learning and teaching easier than ever — anytime, anywhere."
              )}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default MobileComingSoon;
