import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Card, CardHeader, CardTitle, CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, User } from 'lucide-react';
import clsx from 'clsx';
import TutorProfileHeader from '@/components/profile/TutorProfileHeader';
import { Save } from 'lucide-react';

const defaultForm = {
  name: 'Ahmed Hassan',
  email: 'info@modaresy.com',
  phone: '01234567890',
  password: '',
  confirmPassword: '',
  location: 'Cairo',
  generalBio: 'Experienced Mathematics tutor with over 8 years...',
};  

const requiredFields = {
  account: ['name', 'email', 'phone'],
  general: ['location', 'generalBio'],
};

const navItems = [
  { id: 'account', label: 'Account & Security' },
  { id: 'general', label: 'General Info' },
  { id: 'subjects', label: 'Subjects' },
  { id: 'videos', label: 'Videos' },
  { id: 'socials', label: 'Social Links' },
  { id: 'groups', label: 'Groups' },
];

const TutorSettingsPage = () => {
  const [tutor, setTutor] = useState({
    id: 1,
    name: "Ahmed Hassan",
    location: "Cairo",
    detailedLocation: ["Dokki, Giza", "elMansoura, Dakahlia"],
    img: "/pfp.png",
    bannerimg: "/52e7d04b4a52a814f1dc8460962e33791c3ad6e04e5074417d2d73dc934fcc_640.jpg",
    phone: "01234567890",
    isTopRated: true,
    GeneralBio: "Experienced Mathematics tutor with over 8 years of teaching high school and university students. Passionate about making complex concepts understandable and helping students build strong problem-solving skills. Proven track record of improving grades and boosting confidence. My approach focuses on identifying individual student needs and tailoring lessons accordingly. I utilize various teaching methods, including visual aids and real-world examples, to ensure comprehension and retention.",
    achievements: [
      { type: 'topRated', label: 'Top Rated', isCurrent: true },
      { type: 'monthlyTop', label: 'Top Tutor - May', isCurrent: true },
      { type: 'studentFav', label: 'Student Favorite', isCurrent: false },
    ],
    socials: {
      facebook: "https://www.facebook.com/ahmed.hassan",
      instagram: "https://www.instagram.com/ahmed.hassan",
      twitter: "https://twitter.com/ahmed_hassan",
      linkedin: "https://www.linkedin.com/in/ahmed-hassan",
      youtube: "https://www.youtube.com/channel/ahmed.hassan",
      tiktok: "https://www.tiktok.com",
      whatsapp: "https://wa.me/01234567890",
      telegram: "https://t.me/ahmed_hassan",
      email: "info@modaresy.com",
      website: "https://www.modaresy.com",
      github: "",
    },
    subjects: [
      {
        subject: "Mathematics",
        grade: "11",
        type: "General - scientific",
        bio: "Experienced Mathematics tutor...",
        duration: 60,
        lecturesPerWeek: 2,
        yearsExp: 8,
        price: 100,
        rating: 4.8,
        private: {
          price: 800,
          note: "Private lessons available...",
        },
        offer: {
          percentage: 20,
          from: "2025-01-01",
          to: "2025-06-30",
          description: "20% off for new students until June 30, 2025",
          for: "private",
        },
        Groups: [
          {
            groupName: "Group A",
            days: ["Monday", "Wednesday"],
            time: "5:00 PM - 6:30 PM",
            isFull: false,
            note: "Available for new students",
          },
          {
            groupName: "Group B",
            days: ["Saturday"],
            time: "2:00 PM - 3:30 PM",
            isFull: true,
          },
        ],
        introVideoUrl: "https://www.youtube.com/embed/tgbNymZ7vqY",
        otherVideos: [
          { id: 'v1a', title: "Solving Quadratic Equations", url: "https://www.youtube.com/embed/tgbNymZ7vqY" },
          { id: 'v1b', title: "Introduction to Calculus", url: "https://www.youtube.com/embed/tgbNymZ7vqY" },
        ],
        comments: [
          { id: 1, user: "Student A", rating: 5, text: "1", date: "2025-04-15" },
          { id: 2, user: "Parent B", rating: 4, text: "Very patient...", date: "2025-03-20" },
          { id: 3, user: "Student C", rating: 5, text: "Highly recommended...", date: "2025-02-10" },
        ],
        courseContent: [
          "Algebra I & II",
          "Geometry",
          "Trigonometry",
          "Pre-Calculus",
          "Calculus I",
          "Exam Preparation (Thanaweya Amma, SAT)"
        ]
      }
    ]
  });
  const [form, setForm] = useState(defaultForm);
    const liveTutor = {
    ...tutor,
    name: form.name,
    email: form.email,
    phone: form.phone,
    location: form.location,
    GeneralBio: form.generalBio,
    };


  
  const [touched, setTouched] = useState({});
  const [selectedSection, setSelectedSection] = useState('account');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    setTouched((prev) => ({ ...prev, [id]: true }));
  };

  const hasUnsavedChanges = (tabId) => {
    return requiredFields[tabId]?.some((key) => touched[key]);
  };

    const hasMissingRequired = (tabId) => {
    return requiredFields[tabId]?.some((key) => touched[key] && !form[key]?.trim());
    };

  const renderNavItem = (item) => {
    const hasChanges = hasUnsavedChanges(item.id);
    const hasErrors = hasMissingRequired(item.id);

    return (
      <Button
        key={item.id}
        variant={selectedSection === item.id ? 'default' : 'ghost'}
        onClick={() => setSelectedSection(item.id)}
        className={clsx(
          'w-full justify-between relative group',
          hasErrors && 'text-red-600'
        )}
      >
        <span>{item.label}</span>
        {hasChanges && !hasErrors && (
          <span className="w-2 h-2 bg-yellow-500 rounded-full absolute right-3 top-2" />
        )}
        {hasErrors && (
          <span className="w-2 h-2 bg-red-600 rounded-full absolute right-3 top-2 animate-ping" />
        )}
      </Button>
    );
  };

      const [isSaving, setIsSaving] = useState(false); // At top of component

