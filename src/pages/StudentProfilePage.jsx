import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { grades, sectors } from '@/data/formData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Mail, Phone, MapPin, User, Lock, GraduationCap, Layers } from 'lucide-react';

const initialUserData = {
  name: 'Student User',
  email: 'student@example.com',
  phone: '',
  password: '',
  confirmPassword: '',
  location: '',
  grade: 'secondary-2',
  sector: 'scientific',
};

const StudentProfilePage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [userData, setUserData] = useState(initialUserData);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setUserData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!userData.name.trim()) newErrors.name = 'Required';
    if (!userData.email.includes('@')) newErrors.email = 'Invalid email';
    if (!userData.phone.trim()) newErrors.phone = 'Required';
    if (!userData.password || userData.password.length < 6) newErrors.password = 'Too short';
    if (userData.password !== userData.confirmPassword) newErrors.confirmPassword = 'Does not match';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    toast({
      title: 'Settings saved',
      description: 'Your changes have been successfully saved.',
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
        <h1 className="text-3xl font-bold mb-4">{t('settings') || 'Settings'}</h1>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> {t('accountInfo')}</CardTitle>
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
            <div className="relative">
              <Label htmlFor="location">{t('location')}</Label>
              <MapPin className="absolute left-3 top-9 w-4 h-4 text-muted-foreground" />
              <Input id="location" value={userData.location} onChange={handleInputChange} className="pl-10" />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-primary" /> {t('security')}</CardTitle>
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
            <CardTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5 text-primary" /> {t('education')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>{t('grade')}</Label>
              <Select value={userData.grade} onValueChange={(v) => handleSelectChange('grade', v)}>
                <SelectTrigger><SelectValue placeholder={t('selectGrade')} /></SelectTrigger>
                <SelectContent>
                  {grades.map(g => <SelectItem key={g.value} value={g.value}>{t(g.labelKey)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('sector')}</Label>
              <Select value={userData.sector} onValueChange={(v) => handleSelectChange('sector', v)}>
                <SelectTrigger><SelectValue placeholder={t('selectSector')} /></SelectTrigger>
                <SelectContent>
                  {sectors.map(s => <SelectItem key={s.value} value={s.value}>{t(s.labelKey)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="pt-4">
          <Button type="submit" className="w-full md:w-auto">{t('saveChanges') || 'Save Changes'}</Button>
        </div>
      </form>

      {/* Current Info Summary */}
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
              <p className="font-medium text-foreground">{t(grades.find((g) => g.value === userData.grade)?.labelKey)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('sector')}</Label>
              <p className="font-medium text-foreground">{t(sectors.find((s) => s.value === userData.sector)?.labelKey)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default StudentProfilePage;
