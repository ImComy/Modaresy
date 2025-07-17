import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const ExploreSection = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <div className="relative w-full">
      {/* Floating Image: only on large screens */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className={`hidden lg:block absolute -top-[40px] ${
          isArabic ? 'left-24' : 'right-24'
        } z-30`}
      >
        <motion.img
          src="/computer.png"
          alt="Laptop displaying tutors"
          className="w-[360px] drop-shadow-2xl"
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Soft glow behind the image */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-primary to-yellow-400 opacity-20 blur-[100px] rounded-full -z-10 pointer-events-none" />
      </motion.div>

      {/* Main Section */}
      <section className="w-full bg-background py-20 px-6 md:px-12 relative">
        <div className="max-w-6xl mx-auto">
          <div
            className={`flex flex-col-reverse md:${
              isArabic ? 'flex-row' : 'flex-row-reverse'
            } items-center justify-between gap-10`}
          >
            {/* Text Section */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full md:flex-[1.5] max-w-xl md:max-w-none"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-snug">
                <span className="text-primary whitespace-pre-line">
                  {t('heroSection.title')}
                </span>
              </h2>
              <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                {t('heroSection.subtitle')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExploreSection;