const handleSubmit = (e) => {
  e.preventDefault();
  setIsSaving(true);
  // Simulate save delay
  setTimeout(() => {
    setIsSaving(false);
    // Add your save logic here
  }, 2000);
};

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Sidebar Nav */}
      <div className="order-1 lg:order-2 space-y-4 lg:sticky lg:top-24 h-fit">
        <Card className="bg-muted/40 border">
          <CardHeader>
            <CardTitle className="text-lg">Navigation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {navItems.map(renderNavItem)}
          </CardContent>
        </Card>
      </div>

      {/* Section Area */}
      <form className="order-2 lg:order-1 space-y-6" onSubmit={handleSubmit} >
        <h1 className="text-3xl font-bold mb-4">Tutor Settings</h1>

        {selectedSection === 'account' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Account & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={form.name} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" value={form.email} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" value={form.phone} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input id="password" value={form.password} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input id="confirmPassword" value={form.confirmPassword} onChange={handleChange} />
              </div>
            </CardContent>
          </Card>
        )}

        {selectedSection === 'general' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> General Info
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Label htmlFor="location">Location *</Label>
                <Input id="location" value={form.location} onChange={handleChange} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="generalBio">General Bio *</Label>
                <textarea
                  id="generalBio"
                  rows={5}
                  value={form.generalBio}
                  onChange={handleChange}
                  className="w-full border rounded-md p-3 text-sm bg-background text-foreground"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {selectedSection === 'subjects' && (
          <Card>
            <CardHeader><CardTitle>Subjects</CardTitle></CardHeader>
            <CardContent>Subject editing component goes here.</CardContent>
          </Card>
        )}

        {selectedSection === 'videos' && (
          <Card>
            <CardHeader><CardTitle>Videos</CardTitle></CardHeader>
            <CardContent>Video manager component goes here.</CardContent>
          </Card>
        )}

        {selectedSection === 'socials' && (
          <Card>
            <CardHeader><CardTitle>Social Links</CardTitle></CardHeader>
            <CardContent>Social links form goes here.</CardContent>
          </Card>
        )}

        {selectedSection === 'groups' && (
          <Card>
            <CardHeader><CardTitle>Groups</CardTitle></CardHeader>
            <CardContent>Group management UI goes here.</CardContent>
          </Card>
        )}

        {/* preview */}
        {['account', 'general', 'subjects'].includes(selectedSection) && (
        <>
            <h3 className="text-3xl font-bold mb-4">Live Preview</h3>
            <TutorProfileHeader tutor={liveTutor} />
        </>
        )}

        <div className="pt-6 flex justify-start">
            <Button
            type="submit"
            disabled={isSaving}
            className="gap-2 px-6 py-2 text-sm font-semibold transition-colors bg-primary hover:bg-primary/90"
            >
            {isSaving ? (
                <>
                <span className="animate-spin rounded-full border-2 border-white border-t-transparent w-4 h-4" />
                Saving...
                </>
            ) : (
                <>
                <Save className="w-4 h-4" />
                Save Changes
                </>
            )}
            </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default TutorSettingsPage;
