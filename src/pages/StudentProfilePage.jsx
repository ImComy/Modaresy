import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { User, Mail, MapPin, GraduationCap, Users as UsersIcon } from 'lucide-react'; // Added icons
import { grades, sectors } from '@/data/formData'; // Import grade/sector data

// Mock user data - replace with actual data fetching
const initialUserData = {
  name: 'Student User',
  email: 'student@example.com',
  location: 'Cairo',
  grade: 'secondary-2', // Added grade
  sector: 'scientific', // Added sector
  avatar: '/placeholder-avatar.jpg'
};

const StudentProfilePage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [userData, setUserData] = useState(initialUserData);
  const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode (optional)

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setUserData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (name, value) => {
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // Add actual update logic here (e.g., API call)
    console.log('Updating profile:', userData);
    toast({
      title: t('profileUpdated'),
      description: t('profileUpdateSuccess'), // Changed key
    });
    setIsEditing(false); // Optionally exit edit mode after saving
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <section className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('studentProfileTitle')}</h1>
        <p className="text-muted-foreground">{t('studentProfileDesc')}</p>
      </section>

      <Card className="shadow-lg glass-effect">
        <CardHeader className="items-center">
          <Avatar className="w-24 h-24 border-4 border-primary mb-4 shadow-md">
            <AvatarImage src={userData.avatar} alt={userData.name} />
            <AvatarFallback className="text-3xl">{userData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <CardTitle>{userData.name}</CardTitle>
          <CardDescription>{userData.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2"><User size={16}/> {t('name')}</Label>
              <Input id="name" type="text" value={userData.name} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2"><Mail size={16}/> {t('email')}</Label>
              <Input id="email" type="email" value={userData.email} onChange={handleInputChange} required readOnly />
              <p className="text-xs text-muted-foreground">{t('emailChangeNote')}</p> {/* Add translation */}
            </div>
              <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2"><MapPin size={16}/> {t('location')}</Label>
              <Input id="location" type="text" value={userData.location} onChange={handleInputChange} placeholder={t('locationPlaceholder')} />
            </div>
              <div className="space-y-2">
                <Label htmlFor="grade" className="flex items-center gap-2"><GraduationCap size={16}/> {t('grade')}</Label>
                <Select name="grade" value={userData.grade} onValueChange={(value) => handleSelectChange('grade', value)}>
                  <SelectTrigger id="grade"><SelectValue placeholder={t('selectGrade')} /></SelectTrigger>
                  <SelectContent>{grades.map(grade => (<SelectItem key={grade.value} value={grade.value}>{t(grade.labelKey)}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sector" className="flex items-center gap-2"><UsersIcon size={16}/> {t('sector')}</Label>
                <Select name="sector" value={userData.sector} onValueChange={(value) => handleSelectChange('sector', value)}>
                  <SelectTrigger id="sector"><SelectValue placeholder={t('selectSector')} /></SelectTrigger>
                  <SelectContent>{sectors.map(sector => (<SelectItem key={sector.value} value={sector.value}>{t(sector.labelKey)}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              {/* Add password change fields if needed */}
              <Button type="submit" className="w-full">{t('updateProfile')}</Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StudentProfilePage;
