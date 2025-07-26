import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFormLogic } from '@/handlers/form';
import { useAuth } from '@/context/AuthContext';
import { SinglePasswordInput } from '@/components/ui/password'; // Import the reusable single input

const initialFormData = {
  email: '',
  password: '',
};

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { authState } = useAuth();

  useEffect(() => {
    if (authState.isLoggedIn && !authState.loading) {
      console.log('Navigating to / because login completed');
      navigate('/');
    }
  }, [authState.isLoggedIn, authState.loading, navigate]);

  const { formData, errors, handleChange, handleSubmit } = useFormLogic(initialFormData, navigate, t, { isLogin: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center py-12"
    >
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t('loginTitle')}</CardTitle>
          <CardDescription>{t('loginDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={formData.email}
                onChange={(e) => handleChange(e, 'email')}
                className={`border ${errors.email ? 'border-destructive' : 'border-border/50'} rounded-lg h-10 text-sm focus:ring-2 focus:ring-primary transition-all duration-300 hover:scale-[1.02]`}
                required
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('password')}</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  {t('forgotPassword')}
                </Link>
              </div>
              <SinglePasswordInput
                value={formData.password}
                onChange={(e) => handleChange(e, 'password')}
                error={errors.password}
              />
            </div>

            <Button type="submit" className="w-full">
              {t('loginBtn')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p className="text-muted-foreground">
            {t('noAccount')} 
            <Link to="/signup" className="text-primary hover:underline font-medium">
              {t('signup')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default LoginPage;
