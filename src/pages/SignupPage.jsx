import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { SearchableSelectContent } from '@/components/ui/searchSelect';
import PasswordInputs from '@/components/ui/password';
import PfpUploadWithCrop from '@/components/pfpSignup';
import BannerUploadWithCrop from '@/components/bannerSignup';
import { grades, sectors, locations } from '@/data/formData';
import { useFormLogic } from '@/handlers/form';
import SubscriptionSection from '../components/packages';

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

const useMediaQuery = (query) => {
  const [matches, setMatches] = React.useState(() => window.matchMedia(query).matches);
  React.useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [query]);
  return matches;
};

const SignupPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const {
    formData,
    errors,
    isRTL,
    handleChange,
    handleSelectChange,
    handleSubmit,
    setFormData,
  } = useFormLogic(initialFormData, navigate, t, { isSignup: true });

  const Wrapper = isMobile ? 'div' : motion.div;
  const Section = isMobile ? 'section' : motion.section;

  return (
    <Wrapper
      {...(!isMobile && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: 'easeOut' },
      })}
      className="flex flex-col md:flex-row justify-center items-start py-8 md:py-12 gap-6"
    >
      <motion.div
        animate={
          !isMobile && formData.role === 'teacher'
            ? { x: isRTL ? 10 : -10 }
            : { x: 0 }
        }
        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl border border-border/20 bg-background/95 backdrop-blur-lg rounded-2xl overflow-hidden">
          <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-transparent text-center">
            <CardTitle className="text-2xl md:text-3xl font-bold">{t('signupTitle')}</CardTitle>
            <CardDescription>{t('signupSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t('selectRole')}</Label>
                <RadioGroup
                  name="role"
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange('role', value)}
                  className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  {['student', 'teacher'].map((role) => (
                    <div key={role} className="flex items-center gap-2">
                      <RadioGroupItem value={role} id={`role-${role}`} />
                      <Label htmlFor={`role-${role}`}>{t(role)}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {['name', 'email', 'phone'].map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field}>{t(field)}</Label>
                  <Input
                    id={field}
                    name={field}
                    type={field === 'email' ? 'email' : 'text'}
                    value={formData[field]}
                    onChange={(e) => handleChange(e, field)}
                    placeholder={t(`settings.form.${field}Placeholder`)}
                    className={`bg-input border ${errors[field] ? 'border-destructive' : 'border-border/50'} rounded-lg`}
                  />
                  {errors[field] && <p className="text-xs text-destructive">{errors[field]}</p>}
                </div>
              ))}

              <PasswordInputs form={formData} handleChange={handleChange} errors={errors} />

              <div className="space-y-2">
                <Label htmlFor="location">{t('location')}</Label>
                <Select
                  name="location"
                  value={formData.location}
                  onValueChange={(value) => handleSelectChange('location', value)}
                >
                  <SelectTrigger id="location" className={`bg-input border ${errors.location ? 'border-destructive' : 'border-border/50'} rounded-lg`}>
                    <SelectValue placeholder={t('selectLocation')} />
                  </SelectTrigger>
                  <SearchableSelectContent
                    items={locations.map((loc) => ({ value: loc.value, label: loc.label }))}
                    searchPlaceholder={t('searchLocation')}
                  />
                </Select>
                {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
              </div>

              {formData.role === 'student' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="grade">{t('grade')}</Label>
                    <Select
                      name="grade"
                      value={formData.grade}
                      onValueChange={(value) => handleSelectChange('grade', value)}
                    >
                      <SelectTrigger id="grade" className={`bg-input border ${errors.grade ? 'border-destructive' : 'border-border/50'} rounded-lg`}>
                        <SelectValue placeholder={t('selectGrade')} />
                      </SelectTrigger>
                      <SearchableSelectContent
                        items={grades.map((g) => ({ value: g.value, label: t(g.labelKey) }))}
                        searchPlaceholder={t('searchGrade')}
                      />
                    </Select>
                    {errors.grade && <p className="text-xs text-destructive">{errors.grade}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sector">{t('sector')}</Label>
                    <Select
                      name="sector"
                      value={formData.sector}
                      onValueChange={(value) => handleSelectChange('sector', value)}
                    >
                      <SelectTrigger id="sector" className="bg-input border border-border/50 rounded-lg">
                        <SelectValue placeholder={t('selectSectorOptional')} />
                      </SelectTrigger>
                      <SearchableSelectContent
                        items={sectors.map((s) => ({ value: s.value, label: t(s.labelKey) }))}
                        searchPlaceholder={t('searchSector')}
                      />
                    </Select>
                  </div>
                </>
              )}

              {formData.role === 'teacher' && (
                <div className="space-y-6">
                  <PfpUploadWithCrop formData={formData} setFormData={setFormData} />
                  <BannerUploadWithCrop formData={formData} setFormData={setFormData} />
                </div>
              )}

              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Checkbox
                  id="agreedToTerms"
                  name="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onCheckedChange={(checked) => handleSelectChange('agreedToTerms', checked)}
                />
                <Label htmlFor="agreedToTerms" className="text-xs text-muted-foreground">
                  <Trans i18nKey="agreeToTerms">
                    By signing up, you agree to our <Link to="/terms" className="underline hover:text-primary">Terms of Service</Link> and <Link to="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
                  </Trans>
                </Label>
              </div>

              {errors.agreedToTerms && <p className="text-xs text-destructive">{errors.agreedToTerms}</p>}
              {errors.form && <p className="text-sm text-destructive text-center">{errors.form}</p>}

              <Button type="submit" className="w-full">{t('signup')}</Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {t('alreadyHaveAccount')}{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                {t('login')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {formData.role === 'teacher' && (
          <Section
            {...(!isMobile && {
              key: 'subscription',
              initial: { opacity: 0, x: isRTL ? -100 : 100 },
              animate: { opacity: 1, x: 0 },
              exit: { opacity: 0, x: isRTL ? -100 : 100 },
              transition: { type: 'spring', stiffness: 80, damping: 18 },
            })}
            className="w-full max-w-lg"
          >
            <SubscriptionSection />
          </Section>
        )}
      </AnimatePresence>
    </Wrapper>
  );
};

export default SignupPage;
