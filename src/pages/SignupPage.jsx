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
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { SearchableSelectContent } from '@/components/ui/searchSelect';
import PasswordInputs from '@/components/ui/password';
import PfpUploadWithCrop from '@/components/pfpSignup';
import BannerUploadWithCrop from '@/components/bannerSignup';
import { grades, sectors, locations, languages } from '@/data/formData';
import { useFormLogic } from '@/handlers/form';
import { ScrollableTimeline } from '@/components/ui/timeline';

const initialFormData = {
  name: '',
  email: '',
  phone_number: '',
  password: '',
  confirmPassword: '',
  user_type: 'Student',
  education_system: '',
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
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.dir() === 'rtl';

  const {
    formData,
    errors,
    handleChange,
    handleSelectChange,
    handleSubmit,
    setFormData,
  } = useFormLogic(initialFormData, navigate, t, { isSignup: true });

  const isStudent = formData.user_type === 'Student';
  const showImageOnLeft = isRTL ? !isStudent : isStudent;

  useEffect(() => {
    const secondaryGrades = ['secondary-1', 'secondary-2', 'secondary-3'];
    if (formData.grade && !secondaryGrades.includes(formData.grade)) {
      setFormData((prev) => ({ ...prev, sector: 'general' }));
    }
  }, [formData.grade, setFormData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex justify-center items-center py-8 md:py-16 w-full"
    >
      <motion.div
        key={formData.user_type + '-timeline'}
        initial={{ x: showImageOnLeft ? -100 : 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`hidden md:flex w-1/2 items-center justify-center p-6 ${showImageOnLeft ? 'order-1' : 'order-2'}`}
      >
        <div className="w-full">
          <ScrollableTimeline key={formData.user_type} userType={formData.user_type?.toLowerCase()} />
        </div>
      </motion.div>

      <div className="relative flex flex-col md:flex-row bg-background/90 rounded-3xl shadow-xl overflow-hidden border border-border/30">
        <motion.div
          key={formData.user_type + '-form'}
          initial={{ x: showImageOnLeft ? 100 : -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`w-full p-6 sm:p-8 ${showImageOnLeft ? 'order-2' : 'order-1'}`}
        >
          <CardHeader className="p-0 pb-4 text-center">
            <CardTitle className="text-2xl md:text-3xl font-bold">{t('signupTitle')}</CardTitle>
            <CardDescription>{t('signupSubtitle')}</CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user_type">{t('selectRole')} <span className="text-destructive">*</span></Label>
                <RadioGroup
                  name="user_type"
                  value={formData.user_type}
                  onValueChange={(value) => handleSelectChange('user_type', value)}
                  className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}
                  required
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
                {errors.user_type && <p className="text-xs text-destructive">{errors.user_type}</p>}
              </div>

              {['name', 'email', 'phone_number'].map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field}>{t(field)} <span className="text-destructive">*</span></Label>
                  <Input
                    id={field}
                    type={field === 'email' ? 'email' : 'text'}
                    value={formData[field]}
                    onChange={(e) => handleChange(e, field)}
                    placeholder={t(`placeholder.${field}`)}
                    required
                    error={errors[field]}
                  />
                  {errors[field] && <p className="text-xs text-destructive">{errors[field]}</p>}
                </div>
              ))}

              <PasswordInputs form={formData} handleChange={handleChange} errors={errors} required />

              <div className="space-y-2">
                <Label htmlFor="governate">{t('location')} <span className="text-destructive">*</span></Label>
                <Select value={formData.governate} onValueChange={(val) => handleSelectChange('governate', val)} required>
                  <SelectTrigger id="governate">
                    <SelectValue placeholder={t('placeholder.selectLocation')} />
                  </SelectTrigger>
                  <SearchableSelectContent
                    items={locations.map((loc) => ({ value: loc.label, label: loc.label }))}
                    searchPlaceholder={t('placeholder.searchLocation')}
                  />
                </Select>
                {errors.governate && <p className="text-xs text-destructive">{errors.governate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">{t('district')} <span className="text-destructive">*</span></Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => handleChange(e, 'district')}
                  placeholder={t('placeholder.district')}
                  required
                  error={errors.district}
                />
                {errors.district && <p className="text-xs text-destructive">{errors.district}</p>}
              </div>

              {isStudent && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="education_system">{t('educationSystem')} <span className="text-destructive">*</span></Label>
                    <Select value={formData.education_system} onValueChange={(val) => handleSelectChange('education_system', val)} required>
                      <SelectTrigger id="education_system">
                        <SelectValue placeholder={t('placeholder.selectEducationSystem')} />
                      </SelectTrigger>
                      <SearchableSelectContent items={['National', 'Azhar'].map(val => ({ value: val, label: val }))} />
                    </Select>
                    {errors.education_system && <p className="text-xs text-destructive">{errors.education_system}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studying_language">{t('studyingLanguage')} <span className="text-destructive">*</span></Label>
                    <Select value={formData.studying_language} onValueChange={(val) => handleSelectChange('studying_language', val)} required>
                      <SelectTrigger id="studying_language">
                        <SelectValue placeholder={t('placeholder.selectLanguage')} />
                      </SelectTrigger>
                      <SearchableSelectContent items={languages.map(lang => ({ value: lang.value, label: t(lang.labelKey) }))} />
                    </Select>
                    {errors.studying_language && <p className="text-xs text-destructive">{errors.studying_language}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade">{t('grade')} <span className="text-destructive">*</span></Label>
                    <Select value={formData.grade} onValueChange={(val) => handleSelectChange('grade', val)} required>
                      <SelectTrigger id="grade">
                        <SelectValue placeholder={t('placeholder.selectGrade')} />
                      </SelectTrigger>
                      <SearchableSelectContent items={grades.map(grade => ({ value: grade.value, label: t(grade.labelKey) }))} />
                    </Select>
                    {errors.grade && <p className="text-xs text-destructive">{errors.grade}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sector">{t('sector')} <span className="text-destructive">*</span></Label>
                    <Select value={formData.sector} onValueChange={(val) => handleSelectChange('sector', val)} required>
                      <SelectTrigger id="sector">
                        <SelectValue placeholder={t('placeholder.selectSector')} />
                      </SelectTrigger>
                      <SearchableSelectContent items={sectors.map(sec => ({ value: sec.value, label: t(sec.labelKey) }))} />
                    </Select>
                    {errors.sector && <p className="text-xs text-destructive">{errors.sector}</p>}
                  </div>
                </>
              )}

              {formData.user_type === 'Teacher' && (
                <>
                  <PfpUploadWithCrop formData={formData} setFormData={setFormData} required />
                  <BannerUploadWithCrop formData={formData} setFormData={setFormData} required />
                </>
              )}

              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Checkbox
                  id="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onCheckedChange={(checked) => handleSelectChange('agreedToTerms', checked)}
                  required
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
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SignupPage;