import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-background px-6 py-12"
    >
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <p className="text-xl font-semibold text-foreground">
          {t('notFound.title', 'Oops! Page not found.')}
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t(
            'notFound.description',
            "The page you're looking for doesn’t exist or has been moved."
          )}
        </p>

        <img
          src="/404 error lost in space-rafiki.png"
          alt={t('notFound.imageAlt', 'Page not found illustration')}
          className="w-full max-w-xs mx-auto"
        />

        <Button asChild className="mt-4">
          <Link to="/">{t('notFound.backHome', 'Back to Home')}</Link>
        </Button>
      </div>
    </motion.div>
  );
};

export default NotFoundPage;
