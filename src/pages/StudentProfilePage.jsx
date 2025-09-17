import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
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
import { getConstants } from '@/api/constantsFetch';

const StudentProfilePage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { authState, updateUserData, updatePassword } = useAuth();
  const { userData: authUserData, isLoading: authLoading } = authState;
  const [constants, setConstants] = useState(null);
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
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableGrades, setAvailableGrades] = useState([]);
  const [availableSectors, setAvailableSectors] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);

  // Load constants
  useEffect(() => {
    const loadConstants = async () => {
      try {
        const data = await getConstants();
        setConstants(data);
      } catch (error) {
        console.error('Failed to load constants:', error);
      }
    };
    loadConstants();
  }, []);

  // Update districts when governate changes
  useEffect(() => {
    if (userData.governate && constants?.Districts) {
      const districts = constants.Districts[userData.governate] || [];
      // translate each district with constants key with fallback
      setAvailableDistricts(
        districts.map(d => ({
          value: d,
          label: t(`constants.Districts.${d}`, { defaultValue: d })
        }))
      );

      // Reset district if not available in new governate
      if (userData.district && !districts.includes(userData.district)) {
        setUserData(prev => ({ ...prev, district: '' }));
      }
    } else {
      setAvailableDistricts([]);
      setUserData(prev => ({ ...prev, district: '' }));
    }
  }, [userData.governate, constants, t]);

  // Update grades when education system changes
  useEffect(() => {
    if (userData.education_system && constants?.EducationStructure) {
      const systemGrades = constants.EducationStructure[userData.education_system]?.grades || [];
      setAvailableGrades(
        systemGrades.map(g => ({
          value: g,
          label: t(`constants.EducationStructure.${userData.education_system}.grades.${g}`, { defaultValue: g })
        }))
      );

      // Reset grade and sector if not compatible with new system
      if (userData.grade && !systemGrades.includes(userData.grade)) {
        setUserData(prev => ({ ...prev, grade: '', sector: '' }));
      }
    } else {
      setAvailableGrades([]);
      setUserData(prev => ({ ...prev, grade: '', sector: '' }));
    }
  }, [userData.education_system, constants, t]);

  // Update sectors when grade changes
  useEffect(() => {
    if (userData.grade && userData.education_system && constants?.EducationStructure) {
      const gradeSectors = constants.EducationStructure[userData.education_system]?.sectors?.[userData.grade] || [];
      setAvailableSectors(
        gradeSectors.map(s => ({
          value: s,
          // try structured path first, fallback to generic constant key and then the raw value
          label:
            t(`constants.EducationStructure.${userData.education_system}.sectors.${userData.grade}.${s}`, { defaultValue: '' }) ||
            t(`constants.EducationStructure.${userData.education_system}.sectors.${s}`, { defaultValue: '' }) ||
            t(`constants.sectors.${s}`, { defaultValue: s })
        }))
      );

      // Reset sector if not compatible with new grade
      if (userData.sector && !gradeSectors.includes(userData.sector)) {
        setUserData(prev => ({ ...prev, sector: '' }));
      }
    } else {
      setAvailableSectors([]);
      setUserData(prev => ({ ...prev, sector: '' }));
    }
  }, [userData.grade, userData.education_system, constants, t]);

  // Update languages when education system changes
  useEffect(() => {
    if (userData.education_system && constants?.EducationStructure) {
      // Get languages from the selected education system
      const systemLanguages = constants.EducationStructure[userData.education_system]?.languages || [];
      // Fallback to Arabic if no languages defined (for Azhar case)
      const languagesToShow = systemLanguages.length > 0 ? systemLanguages : ['Arabic'];
      setAvailableLanguages(
        languagesToShow.map(l => ({
          value: l,
          label:
            t(`constants.EducationStructure.${userData.education_system}.languages.${l}`, { defaultValue: '' }) ||
            t(`constants.Languages.${l}`, { defaultValue: l })
        }))
      );

      // Reset language if not compatible with new system
      if (userData.language && !languagesToShow.includes(userData.language)) {
        setUserData(prev => ({ ...prev, language: '' }));
      }
    } else {
      setAvailableLanguages([]);
    }
  }, [userData.education_system, constants, t]);

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
        const validGovernate = constants?.Governates?.find(g => g === rawGovernate) ? rawGovernate : '';

        setUserData({
          name: profileData.name || t('Student User'),
          email: profileData.email || '',
          phone,
          governate: validGovernate,
          district: profileData.district || '',
          grade: profileData.grade || '',
          sector: profileData.sector || '',
          education_system: profileData.education_system || '',
          language: profileData.language || '',
        });
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

    if (!authLoading && constants) {
      fetchUserData();
    }
  }, [authLoading, authUserData, t, toast, constants]);

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
    if (!userData.district) newErrors.district = t('errorRequired');
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

  if (isLoading || authLoading || !constants) {
    return <div>{t('loading')}</div>;
  }

  return (
    <motion.div
      className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="lg:col-span-2 space-y-6">
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
                  items={(constants.Governates || []).map((gov) => ({
                    value: gov,
                    label: t(`constants.Governates.${gov}`, { defaultValue: gov }),
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
              <Select 
                value={userData.district} 
                onValueChange={(v) => handleSelectChange('district', v)}
                disabled={!userData.governate}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    userData.governate ? t('selectDistrict') : t('selectGovernateFirst')
                  } />
                </SelectTrigger>
                {userData.governate && (
                  <SearchableSelectContent
                    searchPlaceholder={t('searchDistrict')}
                    items={availableDistricts}
                  />
                )}
              </Select>
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
              <Label className="mb-2 block">{t('educationSystem')}</Label>
              <Select 
                value={userData.education_system} 
                onValueChange={(v) => handleSelectChange('education_system', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectEducationSystem')} />
                </SelectTrigger>
                <SearchableSelectContent
                  searchPlaceholder={t('searchEducationSystem')}
                  items={(constants.Education_Systems || []).map((system) => ({
                    value: system,
                    label: t(`constants.Education_Systems.${system}`, { defaultValue: system }),
                  }))}
                />
              </Select>
              {errors.education_system && <p className="text-sm text-red-500 mt-1">{errors.education_system}</p>}
            </div>

            <div>
              <Label className="mb-2 block">{t('grade')}</Label>
              <Select 
                value={userData.grade} 
                onValueChange={(v) => handleSelectChange('grade', v)}
                disabled={!userData.education_system}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    userData.education_system ? t('selectGrade') : t('selectSystemFirst')
                  } />
                </SelectTrigger>
                {userData.education_system && (
                  <SearchableSelectContent
                    searchPlaceholder={t('searchGrade')}
                    items={availableGrades}
                  />
                )}
              </Select>
              {errors.grade && <p className="text-sm text-red-500 mt-1">{errors.grade}</p>}
            </div>

            <div>
              <Label className="mb-2 block">{t('sector')}</Label>
              <Select 
                value={userData.sector} 
                onValueChange={(v) => handleSelectChange('sector', v)}
                disabled={!userData.grade}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    userData.grade ? t('selectSector') : t('selectGradeFirst')
                  } />
                </SelectTrigger>
                {userData.grade && (
                  <SearchableSelectContent
                    searchPlaceholder={t('searchSector')}
                    items={availableSectors}
                  />
                )}
              </Select>
              {errors.sector && <p className="text-sm text-red-500 mt-1">{errors.sector}</p>}
            </div>

            <div>
              <Label className="mb-2 block flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                {t('language')}
              </Label>
              <Select 
                value={userData.language} 
                onValueChange={(v) => handleSelectChange('language', v)}
                disabled={!userData.education_system}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    userData.education_system ? t('selectLanguage') : t('selectSystemFirst')
                  } />
                </SelectTrigger>
                {userData.education_system && (
                  <SearchableSelectContent
                    searchPlaceholder={t('searchLanguage')}
                    items={availableLanguages}
                  />
                )}
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
                {userData.governate
                  ? t(`constants.Governates.${userData.governate}`, { defaultValue: userData.governate })
                  : t('notSet')}
              </p>
            </div>
            <div>
              <Label className="mb-2 text-muted-foreground">{t('district')}</Label>
              <p className="font-medium text-foreground">
                {userData.district
                  ? t(`constants.Districts.${userData.district}`, { defaultValue: userData.district })
                  : t('notSet')}
              </p>
            </div>
            <div>
              <Label className="mb-2 text-muted-foreground">{t('educationSystem')}</Label>
              <p className="font-medium text-foreground">
                {userData.education_system
                  ? t(`constants.Education_Systems.${userData.education_system}`, { defaultValue: userData.education_system })
                  : t('notSet')}
              </p>
            </div>
            <div>
              <Label className="mb-2 text-muted-foreground">{t('grade')}</Label>
              <p className="font-medium text-foreground">
                {userData.grade
                  ? t(`constants.EducationStructure.${userData.education_system}.grades.${userData.grade}`, { defaultValue: userData.grade })
                  : t('notSet')}
              </p>
            </div>
            <div>
              <Label className="mb-2 text-muted-foreground">{t('sector')}</Label>
              <p className="font-medium text-foreground">
                {userData.sector
                  ? t(`constants.EducationStructure.${userData.education_system}.sectors.${userData.sector}`, { defaultValue: userData.sector })
                  : t('notSet')}
              </p>
            </div>
            <div>
              <Label className="mb-2 text-muted-foreground">{t('language')}</Label>
              <p className="font-medium text-foreground">
                {userData.language
                  ? (
                    t(`constants.EducationStructure.${userData.education_system}.languages.${userData.language}`, { defaultValue: '' }) ||
                    t(`constants.Languages.${userData.language}`, { defaultValue: userData.language })
                  )
                  : t('notSet')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default StudentProfilePage;
