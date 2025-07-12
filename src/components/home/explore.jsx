import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const ExploreSection = () => {
  const { t } = useTranslation();

  return (
    <section className="w-full bg-background py-16 px-6 md:px-12 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col-reverse md:flex-row-reverse items-center justify-between gap-10">
          {/* Text Section */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full md:flex-[1.5] max-w-xl md:max-w-none"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-snug">
              <span className="text-primary whitespace-pre-line">{t('heroSection.title')}</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              {t('heroSection.subtitle')}
            </p>
          </motion.div>

          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full md:flex-1 max-w-md"
          >
            <img
              src="/computer.png"
              alt="Laptop displaying tutors"
              className="w-screen h-[300px] drop-shadow-xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ExploreSection;