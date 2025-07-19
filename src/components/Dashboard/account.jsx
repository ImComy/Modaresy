import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';
import PasswordInputs from '@/components/ui/password';
import { useFormLogic } from '@/handlers/form';

const initialFormData = {
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

const AccountSection = ({ form, setForm }) => {
  const { t } = useTranslation();
  const { errors, handleChange } = useFormLogic(
    { ...initialFormData, ...form },
    null,
    t,
    { isSignup: false }
  );

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
                value={form.email}
                onChange={(e) => handleChange(e, 'email')}
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
                value={form.phone}
                onChange={(e) => handleChange(e, 'phone')}
                placeholder={t('settings.form.phonePlaceholder', 'Enter your phone number')}
                className={`bg-input border border-border/50 rounded-lg h-10 sm:h-11 text-xs sm:text-sm focus:ring-2 focus:ring-primary transition-all duration-300 hover:scale-[1.02] ${errors.phone ? 'border-destructive' : ''}`}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>

            <PasswordInputs form={form} handleChange={(e) => handleChange(e)} errors={errors} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AccountSection;