// SignupPage.jsx
import React, { useEffect } from 'react';
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

import { grades, sectors, locations, languages } from '@/data/formData';
import { useFormLogic } from '@/handlers/form';

const initialFormData = {
  name: '',
  email: '',
  phone_number: '',
  password: '',
  confirmPassword: '',
  user_type: 'Student',
  education_system: 'National',
  studying_language: '',
  grade: '',
  sector: '',
  governate: '',
  district: '',
  wishlist_id: 'default',
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

  const isStudent = formData.user_type === 'Student';

  useEffect(() => {
    const secondaryGrades = ['secondary-1', 'secondary-2', 'secondary-3'];
    if (formData.grade && !secondaryGrades.includes(formData.grade)) {
      setFormData((prev) => ({ ...prev, sector: 'general' }));
    }
  }, [formData.grade]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-center items-center py-8 md:py-12"
    >
      <Card className="w-full max-w-2xl shadow-2xl border border-border/20 bg-background/95 backdrop-blur-lg rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-transparent text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold">{t('signupTitle')}</CardTitle>
          <CardDescription>{t('signupSubtitle')}</CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('selectRole')}</Label>
              <RadioGroup
                name="user_type"
                value={formData.user_type}
                onValueChange={(value) => handleSelectChange('user_type', value)}
                className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                {['Student', 'Teacher'].map((value) => (
                  <div key={value} className="flex items-center gap-2">
                    <RadioGroupItem value={value} id={`role-${value}`} />
                    <Label htmlFor={`role-${value}`} className="font-normal">
                      {t(value.toLowerCase())}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {['name', 'email', 'phone_number'].map((field) => (
              <div key={field} className="space-y-2">
                <Label htmlFor={field}>{t(field)}</Label>
                <Input
                  id={field}
                  type={field === 'email' ? 'email' : 'text'}
                  value={formData[field]}
                  onChange={(e) => handleChange(e, field)}
                />
                {errors[field] && <p className="text-xs text-destructive">{errors[field]}</p>}
              </div>
            ))}

            <PasswordInputs form={formData} handleChange={handleChange} errors={errors} />

            <div className="space-y-2">
              <Label htmlFor="governate">{t('location')}</Label>
              <Select value={formData.governate} onValueChange={(val) => handleSelectChange('governate', val)}>
                <SelectTrigger id="governate">
                  <SelectValue placeholder={t('selectLocation')} />
                </SelectTrigger>
                <SearchableSelectContent
                  items={locations.map((loc) => ({ value: loc.label, label: loc.label }))}
                  searchPlaceholder={t('searchLocation')}
                />
              </Select>
              {errors.governate && <p className="text-xs text-destructive">{errors.governate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">{t('district')}</Label>
              <Input id="district" value={formData.district} onChange={(e) => handleChange(e, 'district')} />
              {errors.district && <p className="text-xs text-destructive">{errors.district}</p>}
            </div>

            {isStudent && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="education_system">{t('educationSystem')}</Label>
                  <Select
                    value={formData.education_system}
                    onValueChange={(val) => handleSelectChange('education_system', val)}
                  >
                    <SelectTrigger id="education_system">
                      <SelectValue placeholder={t('selectEducationSystem')} />
                    </SelectTrigger>
                    <SearchableSelectContent
                      items={['National', 'Azhar'].map((val) => ({ value: val, label: val }))}
                    />
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studying_language">{t('studyingLanguage')}</Label>
                  <Select
                    value={formData.studying_language}
                    onValueChange={(val) => handleSelectChange('studying_language', val)}
                  >
                    <SelectTrigger id="studying_language">
                      <SelectValue placeholder={t('selectLanguage')} />
                    </SelectTrigger>
                    <SearchableSelectContent
                      items={languages.map((lang) => ({
                        value: lang.value,
                        label: t(lang.labelKey),
                      }))}
                    />
                  </Select>
                  {errors.studying_language && <p className="text-xs text-destructive">{errors.studying_language}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade">{t('grade')}</Label>
                  <Select value={formData.grade} onValueChange={(val) => handleSelectChange('grade', val)}>
                    <SelectTrigger id="grade">
                      <SelectValue placeholder={t('selectGrade')} />
                    </SelectTrigger>
                    <SearchableSelectContent
                      items={grades.map((grade) => ({ value: grade.value, label: t(grade.labelKey) }))}
                    />
                  </Select>
                  {errors.grade && <p className="text-xs text-destructive">{errors.grade}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sector">{t('sector')}</Label>
                  <Select value={formData.sector} onValueChange={(val) => handleSelectChange('sector', val)}>
                    <SelectTrigger id="sector">
                      <SelectValue placeholder={t('selectSectorOptional')} />
                    </SelectTrigger>
                    <SearchableSelectContent
                      items={sectors.map((sec) => ({ value: sec.value, label: t(sec.labelKey) }))}
                    />
                  </Select>
                  {errors.sector && <p className="text-xs text-destructive">{errors.sector}</p>}
                </div>
              </>
            )}

            {formData.user_type === 'Teacher' && (
              <>
                <PfpUploadWithCrop formData={formData} setFormData={setFormData} />
                <BannerUploadWithCrop formData={formData} setFormData={setFormData} />
              </>
            )}

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Checkbox
                id="agreedToTerms"
                checked={formData.agreedToTerms}
                onCheckedChange={(checked) => handleSelectChange('agreedToTerms', checked)}
              />
              <Label htmlFor="agreedToTerms" className="text-xs font-normal">
                <Trans i18nKey="agreeToTerms">
                  By signing up, you agree to our <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.
                </Trans>
              </Label>
            </div>
            {errors.agreedToTerms && <p className="text-xs text-destructive">{errors.agreedToTerms}</p>}

            <Button type="submit" className="w-full">{t('signup')}</Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t('alreadyHaveAccount')}{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">{t('login')}</Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SignupPage;
