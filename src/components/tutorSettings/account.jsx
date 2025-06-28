import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const AccountSection = ({ form, setForm }) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);

  // Password strength checker
  useEffect(() => {
    const password = form.password || '';
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    setPasswordStrength(strength);

    if (strength === 0) {
      setStrengthLabel(t('passwordStrength.weak', 'Weak'));
    } else if (strength <= 3) {
      setStrengthLabel(t('passwordStrength.medium', 'Medium'));
    } else {
      setStrengthLabel(t('passwordStrength.strong', 'Strong'));
    }

    // Password match check
    if (form.password && form.confirmPassword) {
      setPasswordsMatch(form.password === form.confirmPassword);
    } else {
      setPasswordsMatch(null);
    }
  }, [form.password, form.confirmPassword, t]);

  const getStrengthBarColor = () => {
    if (passwordStrength <= 2) return 'bg-destructive';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-2xl border border-border/20 bg-background/95 backdrop-blur-lg rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-transparent">
          <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-primary">
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            {t('settings.sections.account.title', 'Account Info')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs sm:text-sm font-semibold text-muted-foreground">
                {t('settings.form.name', 'Name')}
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={handleChange}
                placeholder={t('settings.form.namePlaceholder', 'Enter your name')}
                className="bg-input border border-border/50 rounded-lg h-10 sm:h-11 text-xs sm:text-sm focus:ring-2 focus:ring-primary transition-all duration-300 hover:scale-[1.02]"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-muted-foreground">
                {t('settings.form.email', 'Email')}
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder={t('settings.form.emailPlaceholder', 'Enter your email')}
                className="bg-input border border-border/50 rounded-lg h-10 sm:h-11 text-xs sm:text-sm focus:ring-2 focus:ring-primary transition-all duration-300 hover:scale-[1.02]"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs sm:text-sm font-semibold text-muted-foreground">
                {t('settings.form.phone', 'Phone')}
              </Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder={t('settings.form.phonePlaceholder', 'Enter your phone number')}
                className="bg-input border border-border/50 rounded-lg h-10 sm:h-11 text-xs sm:text-sm focus:ring-2 focus:ring-primary transition-all duration-300 hover:scale-[1.02]"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs sm:text-sm font-semibold text-muted-foreground">
                {t('settings.form.password', 'Password')}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder={t('settings.form.passwordPlaceholder', 'Enter your password')}
                  className="bg-input border border-border/50 rounded-lg h-10 sm:h-11 text-xs sm:text-sm focus:ring-2 focus:ring-primary transition-all duration-300 hover:scale-[1.02] pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePasswordVisibility}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9 hover:bg-muted/50"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  )}
                </Button>
              </div>
              {form.password && (
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {t('passwordStrength.label', 'Password Strength')}: {strengthLabel}
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${getStrengthBarColor()}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs sm:text-sm font-semibold text-muted-foreground">
                {t('settings.form.confirmPassword', 'Confirm Password')}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder={t('settings.form.confirmPasswordPlaceholder', 'Confirm your password')}
                  className="bg-input border border-border/50 rounded-lg h-10 sm:h-11 text-xs sm:text-sm focus:ring-2 focus:ring-primary transition-all duration-300 hover:scale-[1.02] pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9 hover:bg-muted/50"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  )}
                </Button>
              </div>
              {passwordsMatch !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`text-xs sm:text-sm ${
                    passwordsMatch ? 'text-green-500' : 'text-destructive'
                  }`}
                >
                  {passwordsMatch
                    ? t('passwordMatch.match', 'Passwords match')
                    : t('passwordMatch.noMatch', 'Passwords do not match')}
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AccountSection;