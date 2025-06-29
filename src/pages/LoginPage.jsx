import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleLogin = (e) => {
    e.preventDefault();
    toast({
      title: t('loginSuccessTitle'),
      description: t('loginSuccessDesc'),
    });
    navigate('/');
  };

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
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input id="email" type="email" placeholder={t('emailPlaceholder')} required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('password')}</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">{t('loginBtn')}</Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p className="text-muted-foreground">
            {t('noAccount')}&nbsp;
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
