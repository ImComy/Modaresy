import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { SearchableSelectContent } from '@/components/ui/searchSelect';
import PasswordInputs from '@/components/ui/password';
import PfpUploadWithCrop from '@/components/pfpSignup';
import BannerUploadWithCrop from '@/components/bannerSignup';
import { grades, sectors, locations } from '@/data/formData';
import { useFormLogic } from '@/handlers/form';

const initialFormData = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'student',
  grade: '',
  sector: '',
  location: '',
  subjects: [],
  targetGrades: [],
  targetSectors: [],
  photoUrl: '',
  agreedToTerms: false,
  banner: '',
  pfp: '',
};

const SignupPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    formData,
    errors,
    isRTL,
    handleChange,
    handleSelectChange,
    handleSubmit,
    setFormData,
  } = useFormLogic(initialFormData, navigate, t, { isSignup: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-center items-center py-8 md:py-12"
    >
      <Card className="w-full max-w-lg shadow-2xl border border-border/20 bg-background/95 backdrop-blur-lg rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-transparent text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold">{t('signupTitle')}</CardTitle>
          <CardDescription>{t('signupSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label>{t('selectRole')}</Label>
              <RadioGroup
                name="role"
                value={formData.role}
                onValueChange={(value) => handleSelectChange('role', value)}
                className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                {isRTL ? (
                  <>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="teacher" id="role-teacher" />
                      <Label htmlFor="role-teacher" className="font-normal">{t('teacher')}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="student" id="role-student" />
                      <Label htmlFor="role-student" className="font-normal">{t('student')}</Label>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="student" id="role-student" />
                      <Label htmlFor="role-student" className="font-normal">{t('student')}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="teacher" id="role-teacher" />
                      <Label htmlFor="role-teacher" className="font-normal">{t('teacher')}</Label>
                    </div>
                  </>
                )}
              </RadioGroup>
            </div>

            {/* Common Fields */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs sm:text-sm font-semibold text-muted-foreground">{t('name')}</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => handleChange(e, 'name')}
                placeholder={t('settings.form.namePlaceholder', 'Enter your name')}
                className={`bg-input border border-border/50 rounded-lg h-10 sm:h-11 text-xs sm:text-sm focus:ring-2 focus:ring-primary transition-all duration-300 hover:scale-[1.02] ${errors.name ? 'border-destructive' : ''}`}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-muted-foreground">{t('email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange(e, 'email')}
                placeholder={t('settings.form.emailPlaceholder', 'Enter your email')}
                className={`bg-input border border-border/50 rounded-lg h-10 sm:h-11 text-xs sm:text-sm focus:ring-2 focus:ring-primary transition-all duration-300 hover:scale-[1.02] ${errors.email ? 'border-destructive' : ''}`}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs sm:text-sm font-semibold text-muted-foreground">{t('phone')}</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={(e) => handleChange(e, 'phone')}
                placeholder={t('settings.form.phonePlaceholder', 'Enter your phone number')}
                className={`bg-input border border-border/50 rounded-lg h-10 sm:h-11 text-xs sm:text-sm focus:ring-2 focus:ring-primary transition-all duration-300 hover:scale-[1.02] ${errors.phone ? 'border-destructive' : ''}`}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>

            {/* Password Fields */}
            <PasswordInputs form={formData} handleChange={(e) => handleChange(e)} errors={errors} />

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-xs sm:text-sm font-semibold text-muted-foreground">{t('location')}</Label>
              <Select name="location" value={formData.location} onValueChange={(value) => handleSelectChange('location', value)}>
                <SelectTrigger id="location" className={`bg-input border border-border/50 rounded-lg h-10 sm:h-11 text-xs sm:text-sm focus:ring-2 focus:ring-primary transition-all duration-300 hover:scale-[1.02] ${errors.location ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder={t('selectLocation')} />
                </SelectTrigger>
                <SearchableSelectContent
                  items={locations.map(loc => ({ value: loc.value, label: loc.label }))}
                  searchPlaceholder={t('searchLocation')}
                />
              </Select>
              {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
            </div>

            {/* Student Specific Fields */}
            {formData.role === 'student' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="grade" className="text-xs sm:text-sm font-semibold text-muted-foreground">{t('grade')}</Label>
                  <Select
                    name="grade"
                    value={formData.grade}
                    onValueChange={(value) => handleSelectChange('grade', value)}
                  >
                    <SelectTrigger id="grade" className={`bg-input border border-border/50 rounded-lg h-10 sm:h-11 text-xs sm:text-sm focus:ring-2 focus:ring-primary transition-all duration-300 hover:scale-[1.02] ${errors.grade ? 'border-destructive' : ''}`}>
                      <SelectValue placeholder={t('selectGrade')} />
                    </SelectTrigger>
                    <SearchableSelectContent
                      items={grades.map(grade => ({ value: grade.value, label: t(grade.labelKey) }))}
                      searchPlaceholder={t('searchGrade')}
                    />
                  </Select>
                  {errors.grade && <p className="text-xs text-destructive">{errors.grade}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sector" className="text-xs sm:text-sm font-semibold text-muted-foreground">{t('sector')}</Label>
                  <Select name="sector" value={formData.sector} onValueChange={(value) => handleSelectChange('sector', value)}>
                    <SelectTrigger id="sector" className="bg-input border border-border/50 rounded-lg h-10 sm:h-11 text-xs sm:text-sm focus:ring-2 focus:ring-primary transition-all duration-300 hover:scale-[1.02]">
                      <SelectValue placeholder={t('selectSectorOptional')} />
                    </SelectTrigger>
                    <SearchableSelectContent
                      items={sectors.map(sector => ({ value: sector.value, label: t(sector.labelKey) }))}
                      searchPlaceholder={t('searchSector')}
                    />
                  </Select>
                </div>
              </>
            )}

            {/* Teacher Specific Fields */}
            {formData.role === 'teacher' && (
              <div className="space-y-6">
                <PfpUploadWithCrop formData={formData} setFormData={setFormData} />
                <BannerUploadWithCrop formData={formData} setFormData={setFormData} />
              </div>
            )}

            {/* Terms Agreement */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Checkbox id="agreedToTerms" name="agreedToTerms" checked={formData.agreedToTerms} onCheckedChange={(checked) => handleSelectChange('agreedToTerms', checked)} />
              <Label htmlFor="agreedToTerms" className="text-xs text-muted-foreground font-normal">
                <Trans i18nKey="agreeToTerms">By signing up, you agree to our <Link to="/terms" className="underline hover:text-primary">Terms of Service</Link> and <Link to="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.</Trans>
              </Label>
            </div>
            {errors.agreedToTerms && <p className="text-xs text-destructive">{errors.agreedToTerms}</p>}
            {errors.form && <p className="text-sm text-destructive text-center">{errors.form}</p>}

            <Button type="submit" className="w-full">{t('signup')}</Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t('alreadyHaveAccount')} <Link to="/login" className="font-medium text-primary hover:underline">{t('login')}</Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SignupPage;