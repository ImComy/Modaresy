import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { grades, sectors } from '@/data/formData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, MapPin, User, Lock, GraduationCap } from 'lucide-react';
import { SearchableSelectContent } from '@/components/ui/searchSelect';
import SaveButton from "@/components/ui/save"


const StudentProfilePage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const initialUserData = {
    name: t("Student User"),
    email: 'student@example.com',
    phone: '',
    password: '',
    confirmPassword: '',
    location: '',
    grade: 'secondary-2',
    sector: 'scientific',
  };

  const [userData, setUserData] = useState(initialUserData);
  const [errors, setErrors] = useState({});

  const cities = ['Cairo', 'Giza', 'Alexandria', 'Aswan', 'Luxor'];

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setUserData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!userData.name.trim()) newErrors.name = t('errorRequired');
    if (!userData.email.includes('@')) newErrors.email = t('errorInvalidEmail');
    if (!userData.phone.trim()) newErrors.phone = t('errorRequired');
    if (!userData.password || userData.password.length < 6) newErrors.password = t('errorPasswordShort');
    if (userData.password !== userData.confirmPassword) newErrors.confirmPassword = t('errorPasswordMismatch');
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    toast({
      title: t('toastTitleSaved'),
      description: t('toastDescSaved'),
    });
  };

  return (
    <motion.div
      className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
        <h1 className="text-3xl font-bold mb-4">{t('settingss')}</h1>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> {t('accountInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">{t('name')}</Label>
              <Input id="name" value={userData.name} onChange={handleInputChange} />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div className="relative">
              <Label htmlFor="email">{t('email')}</Label>
              <Mail className="absolute left-3 top-9 w-4 h-4 text-muted-foreground" />
              <Input id="email" type="email" value={userData.email} onChange={handleInputChange} className="pl-10" />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div className="relative">
              <Label htmlFor="phone">{t('phone')}</Label>
              <Phone className="absolute left-3 top-9 w-4 h-4 text-muted-foreground" />
              <Input id="phone" value={userData.phone} onChange={handleInputChange} className="pl-10" />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
            </div>
            <div className="relative flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="location">{t('location')}</Label>
                <MapPin className="w-4 h-4 text-muted-foreground" />
              </div>
              <Select value={userData.location} onValueChange={(v) => handleSelectChange('location', v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectCity')} />
                </SelectTrigger>
                <SearchableSelectContent
                  searchPlaceholder={t('searchLocation')}
                  items={cities.map((city) => ({ value: city, label: city }))}
                />
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> {t('security')}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="password">{t('newPassword')}</Label>
              <Input id="password" type="password" value={userData.password} onChange={handleInputChange} />
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
            </div>
            <div>
              <Label htmlFor="confirmPassword">{t('repeatPassword')}</Label>
              <Input id="confirmPassword" type="password" value={userData.confirmPassword} onChange={handleInputChange} />
              {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" /> {t('education')}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>{t('grade')}</Label>
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
            </div>
            <div>
              <Label>{t('sector')}</Label>
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
            </div>
          </CardContent>
        </Card>

        <div className="pt-4">
          <SaveButton />
        </div>
      </form>

      {/* Info Summary */}
      <div className="space-y-4">
        <Card className="bg-muted/40 border sticky top-24">
          <CardHeader>
            <CardTitle>{t('accountDetails')}</CardTitle>
            <CardDescription>{t('viewOnlyInfo')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 grid-cols-1">
            <div>
              <Label className="text-muted-foreground">{t('name')}</Label>
              <p className="font-medium text-foreground">{userData.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('email')}</Label>
              <p className="font-medium text-foreground">{userData.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('location')}</Label>
              <p className="font-medium text-foreground">{userData.location}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('grade')}</Label>
              <p className="font-medium text-foreground">
                {t(grades.find((g) => g.value === userData.grade)?.labelKey)}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('sector')}</Label>
              <p className="font-medium text-foreground">
                {t(sectors.find((s) => s.value === userData.sector)?.labelKey)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default StudentProfilePage;
