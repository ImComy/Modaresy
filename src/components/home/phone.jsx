import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const MobileComingSoon = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  return (
    <section
      className={cn(
        "relative py-24 px-6 sm:px-10 md:px-16 rounded-xl bg-gradient-to-br from-yellow-50 to-white dark:from-gray-900 dark:to-gray-950 overflow-hidden",
        isArabic ? "rtl text-right" : "ltr text-left"
      )}
    >
      {/* Glow Effect */}
      <div className="absolute left-1/2 top-10 w-[40rem] h-[40rem] -translate-x-1/2 bg-primary/20 blur-[160px] rounded-full z-0 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        {/* Left: Text */}
        <motion.div
          initial={{ opacity: 0, x: isArabic ? 40 : -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="w-full lg:w-1/2"
        >
          <motion.div
            className="inline-block mb-4 px-4 py-1 bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-semibold rounded-full shadow-md text-sm"
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

        {/* Right: Phone with Effects */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="w-full lg:w-1/2 flex justify-center relative"
        >
          {/* Floating animation */}
          <motion.img
            src="/images/phone-preview.png"
            alt="Mobile Preview"
            className="w-[260px] sm:w-[300px] lg:w-[360px] z-10 drop-shadow-xl"
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Gradient blob behind phone */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-yellow-300 to-pink-400 opacity-20 blur-[100px] rounded-full z-0 pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
};

export default MobileComingSoon;
