import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';
import PasswordInputs from '@/components/ui/password';
import { useFormLogic } from '@/handlers/form';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { apiFetch } from '@/api/apiService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const initialFormData = {
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

const AccountSection = ({ form = {}, setForm }) => {
  const { t } = useTranslation();
  const { errors, handleChange } = useFormLogic(
    { ...initialFormData, ...form },
    null,
    t,
    { isSignup: false }
  );
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toast } = useToast();

  // update parent form + delegate to hook's handleChange (supports both signatures)
  const onChangeField = (e, field) => {
    const value = e && e.target ? e.target.value : e;
    if (typeof setForm === 'function') {
      setForm(prev => ({ ...prev, [field]: value }));
    } else {
      console.warn('AccountSection: setForm not provided');
    }

    if (typeof handleChange === 'function') {
      try {
        // prefer (event, field) if hook supports it
        if (handleChange.length >= 2) {
          handleChange(e, field);
        } else {
          // otherwise call with a synthetic event shaped object
          handleChange({ target: { id: field, value } });
        }
      } catch (err) {
        // swallow to avoid breaking typing UI
        // validation hook failure shouldn't block input
        // (keep minimal logging)
        // eslint-disable-next-line no-console
        console.warn('form logic handleChange failed:', err);
      }
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await apiFetch('/users/deleteAccount', { method: 'DELETE' });
      logout();
      navigate('/');
    } catch (err) {
      console.error('Failed to delete account', err);
      toast({ title: t('deleteFailed', 'Delete failed'), description: err?.message || t('tryAgain', 'Please try again later.'), variant: 'destructive' });
    }
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
            {/* Email */}
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
                className={`bg-input border border-border/50 rounded-lg h-10 sm:h-11 text-xs sm:text-sm focus:ring-2 focus:ring-primary transition-all duration-300 hover:scale-[1.02] ${errors.email ? 'border-destructive' : ''}`}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            {/* Phone */}
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
                className={`bg-input border border-border/50 rounded-lg h-10 sm:h-11 text-xs sm:text-sm focus:ring-2 focus:ring-primary transition-all duration-300 hover:scale-[1.02] ${errors.phone ? 'border-destructive' : ''}`}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>

            <div className='w-full'>
              {/* pass a handler that matches PasswordInputs' expected signature (e, field) */}
              <PasswordInputs
                form={form}
                layout={'horizontal'}
                variant={'update'}
                handleChange={(e, field) => onChangeField(e, field)}
                errors={errors}
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="mr-2 inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {t('deleteAccount', 'Delete account')}
                </button>
              </AlertDialogTrigger>

              <AlertDialogContent className="sm:max-w-[420px]">
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('deleteAccountTitle', 'Delete account')}</AlertDialogTitle>
                  <div className="text-sm text-muted-foreground">
                    {t('deleteAccountWarning', 'This action is permanent and will remove your account and all related data. This cannot be undone.')}
                  </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel', 'Cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive">{t('confirmDelete', 'Delete account')}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AccountSection;
