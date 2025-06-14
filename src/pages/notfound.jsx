import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex items-center justify-center px-4 py-12 bg-background"
    >
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-7xl font-bold text-primary/90">404</h1>
        <p className="text-xl font-semibold text-foreground">Oops! Page not found.</p>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <img
          src="/404 error lost in space-rafiki.png"
          alt="404 Not Found"
          className="w-full max-w-xs mx-auto"
        />

        <Button asChild className="mt-4">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    </motion.div>
  );
};

export default NotFoundPage;
