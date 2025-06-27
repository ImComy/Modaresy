import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import MultiSelect from '@/components/ui/multi-select';
import { grades, sectors, locations, subjects as allSubjectsList } from '@/data/formData';
import PfpUploadWithCrop from '@/components/pfpSignup';
import BannerUploadWithCrop from '@/components/bannerSignup';
import { SearchableSelectContent } from '@/components/ui/searchSelect';
import i18next from 'i18next';

const subjectOptions = allSubjectsList.map(subject => ({
  value: subject.toLowerCase().replace(/\s+/g, '-'),
  label: subject
}));
const gradeOptions = grades.map(g => ({ value: g.value, label: g.labelKey }));
const sectorOptions = sectors.map(s => ({ value: s.value, label: s.labelKey }));

const SignupPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
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
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    if (name === 'password' && errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: null }));
    if (name === 'confirmPassword' && errors.password) setErrors(prev => ({ ...prev, password: null }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };
  const [isRTL, setIsRTL] = useState(i18next.dir() === 'rtl');

  useEffect(() => {
    const updateDir = () => setIsRTL(i18next.dir() === 'rtl');

    i18next.on('languageChanged', updateDir);
    return () => {
      i18next.off('languageChanged', updateDir);
    };
  }, []);

  const validatePhone = (phone) => /^\+?\d{10,15}$/.test(phone);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = t('nameRequired');
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('emailInvalid');
    if (!formData.phone || !validatePhone(formData.phone)) newErrors.phone = t('phoneInvalid');
    if (!formData.password || formData.password.length < 6) newErrors.password = t('passwordLengthError');
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t('passwordMismatch');
    if (!formData.agreedToTerms) newErrors.agreedToTerms = t('termsRequired');
    if (formData.role === 'student' && !formData.grade) newErrors.grade = t('gradeInvalid');

    if (!formData.location) newErrors.location = t('locationRequired');

    if (formData.role === 'teacher') {
      if (formData.subjects.length === 0) newErrors.subjects = t('subjectsRequired');
      if (formData.targetGrades.length === 0) newErrors.targetGrades = t('targetGradesRequired');
      if (formData.targetSectors.length === 0) newErrors.targetSectors = t('targetSectorsRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ title: t('error'), description: t('validationError'), variant: 'destructive' });
      return;
    }
    console.log('Submitting signup data:', formData);
    toast({ title: t('signupSuccess'), description: t('signupSuccessDesc') });
    navigate('/login');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-center items-center py-8 md:py-12"
    >
      <Card className="w-full max-w-lg shadow-lg glass-effect">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold">{t('signupTitle')}</CardTitle>
          <CardDescription>{t('signupSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
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
            <div className="space-y-1">
              <Label htmlFor="name">{t('name')}</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} error={errors.name} />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">{t('email')}</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} error={errors.email} />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">{t('password')}</Label>
              <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} error={errors.password || errors.confirmPassword} />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} error={errors.confirmPassword} />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">{t('phone')}</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} error={errors.phone} placeholder="+201234567890" />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="location">{t('location')}</Label>
              <Select name="location" value={formData.location} onValueChange={(value) => handleSelectChange('location', value)}>
                <SelectTrigger id="location" error={errors.location}>
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
                <div className="space-y-1">
                  <Label htmlFor="grade">{t('grade')}</Label>
                  <Select
                    name="grade"
                    value={formData.grade}
                    onValueChange={(value) => handleSelectChange('grade', value)}
                  >
                    <SelectTrigger id="grade" error={errors.grade}>
                      <SelectValue placeholder={t('selectGrade')} />
                    </SelectTrigger>
                    <SearchableSelectContent
                      items={grades.map(grade => ({ value: grade.value, label: t(grade.labelKey) }))}
                      searchPlaceholder={t('searchGrade')}
                    />
                  </Select>
                  {errors.grade && <p className="text-xs text-destructive">{errors.grade}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="sector">{t('sector')}</Label>
                  <Select name="sector" value={formData.sector} onValueChange={(value) => handleSelectChange('sector', value)}>
                    <SelectTrigger id="sector">
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
              <>
                <div className="space-y-6">
                  <PfpUploadWithCrop formData={formData} setFormData={setFormData} />
                  <BannerUploadWithCrop formData={formData} setFormData={setFormData} />
                </div>
              </>
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
