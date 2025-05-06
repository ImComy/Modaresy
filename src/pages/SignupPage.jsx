
    import React, { useState } from 'react';
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
    import { MultiSelect } from '@/components/ui/multi-select'; // Import MultiSelect
    import { grades, sectors, locations, subjects as allSubjectsList } from '@/data/formData';

    // Prepare options for MultiSelect
    const subjectOptions = allSubjectsList.map(s => ({ value: s.value, label: s.label }));
    const gradeOptions = grades.map(g => ({ value: g.value, label: g.labelKey })); // Use labelKey for translation
    const sectorOptions = sectors.map(s => ({ value: s.value, label: s.labelKey })); // Use labelKey for translation

    const SignupPage = () => {
      const { t } = useTranslation();
      const navigate = useNavigate();
      const { toast } = useToast();
      const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        grade: '', // Student specific (single select)
        sector: '', // Student specific (single select)
        location: '', // Teacher specific (single select)
        subjects: [], // Teacher specific (multi-select - array of values)
        targetGrades: [], // Teacher specific (multi-select)
        targetSectors: [], // Teacher specific (multi-select)
        photoUrl: '', // Teacher specific
        agreedToTerms: false,
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

      // Handler for MultiSelect components
      const handleMultiSelectChange = (name, selectedValues) => {
        setFormData(prev => ({ ...prev, [name]: selectedValues }));
         if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
      };

      const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = t('nameRequired');
        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('emailInvalid');
        if (!formData.password || formData.password.length < 6) newErrors.password = t('passwordLengthError');
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t('passwordMismatch');
        if (!formData.agreedToTerms) newErrors.agreedToTerms = t('termsRequired');

        if (formData.role === 'teacher') {
          if (!formData.location) newErrors.location = t('locationRequired');
          if (formData.subjects.length === 0) newErrors.subjects = t('subjectsRequired'); // Check array length
          if (formData.targetGrades.length === 0) newErrors.targetGrades = t('targetGradesRequired'); // Add this key
          if (formData.targetSectors.length === 0) newErrors.targetSectors = t('targetSectorsRequired'); // Add this key
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

      // Translate options for MultiSelect
      const translatedGradeOptions = gradeOptions.map(opt => ({ ...opt, label: t(opt.label) }));
      const translatedSectorOptions = sectorOptions.map(opt => ({ ...opt, label: t(opt.label) }));

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
                  <RadioGroup name="role" value={formData.role} onValueChange={(value) => handleSelectChange('role', value)} className="flex space-x-4 rtl:space-x-reverse">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse"><RadioGroupItem value="student" id="role-student" /><Label htmlFor="role-student" className="font-normal">{t('student')}</Label></div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse"><RadioGroupItem value="teacher" id="role-teacher" /><Label htmlFor="role-teacher" className="font-normal">{t('teacher')}</Label></div>
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

                {/* Student Specific Fields */}
                {formData.role === 'student' && (
                  <>
                    <div className="space-y-1">
                      <Label htmlFor="grade">{t('grade')}</Label>
                      <Select name="grade" value={formData.grade} onValueChange={(value) => handleSelectChange('grade', value)}>
                        <SelectTrigger id="grade"><SelectValue placeholder={t('selectGradeOptional')} /></SelectTrigger>
                        <SelectContent>{grades.map(grade => (<SelectItem key={grade.value} value={grade.value}>{t(grade.labelKey)}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="sector">{t('sector')}</Label>
                      <Select name="sector" value={formData.sector} onValueChange={(value) => handleSelectChange('sector', value)}>
                        <SelectTrigger id="sector"><SelectValue placeholder={t('selectSectorOptional')} /></SelectTrigger>
                        <SelectContent>{sectors.map(sector => (<SelectItem key={sector.value} value={sector.value}>{t(sector.labelKey)}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Teacher Specific Fields */}
                {formData.role === 'teacher' && (
                  <>
                    <div className="space-y-1">
                      <Label htmlFor="location">{t('location')}</Label>
                      <Select name="location" value={formData.location} onValueChange={(value) => handleSelectChange('location', value)}>
                        <SelectTrigger id="location" error={errors.location}><SelectValue placeholder={t('selectLocation')} /></SelectTrigger>
                        <SelectContent>{locations.map(loc => (<SelectItem key={loc.value} value={loc.value} className="capitalize">{loc.label}</SelectItem>))}</SelectContent>
                      </Select>
                      {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
                    </div>
                    <div className="space-y-1">
                       <Label htmlFor="subjects">{t('subjects')}</Label>
                       <MultiSelect
                         id="subjects"
                         options={subjectOptions}
                         selected={formData.subjects}
                         onChange={(selected) => handleMultiSelectChange('subjects', selected)}
                         placeholder={t('selectSubjectsPlaceholder')} // Add this key
                         searchPlaceholder={t('searchSubjectsPlaceholder')} // Add this key
                         emptyPlaceholder={t('noSubjectsFoundPlaceholder')} // Add this key
                         error={errors.subjects}
                       />
                       {errors.subjects && <p className="text-xs text-destructive">{errors.subjects}</p>}
                    </div>
                     <div className="space-y-1">
                       <Label htmlFor="targetGrades">{t('targetGrades')}</Label> {/* Add this key */}
                       <MultiSelect
                         id="targetGrades"
                         options={translatedGradeOptions}
                         selected={formData.targetGrades}
                         onChange={(selected) => handleMultiSelectChange('targetGrades', selected)}
                         placeholder={t('selectTargetGradesPlaceholder')} // Add this key
                         searchPlaceholder={t('searchGradesPlaceholder')} // Add this key
                         emptyPlaceholder={t('noGradesFoundPlaceholder')} // Add this key
                         error={errors.targetGrades}
                       />
                       {errors.targetGrades && <p className="text-xs text-destructive">{errors.targetGrades}</p>}
                    </div>
                     <div className="space-y-1">
                       <Label htmlFor="targetSectors">{t('targetSectors')}</Label> {/* Add this key */}
                       <MultiSelect
                         id="targetSectors"
                         options={translatedSectorOptions}
                         selected={formData.targetSectors}
                         onChange={(selected) => handleMultiSelectChange('targetSectors', selected)}
                         placeholder={t('selectTargetSectorsPlaceholder')} // Add this key
                         searchPlaceholder={t('searchSectorsPlaceholder')} // Add this key
                         emptyPlaceholder={t('noSectorsFoundPlaceholder')} // Add this key
                         error={errors.targetSectors}
                       />
                       {errors.targetSectors && <p className="text-xs text-destructive">{errors.targetSectors}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="photoUrl">{t('photoUrl')}</Label>
                      <Input id="photoUrl" name="photoUrl" type="url" value={formData.photoUrl} onChange={handleInputChange} placeholder={t('photoUrlPlaceholder')} />
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
  