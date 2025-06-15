import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import NavigationCard from '@/components/tutorSettings/nav';
import AccountSection from '@/components/tutorSettings/account';
import GeneralSection from '@/components/tutorSettings/general';
import SubjectsSection from '@/components/tutorSettings/subjects';
import SocialsSection from '@/components/tutorSettings/social';
import TutorProfileHeader from '@/components/profile/TutorProfileHeader';
import { Button } from '@/components/ui/button';

const defaultForm = {
  name: 'Ahmed Hassan',
  email: 'info@modaresy.com',
  phone: '01234567890',
  password: '',
  confirmPassword: '',
  location: 'Cairo',
  generalBio: "Experienced Mathematics tutor with over 8 years of teaching high school and university students. Passionate about making complex concepts understandable and helping students build strong problem-solving skills. Proven track record of improving grades and boosting confidence. My approach focuses on identifying individual student needs and tailoring lessons accordingly. I utilize various teaching methods, including visual aids and real-world examples, to ensure comprehension and retention.",
  detailedLocation: ['Dokki, Giza', 'elMansoura, Dakahlia'],
  img: "/pfp.png",
  bannerimg: "/52e7d04b4a52a814f1dc8460962e33791c3ad6e04e5074417d2d73dc934fcc_640.jpg",
};

const requiredFields = {
  account: ['name', 'email', 'phone'],
  general: ['location', 'generalBio', 'detailedLocation'],
};
const optionalFields = {
  account: ['password', 'confirmPassword'],
  general: ['img', 'bannerimg'],
};

const navItems = [
  { id: 'account', label: 'Account & Security' },
  { id: 'general', label: 'General Info' },
  { id: 'subjects', label: 'Subjects' },
  { id: 'socials', label: 'Social Links' },
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
const [subjects, setSubjects] = useState([]);

useEffect(() => {
  setSubjects(tutor.subjects || []);
}, [tutor]);
  const [form, setForm] = useState(defaultForm);
  const [touched, setTouched] = useState({});
  const [selectedSection, setSelectedSection] = useState('account');
  const [isSaving, setIsSaving] = useState(false);


  const liveTutor = {
    ...tutor,
    name: form.name,
    email: form.email,
    phone: form.phone,
    location: form.location,
    GeneralBio: form.generalBio,
    detailedLocation: form.detailedLocation || [],
    img: form.pfp || form.img,
    bannerimg: form.banner || form.bannerimg,
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    setTouched((prev) => ({ ...prev, [id]: true }));
  };

const hasUnsavedChanges = (tabId) => {
  const required = requiredFields[tabId] || [];
  const optional = optionalFields[tabId] || [];
  const keys = [...required, ...optional];

  return keys.some((key) => {
    const original = defaultForm[key];
    const current = form[key];

    if (typeof original === 'string' && typeof current === 'string') {
      return original.trim() !== current.trim();
    }

    if (Array.isArray(original) && Array.isArray(current)) {
      return (
        original.length !== current.length ||
        original.some((val, i) => val.trim() !== current[i]?.trim())
      );
    }

    return original !== current;
  });
};

const hasMissingRequired = (tabId) => {
  return requiredFields[tabId]?.some((key) => {
    const value = form[key];
    if (key === 'detailedLocation') {
      return !value?.length || value.some((loc) => !loc?.trim());
    }
    return !value?.trim();
  });
};

const handleSubmit = (e) => {
  e.preventDefault();

  const currentRequired = requiredFields[selectedSection];
  let invalid = false;

  const updatedTouched = { ...touched };
  currentRequired?.forEach((field) => {
    updatedTouched[field] = true;

    if (field === 'detailedLocation') {
      if (!form.detailedLocation?.length || form.detailedLocation.some((loc) => !loc.trim())) {
        invalid = true;
      }
    } else if (!form[field]?.trim()) {
      invalid = true;
    }
  });

  setTouched(updatedTouched);

  if (invalid) return; // block submit

  setIsSaving(true);
  setTimeout(() => {
    setIsSaving(false);
    // Perform save
  }, 2000);
};


const getFieldErrorClasses = (field) => {
  const value = form[field];
  const isEmpty =
    touched[field] &&
    (
      typeof value === 'string'
        ? !value.trim()
        : Array.isArray(value)
        ? value.length === 0 || value.every((v) => !v.trim?.())
        : !value
    );

  return {
    label: isEmpty ? 'text-red-600' : '',
    input: isEmpty ? 'border-red-500' : '',
  };
};


const handleAddDetailedLocation = () => {
  if (form.detailedLocation.length < 3) {
    setForm((prev) => ({
      ...prev,
      detailedLocation: [...prev.detailedLocation, ''],
    }));
    setTouched((prev) => ({ ...prev, detailedLocation: true })); // ✅
  }
};

const handleRemoveDetailedLocation = (index) => {
  setForm((prev) => ({
    ...prev,
    detailedLocation: prev.detailedLocation.filter((_, i) => i !== index),
  }));
  setTouched((prev) => ({ ...prev, detailedLocation: true })); // ✅
};

const handleDetailedLocationChange = (index, value) => {
  const updated = [...form.detailedLocation];
  updated[index] = value;
  setForm((prev) => ({
    ...prev,
    detailedLocation: updated,
  }));
  setTouched((prev) => ({ ...prev, detailedLocation: true })); // ✅ mark as touched
};


  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <NavigationCard
        navItems={navItems}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        hasUnsavedChanges={hasUnsavedChanges}
        hasMissingRequired={hasMissingRequired}
      />
      <form className="order-2 lg:order-1 space-y-6" onSubmit={handleSubmit}>
        <h1 className="text-3xl font-bold mb-4">Tutor Settings</h1>
        {selectedSection === 'account' && (
          <AccountSection form={form} handleChange={handleChange} getFieldErrorClasses={getFieldErrorClasses} />
        )}
        {selectedSection === 'general' && (
          <GeneralSection
            form={form}
            handleChange={handleChange}
            getFieldErrorClasses={getFieldErrorClasses}
            handleAddDetailedLocation={handleAddDetailedLocation}
            handleDetailedLocationChange={handleDetailedLocationChange}
            handleRemoveDetailedLocation={handleRemoveDetailedLocation}
            touched={touched} 
            setForm={setForm}
            defaultForm={defaultForm} 
          />
        )}
        {selectedSection === 'subjects' && <SubjectsSection subjects={subjects} onChange={setSubjects} />}
        {selectedSection === 'socials' && <SocialsSection />}
        {['account', 'general'].includes(selectedSection) && (
            <>
          <h3 className="text-xl font-bold mt-20">Live Tutor Profile</h3>
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