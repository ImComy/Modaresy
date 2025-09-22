import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import SaveButton from '@/components/ui/save';
import { User, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFormLogic } from '@/handlers/form';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { apiFetch } from '@/api/apiService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import clsx from 'clsx';

/* =========================
   Inline Password Components (kept as-is visually)
   ========================= */

const SinglePasswordInput = ({ value, onChange, error }) => {
  const { t, i18n } = useTranslation();
  const [show, setShow] = useState(false);
  const isRtl = i18n?.dir?.() === 'rtl';

  const inputPadding = isRtl ? 'pl-12' : 'pr-12';
  const buttonPos = isRtl ? 'left-2' : 'right-2';

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
          'bg-input border rounded-lg h-10 sm:h-11 transition-all duration-300',
          inputPadding,
          error ? 'border-destructive focus:ring-destructive' : 'border-border/50 focus:ring-primary'
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setShow((prev) => !prev)}
        className={clsx('absolute top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-muted/50', buttonPos)}
      >
        {show ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-primary" />}
      </Button>
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
};

const PasswordInputs = ({
  form,
  handleChange,
  handleSubmit,
  errors = {},
  loading = false,
  layout = 'vertical',
  variant = 'single',
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n?.dir?.() === 'rtl';

  const [show, setShow] = useState({ current: false, password: false, confirm: false });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(null);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const toggleShow = (field) => setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const showValidation = variant === 'update' ? Boolean(form.password) : false;

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

  const wrapperClass = clsx(layout === 'horizontal' ? 'flex flex-col sm:flex-row gap-6' : 'flex flex-col gap-4');

  const inputPadding = isRtl ? 'pl-12' : 'pr-12';
  const buttonPos = isRtl ? 'left-2' : 'right-2';
  const inputBaseClass = 'bg-input border rounded-lg h-10 sm:h-11 transition-all duration-300 ' + inputPadding;

  if (variant === 'single') {
    return (
      <SinglePasswordInput value={form.password || ''} onChange={(e) => handleChange(e, 'password')} error={errors.password} />
    );
  }

  return (
    <form onSubmit={handleSubmit} className={wrapperClass}>
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
            className={clsx(
              inputBaseClass,
              errors.currentPassword ? 'border-destructive focus:ring-destructive' : 'border-border/50 focus:ring-primary'
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => toggleShow('current')}
            className={clsx('absolute top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-muted/50', buttonPos)}
          >
            {show.current ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-primary" />}
          </Button>
        </div>
        {errors.currentPassword && <p className="text-sm text-destructive">{errors.currentPassword}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="password" className="text-sm font-semibold text-muted-foreground">
          {t('newPassword', 'New Password')}
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
            placeholder={t('placeholders.newPassword', 'Enter your new password')}
            className={clsx(
              inputBaseClass,
              showValidation && passwordError ? 'border-destructive focus:ring-destructive' : 'border-border/50 focus:ring-primary'
            )}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => toggleShow('password')}
            className={clsx('absolute top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-muted/50', buttonPos)}
          >
            {show.password ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-primary" />}
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

      <div className="space-y-1">
        <Label htmlFor="confirmPassword" className="text-sm font-semibold text-muted-foreground">
          {t('confirmNewPassword', 'Confirm New Password')}
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
            placeholder={t('placeholders.confirmNewPassword', 'Repeat your new password')}
            className={clsx(
              inputBaseClass,
              confirmError ? 'border-destructive focus:ring-destructive' : 'border-border/50 focus:ring-primary'
            )}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => toggleShow('confirm')}
            className={clsx('absolute top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-muted/50', buttonPos)}
          >
            {show.confirm ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-primary" />}
          </Button>
        </motion.div>

        {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
        {passwordsMatch !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-xs sm:text-sm mt-1 ${passwordsMatch ? 'text-green-500' : 'text-destructive'}`}
          >
            {passwordsMatch ? t('passwordMatch.match', 'Passwords match') : t('passwordMatch.noMatch', 'Passwords do not match')}
          </motion.div>
        )}
      </div>

      <div className="w-full">
        <Button type="submit" disabled={loading} className="w-full mt-2">
          {loading ? t('updating', 'Updating...') : t('updatePassword', 'Update Password')}
        </Button>
      </div>
    </form>
  );
};

const DeletePasswordInput = ({ value, onChange, show, setShow }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n?.dir?.() === 'rtl';
  const inputPadding = isRtl ? 'pl-12' : 'pr-12';
  const buttonPos = isRtl ? 'left-2' : 'right-2';

  return (
    <>
      <Input
        id="confirmDeletePassword"
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('placeholders.confirmPassword', 'Type your password')}
        className={clsx(' bg-input border rounded-lg h-11 sm:h-11 text-xs sm:text-sm transition-all duration-300', inputPadding, 'border-border/50 focus:ring-primary')}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setShow((s) => !s)}
        className={clsx('absolute top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-muted/50', buttonPos)}
      >
        {show ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-primary" />}
      </Button>
    </>
  );
};

/* =========================
   Redesigned AccountSection (Save button moved into header)
   - accepts `onSave` and `isSaving` props so parent can move the SaveButton into header
   - recent activity card replaced with a Reset action
   ========================= */

const initialFormData = {
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  currentPassword: '',
};

export default function AccountSection({ form = {}, setForm, onSave, isSaving = false }) {
  const { t } = useTranslation();
  const { errors, handleChange } = useFormLogic({ ...initialFormData, ...form }, null, t, { isSignup: false });
  const navigate = useNavigate();
  const { logout, authState } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const user = authState?.userData;
    if (!user || typeof setForm !== 'function') return;
    setForm((prev) => ({
      ...prev,
      email: prev?.email || user.email || '',
      phone: prev?.phone || user.phone || user.phone_number || '',
    }));
  }, [authState]);

  const [deletePassword, setDeletePassword] = useState('');
  const [deleteShow, setDeleteShow] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [updateLoading, setUpdateLoading] = useState(false);

  const onChangeField = (e, field) => {
    const value = e && e.target ? e.target.value : e;
    if (typeof setForm === 'function') {
      setForm((prev) => ({ ...prev, [field]: value }));
    }

    if (typeof handleChange === 'function') {
      try {
        if (handleChange.length >= 2) {
          handleChange(e, field);
        } else {
          handleChange({ target: { id: field, value } });
        }
      } catch (err) {
        console.warn('form logic handleChange failed:', err);
      }
    }
  };

  const handleDeleteAccount = async (password) => {
    setDeleteError('');
    if (!password) {
      setDeleteError(t('enterPassword', 'Please enter your password to confirm.'));
      return;
    }

    setDeleteLoading(true);
    try {
      await apiFetch('/users/deleteAccount', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      logout();
      navigate('/');
      toast({ title: t('deleted', 'Account deleted'), description: t('deleteSuccess', 'Your account was deleted.'), variant: 'default' });
    } catch (err) {
      console.error('Failed to delete account', err);
      const msg = err?.message || t('tryAgain', 'Please try again later.');
      setDeleteError(msg);
      toast({ title: t('deleteFailed', 'Delete failed'), description: msg, variant: 'destructive' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e && e.preventDefault && e.preventDefault();
    setUpdateLoading(true);
    try {
      if (!form.password || form.password.length < 8) {
        throw new Error(t('passwordTooShort', 'New password must be at least 8 characters long'));
      }
      if (form.password !== form.confirmPassword) {
        throw new Error(t('passwordsDoNotMatch', 'New passwords do not match'));
      }

      await apiFetch('/users/updatePassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.password,
        }),
      });

      toast({ title: t('updated', 'Updated'), description: t('passwordUpdated', 'Your password was updated.'), variant: 'default' });
      setForm((prev) => ({ ...prev, currentPassword: '', password: '', confirmPassword: '' }));
    } catch (err) {
      console.error('Failed to update password', err);
      const msg = err?.message || t('tryAgain', 'Please try again later');
      toast({ title: t('updateFailed', 'Update failed'), description: msg, variant: 'destructive' });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleResetProfile = () => {
    const user = authState?.userData || {};
    if (typeof setForm === 'function') {
      setForm((prev) => ({
        ...prev,
        email: user.email || '',
        phone: user.phone || user.phone_number || '',
        password: '',
        confirmPassword: '',
        currentPassword: '',
      }));
      toast({ title: t('reset', 'Reset'), description: t('resetToSaved', 'Fields reset to saved values') });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <Card className="shadow-2xl border border-border/20 bg-background/95 backdrop-blur-lg rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-transparent">
          <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-primary">
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            {t('settings.sections.account.title', 'Account Info')}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Profile inputs */}
            <div className="lg:col-span-2 bg-card p-4 rounded-xl border border-border/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-muted-foreground">
                    {t('settings.form.email', 'Email')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email || ''}
                    onChange={(e) => onChangeField(e, 'email')}
                    placeholder={t('settings.form.emailPlaceholder', 'Enter your email')}
                    className={`bg-input border border-border/50 rounded-lg h-11 text-sm focus:ring-2 focus:ring-primary transition-all duration-200 ${errors.email ? 'border-destructive' : ''}`}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs sm:text-sm font-semibold text-muted-foreground">
                    {t('settings.form.phone', 'Phone')}
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={form.phone || ''}
                    onChange={(e) => onChangeField(e, 'phone')}
                    placeholder={t('settings.form.phonePlaceholder', 'Enter your phone number')}
                    className={`bg-input border border-border/50 rounded-lg h-11 text-sm focus:ring-2 focus:ring-primary transition-all duration-200 ${errors.phone ? 'border-destructive' : ''}`}
                  />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
              </div>

              <div className="mt-6">
                <div className="text-sm font-semibold text-muted-foreground mb-3">{t('profileSection.securityHeading', 'Security')}</div>
                <div className="space-y-4">
                  <div className="text-xs text-muted-foreground">{t('profileSection.twoFactorNote', 'Change your password or manage account deletion below.')}</div>
                  <div className="bg-background/60 border border-border/40 rounded-lg p-3">
                    <PasswordInputs form={form} handleChange={(e, field) => onChangeField(e, field)} handleSubmit={handleUpdatePassword} errors={errors} loading={updateLoading} variant="update" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Actions / Danger zone */}
            <aside className="flex flex-col gap-4">
              {/* REPLACED: Recent activity -> Reset button */}
              <div className="bg-card p-5 rounded-2xl border border-border/50 shadow-sm flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground/80">
                    {t('profileSection.actions', 'Actions')}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t('profileSection.resetNote', 'Restore fields to the last saved values.')}
                </p>

                {/* Actions */}
                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    onClick={handleResetProfile}
                    className="flex-1"
                  >
                    {t('reset', 'Reset')}
                  </Button>

                  {onSave && (
                    <SaveButton
                      onClick={onSave}
                      isLoading={isSaving}
                      className="flex-1 -mt-6"
                    />
                  )}
                </div>
              </div>

              <div className="bg-card p-4 rounded-xl border border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-destructive">{t('deleteAccount', 'Delete account')}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t('deleteAccountShort', 'This action is permanent.')}</div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full bg-destructive text-destructive-foreground">{t('deleteAccount', 'Delete account')}</Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent className="sm:max-w-[420px]">
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('deleteAccount', 'Delete account')}</AlertDialogTitle>
                        <div className="text-sm text-muted-foreground">
                          {t('deleteAccountWarning', 'This action is permanent and will remove your account and all related data. This cannot be undone.')}
                        </div>
                      </AlertDialogHeader>

                      <div className="mt-4">
                        <Label htmlFor="confirmDeletePassword" className="text-sm font-semibold text-muted-foreground">
                          {t('confirmPasswordToDelete', 'Enter your password to confirm')}
                        </Label>
                        <div className="relative mt-2">
                          <DeletePasswordInput value={deletePassword} onChange={(v) => setDeletePassword(v)} show={deleteShow} setShow={setDeleteShow} />
                        </div>
                        {deleteError && <p className="text-xs text-destructive mt-2">{deleteError}</p>}
                      </div>

                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel', 'Cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteAccount(deletePassword)} className={clsx('bg-destructive', (!deletePassword || deleteLoading) && 'opacity-60 cursor-not-allowed')} disabled={!deletePassword || deleteLoading}>
                          {deleteLoading ? t('deleting', 'Deleting...') : t('deleteAccount', 'Delete account')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="text-xs text-muted-foreground text-center">{t('account.footerNote', 'Need help? Contact support.')}</div>
            </aside>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
