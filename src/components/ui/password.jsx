import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

/** ==== SinglePasswordInput Component ==== */
export const SinglePasswordInput = ({ value, onChange, error }) => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        id="password"
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={t('settings.form.passwordPlaceholder', 'Enter your password')}
        required
        className={clsx(
          'bg-input border rounded-lg h-10 sm:h-11 pr-12 transition-all duration-300',
          error ? 'border-destructive focus:ring-destructive' : 'border-border/50 focus:ring-primary'
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setShow((prev) => !prev)}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-muted/50"
      >
        {show ? (
          <Eye className="w-4 h-4 text-primary" /> 
        ) : (
          <EyeOff className="w-4 h-4 text-primary" />
        )}
      </Button>
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
};

/** ==== Main PasswordInputs Component ==== */
const PasswordInputs = ({
  form,
  handleChange,
  handleSubmit,
  errors = {},
  loading = false,
  layout = 'vertical',
  variant = 'full', // 'full' | 'single' | 'update'
}) => {
  const { t } = useTranslation();
  const [show, setShow] = useState({ current: false, password: false, confirm: false });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(null);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const toggleShow = (field) => setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const showValidation = variant === 'full' || (variant === 'update' && form.password);

  useEffect(() => {
    const password = form.password || '';
    const confirmPassword = form.confirmPassword || '';

    if (showValidation) {
      let strength = 0;
      if (password.length >= 8) strength += 1;
      if (/[A-Z]/.test(password)) strength += 1;
      if (/[a-z]/.test(password)) strength += 1;
      if (/[0-9]/.test(password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(password)) strength += 1;

      setPasswordStrength(strength);
      setIsPasswordValid(strength >= 4);

      setStrengthLabel(
        strength === 0
          ? t('passwordStrength.weak', 'Weak')
          : strength <= 3
          ? t('passwordStrength.medium', 'Medium')
          : t('passwordStrength.strong', 'Strong')
      );
    }

    if (password && confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(null);
    }
  }, [form.password, form.confirmPassword, t, showValidation]);

  const getStrengthBarColor = () => {
    if (passwordStrength <= 2) return 'bg-destructive';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const passwordError = form.password && !isPasswordValid;
  const confirmError = form.confirmPassword && passwordsMatch === false;

  const wrapperClass = clsx(
    layout === 'horizontal' && variant === 'full'
      ? 'flex flex-col sm:flex-row gap-6'
      : 'flex flex-col gap-4'
  );

  const inputClass = (error) =>
    clsx(
      'bg-input border rounded-lg h-10 sm:h-11 pr-12 transition-all duration-300',
      error ? 'border-destructive focus:ring-destructive' : 'border-border/50 focus:ring-primary'
    );

  /** === Single Variant === */
  if (variant === 'single') {
    return (
      <SinglePasswordInput
        value={form.password || ''}
        onChange={(e) => handleChange(e, 'password')}
        error={errors.password}
      />
    );
  }

  /** === Full and Update Variants === */
  return (
    <form onSubmit={variant === 'update' ? handleSubmit : undefined} className={wrapperClass}>
      {variant === 'update' && (
        <div className="space-y-1">
          <Label htmlFor="currentPassword" className="text-sm font-semibold text-muted-foreground">
            {t('currentPassword', 'Current Password')}
          </Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={show.current ? 'text' : 'password'}
              value={form.currentPassword || ''}
              onChange={(e) => handleChange(e, 'currentPassword')}
              placeholder={t('placeholders.currentPassword', 'Enter your current password')}
              required
              className={inputClass(errors.currentPassword)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => toggleShow('current')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-muted/50"
            >
              {show.current ? (
                <Eye className="w-4 h-4 text-primary" />
              ) : (
                <EyeOff className="w-4 h-4 text-primary" />
              )}
            </Button>
          </div>
          {errors.currentPassword && <p className="text-sm text-destructive">{errors.currentPassword}</p>}
        </div>
      )}

      {/* New Password */}
      <div className="space-y-1">
        <Label htmlFor="password" className="text-sm font-semibold text-muted-foreground">
          {variant === 'update' ? t('newPassword', 'New Password') : t('settings.form.password', 'Password')}
        </Label>
        <motion.div
          className="relative"
          animate={showValidation && passwordError ? { x: [-5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.2 }}
        >
          <Input
            id="password"
            type={show.password ? 'text' : 'password'}
            value={form.password || ''}
            onChange={(e) => handleChange(e, 'password')}
            placeholder={
              variant === 'update'
                ? t('placeholders.newPassword', 'Enter your new password')
                : t('settings.form.passwordPlaceholder', 'Enter your password')
            }
            className={inputClass(showValidation && passwordError)}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => toggleShow('password')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-muted/50"
          >
            {show.password ? (
              <Eye className="w-4 h-4 text-primary" />
            ) : (
              <EyeOff className="w-4 h-4 text-primary" />
            )}
          </Button>
        </motion.div>

        {showValidation && form.password && (
          <div className="space-y-1 mt-1">
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
      <div className="space-y-1">
        <Label htmlFor="confirmPassword" className="text-sm font-semibold text-muted-foreground">
          {variant === 'update'
            ? t('confirmNewPassword', 'Confirm New Password')
            : t('settings.form.confirmPassword', 'Confirm Password')}
        </Label>
        <motion.div
          className="relative"
          animate={confirmError ? { x: [-5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.2 }}
        >
          <Input
            id="confirmPassword"
            type={show.confirm ? 'text' : 'password'}
            value={form.confirmPassword || ''}
            onChange={(e) => handleChange(e, 'confirmPassword')}
            placeholder={
              variant === 'update'
                ? t('placeholders.confirmNewPassword', 'Repeat your new password')
                : t('settings.form.confirmPasswordPlaceholder', 'Confirm your password')
            }
            className={inputClass(confirmError)}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => toggleShow('confirm')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-muted/50"
          >
            {show.confirm ? (
              <Eye className="w-4 h-4 text-primary" />
            ) : (
              <EyeOff className="w-4 h-4 text-primary" />
            )}
          </Button>
        </motion.div>
        {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
        {passwordsMatch !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-xs sm:text-sm mt-1 ${passwordsMatch ? 'text-green-500' : 'text-destructive'}`}
          >
            {passwordsMatch
              ? t('passwordMatch.match', 'Passwords match')
              : t('passwordMatch.noMatch', 'Passwords do not match')}
          </motion.div>
        )}
      </div>

      {variant === 'update' && (
        <Button type="submit" disabled={loading} className="w-full mt-4">
          {loading ? t('updating', 'Updating...') : t('updatePassword', 'Update Password')}
        </Button>
      )}
    </form>
  );
};

export default PasswordInputs;
