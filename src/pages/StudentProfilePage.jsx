import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { grades, sectors, locations, educationSystems, languages } from '@/data/formData';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, MapPin, User, Lock, GraduationCap, Building, Globe } from 'lucide-react';
import { SearchableSelectContent } from '@/components/ui/searchSelect';
import SaveButton from '@/components/ui/save';
import { useAuth } from '@/context/AuthContext';
import { studentService } from '@/api/student';
import PasswordInputs from '@/components/ui/password';

const StudentProfilePage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { authState, updateUserData, updatePassword } = useAuth();
  const { userData: authUserData, isLoading: authLoading } = authState;
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    governate: '',
    district: '',
    grade: '',
    sector: '',
    education_system: '',
    language: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  useEffect(() => {
    console.log('Locations from formData:', locations);
    console.log('Education Systems from formData:', educationSystems);
    console.log('Languages from formData:', languages);
    const locationItems = locations.map((loc) => ({
      value: loc.value,
      label: t(loc.labelKey) || loc.value,
    }));
    console.log('Mapped location items for Select:', locationItems);
  }, [t]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let profileData;
        if (authUserData) {
          profileData = authUserData;
          console.log('Auth user data:', profileData);
        } else {
          profileData = await studentService.getProfile();
          console.log('Profile API response:', profileData);
        }

        const phone = profileData.phone || profileData.phone_number || '';
        const rawGovernate = profileData.governate || '';
        const normalizedGovernate = rawGovernate ? rawGovernate.toLowerCase().trim().replace(/\s+/g, '-') : '';
        const validGovernate = locations.find((loc) => loc.value === normalizedGovernate) ? normalizedGovernate : rawGovernate;
        console.log('Raw governate:', rawGovernate, 'Normalized governate:', normalizedGovernate, 'Valid governate:', validGovernate);

        setUserData({
          name: profileData.name || t('Student User'),
          email: profileData.email || '',
          phone,
          governate: validGovernate,
          district: profileData.district || '',
          grade: profileData.grade || 'secondary-2',
          sector: profileData.sector || 'scientific',
          education_system: profileData.education_system || 'national',
          language: profileData.language || 'Arabic',
        });
        console.log('Set userData:', userData);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        toast({
          title: t('error'),
          description: t('failedToLoadProfile'),
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserData();
    }
  }, [authLoading, authUserData, t, toast]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setUserData((prev) => ({ ...prev, [id]: value }));
  };

  const handlePasswordInputChange = (e, field) => {
    setPasswordData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSelectChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!userData.name.trim()) newErrors.name = t('errorRequired');
    if (!userData.email.includes('@')) newErrors.email = t('errorInvalidEmail');
    if (!userData.phone.trim()) newErrors.phone = t('errorRequired');
    if (!userData.governate) newErrors.governate = t('errorRequired');
    if (!userData.district.trim()) newErrors.district = t('errorRequired');
    if (!userData.grade) newErrors.grade = t('errorRequired');
    if (!userData.sector) newErrors.sector = t('errorRequired');
    if (!userData.education_system) newErrors.education_system = t('errorRequired');
    if (!userData.language) newErrors.language = t('errorRequired');
    return newErrors;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    if (!passwordData.currentPassword) newErrors.currentPassword = t('errorRequired');
    if (!passwordData.password) newErrors.password = t('errorRequired');
    if (passwordData.password && passwordData.password.length < 8) newErrors.password = t('errorPasswordShort');
    if (passwordData.password !== passwordData.confirmPassword) newErrors.confirmPassword = t('errorPasswordMismatch');
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast({
        title: t('error'),
        description: t('pleaseFixErrors'),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = { ...userData };
      console.log('Saving profile with payload:', payload);
      await studentService.updateProfile(payload);
      updateUserData(payload);
      toast({
        title: t('toastTitleSaved'),
        description: t('toastDescSaved'),
      });
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast({
        title: t('error'),
        description: error.message || t('failedToSaveProfile'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const passwordErrors = validatePasswordForm();
    setErrors(passwordErrors);
    if (Object.keys(passwordErrors).length > 0) {
      toast({
        title: t('error'),
        description: t('pleaseFixErrors'),
        variant: 'destructive',
      });
      return;
    }

    setIsPasswordLoading(true);
    try {
      await updatePassword(passwordData.currentPassword, passwordData.password);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast({
        title: t('success'),
        description: t('passwordUpdated'),
      });
    } catch (error) {
      console.error('Failed to update password:', error);
      toast({
        title: t('error'),
        description: error.message || t('failedToUpdatePassword'),
        variant: 'destructive',
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (isLoading || authLoading) {
    return <div>{t('loading')}</div>;
  }

  if (!locations || locations.length === 0 || !languages || languages.length === 0) {
    console.error('Data arrays empty or undefined:', { locations, languages });
    return (
      <div className="text-red-500">
        {t('errorLoadingData')}: Data is unavailable. Please contact support.
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
<<<<<<< HEAD
      <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
=======
      <div className="lg:col-span-2 space-y-6">
>>>>>>> f48463cd3ab1f4179ef06b1c676d9ab31a295f09
        <h1 className="text-3xl font-bold mb-4">{t('settingss')}</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> {t('accountInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="mb-2 block">{t('name')}</Label>
              <Input id="name" value={userData.name} onChange={handleInputChange} />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div className="relative">
              <Label htmlFor="email" className="mb-2 block">{t('email')}</Label>
              <Mail className="absolute left-3 top-9 w-4 h-4 text-muted-foreground" />
              <Input id="email" type="email" value={userData.email} onChange={handleInputChange} className="pl-10" />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div className="relative">
              <Label htmlFor="phone" className="mb-2 block">{t('phone')}</Label>
              <Phone className="absolute left-3 top-9 w-4 h-4 text-muted-foreground" />
              <Input id="phone" value={userData.phone} onChange={handleInputChange} className="pl-10" />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <Label htmlFor="governate" className="mb-2 block flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                {t('governate')}
              </Label>
              <Select value={userData.governate} onValueChange={(v) => handleSelectChange('governate', v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectGovernate')} />
                </SelectTrigger>
                <SearchableSelectContent
                  searchPlaceholder={t('searchGovernate')}
                  items={locations.map((loc) => ({
                    value: loc.value,
                    label: t(loc.labelKey) || loc.value,
                  }))}
                />
              </Select>
              {errors.governate && <p className="text-sm text-red-500 mt-1">{errors.governate}</p>}
            </div>
            <div>
              <Label htmlFor="district" className="mb-2 block flex items-center gap-2">
                <Building className="w-4 h-4 text-muted-foreground" />
                {t('district')}
              </Label>
              <Input id="district" value={userData.district} onChange={handleInputChange} />
              {errors.district && <p className="text-sm text-red-500 mt-1">{errors.district}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> {t('security')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PasswordInputs
              form={passwordData}
              handleChange={handlePasswordInputChange}
              handleSubmit={handlePasswordSubmit}
              errors={errors}
              loading={isPasswordLoading}
              variant="update"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" /> {t('education')}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="mb-2 block">{t('grade')}</Label>
              <Select value={userData.grade} onValueChange={(v) => handleSelectChange('grade', v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectGrade')} />
                </SelectTrigger>
                <SearchableSelectContent
                  searchPlaceholder={t('searchGrade')}
                  items={grades.map((g) => ({
                    value: g.value,
                    label: t(g.labelKey),
                  }))}
                />
              </Select>
              {errors.grade && <p className="text-sm text-red-500 mt-1">{errors.grade}</p>}
            </div>
            <div>
              <Label className="mb-2 block">{t('sector')}</Label>
              <Select value={userData.sector} onValueChange={(v) => handleSelectChange('sector', v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectSector')} />
                </SelectTrigger>
                <SearchableSelectContent
                  searchPlaceholder={t('searchSector')}
                  items={sectors.map((s) => ({
                    value: s.value,
                    label: t(s.labelKey),
                  }))}
                />
              </Select>
              {errors.sector && <p className="text-sm text-red-500 mt-1">{errors.sector}</p>}
            </div>
            <div>
              <Label className="mb-2 block">{t('educationSystem')}</Label>
              <Select value={userData.education_system} onValueChange={(v) => handleSelectChange('education_system', v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectEducationSystem')} />
                </SelectTrigger>
                <SearchableSelectContent
                  searchPlaceholder={t('searchEducationSystem')}
                  items={educationSystems.map((es) => ({
                    value: es.value,
                    label: t(es.labelKey),
                  }))}
                />
              </Select>
              {errors.education_system && <p className="text-sm text-red-500 mt-1">{errors.education_system}</p>}
            </div>
            <div>
              <Label className="mb-2 block flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                {t('language')}
              </Label>
              <Select value={userData.language} onValueChange={(v) => handleSelectChange('language', v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectLanguage')} />
                </SelectTrigger>
                <SearchableSelectContent
                  searchPlaceholder={t('searchLanguage')}
                  items={languages.map((l) => ({
                    value: l.value,
                    label: t(l.labelKey),
                  }))}
                />
              </Select>
              {errors.language && <p className="text-sm text-red-500 mt-1">{errors.language}</p>}
            </div>
          </CardContent>
        </Card>

        <div className="pt-4">
          <SaveButton onClick={handleSubmit} disabled={isLoading} />
        </div>
      </div>

      <div className="space-y-4 hidden lg:block">
        <Card className="bg-muted/40 border sticky top-24">
          <CardHeader>
            <CardTitle>{t('accountDetails')}</CardTitle>
            <CardDescription>{t('viewOnlyInfo')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 grid-cols-1">
            <div>
              <Label className="mb-2 text-muted-foreground">{t('name')}</Label>
              <p className="font-medium text-foreground">{userData.name}</p>
            </div>
            <div>
              <Label className="mb-2 text-muted-foreground">{t('email')}</Label>
              <p className="font-medium text-foreground">{userData.email}</p>
            </div>
            <div>
              <Label className="mb-2 text-muted-foreground">{t('phone')}</Label>
              <p className="font-medium text-foreground">{userData.phone || t('notSet')}</p>
            </div>
            <div>
              <Label className="mb-2 text-muted-foreground">{t('governate')}</Label>
              <p className="font-medium text-foreground">
                {userData.governate ? t(locations.find((loc) => loc.value === userData.governate)?.labelKey || userData.governate) : t('notSet')}
              </p>
            </div>
            <div>
              <Label className="mb-2 text-muted-foreground">{t('district')}</Label>
              <p className="font-medium text-foreground">{userData.district || t('notSet')}</p>
            </div>
            <div>
              <Label className="mb-2 text-muted-foreground">{t('grade')}</Label>
              <p className="font-medium text-foreground">
                {userData.grade ? t(grades.find((g) => g.value === userData.grade)?.labelKey) : t('notSet')}
              </p>
            </div>
            <div>
              <Label className="mb-2 text-muted-foreground">{t('sector')}</Label>
              <p className="font-medium text-foreground">
                {userData.sector ? t(sectors.find((s) => s.value === userData.sector)?.labelKey) : t('notSet')}
              </p>
            </div>
            <div>
              <Label className="mb-2 text-muted-foreground">{t('educationSystem')}</Label>
              <p className="font-medium text-foreground">
                {userData.education_system ? t(educationSystems.find((es) => es.value === userData.education_system)?.labelKey || userData.education_system) : t('notSet')}
              </p>
            </div>
            <div>
              <Label className="mb-2 text-muted-foreground">{t('language')}</Label>
              <p className="font-medium text-foreground">
                {userData.language ? t(languages.find((l) => l.value === userData.language)?.labelKey || userData.language) : t('notSet')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default StudentProfilePage;