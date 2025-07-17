import { motion } from "framer-motion";
import { Sparkles, Lightbulb  } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const VisionSection = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const fadeFrom = isArabic ? 80 : -80;

  return (
    <section className="relative overflow-hidden py-20 rounded-xl bg-background flex items-center justify-center px-6 sm:px-12 md:px-20 ">
      {/* 🌟 Spinning Sparkle */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="absolute -top-24 -right-24 text-primary opacity-10 pointer-events-none "
      >
        <Sparkles size={300} strokeWidth={1} />
      </motion.div>

      {/* 🔵 Soft Glow */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] bg-primary/20 blur-3xl rounded-full z-0" />

      {/* 🧊 Floating Background Cards */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute w-44 h-28 bg-primary/10 border border-border rounded-xl top-[20%] left-[10%] rotate-[8deg] blur-md"
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 6 }}
        />
        <motion.div
          className="absolute w-52 h-32 bg-secondary/10 border border-border rounded-xl top-[60%] right-[15%] rotate-[-6deg] blur-md"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 7, delay: 1 }}
        />
        <motion.div
          className="absolute w-40 h-24 bg-accent/10 border border-border rounded-xl bottom-[15%] left-[40%] rotate-[12deg] blur-sm"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 5, delay: 0.5 }}
        />
      </div>

      {/* 📜 Content */}
      <motion.div
        initial={{ opacity: 0, x: fadeFrom }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className={cn(
          "relative z-10 w-full max-w-4xl p-8 sm:p-10 backdrop-blur-sm bg-white/30 dark:bg-white/5 rounded-3xl border border-white/10 shadow-xl space-y-10",
          isArabic ? "text-right rtl" : "text-left ltr"
        )}
        dir={isArabic ? "rtl" : "ltr"}
      >
        {/* Header with Icon */}
        <div className="flex items-center gap-2 text-primary text-xl font-bold">
          <Lightbulb className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
          <span>{t("vision.title")} & {t("mission.title")}</span>
        </div>

        {/* Vision Block */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {t("vision.statement")}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            {t("vision.description")}
          </p>
        </div>

        <hr className="border-muted"/>

        {/* Mission Block */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {t("mission.statement")}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            {t("mission.description")}
          </p>
        </div>
      </motion.div>
    </section>
  );
};

export default VisionSection;
