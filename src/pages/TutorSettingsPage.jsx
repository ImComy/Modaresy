import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import NavigationCard from '@/components/tutorSettings/nav';
import AccountSection from '@/components/tutorSettings/account';
import GeneralSection from '@/components/tutorSettings/general';
import SubjectsSection from '@/components/tutorSettings/subjects';
import SocialsSection from '@/components/tutorSettings/social';
import TutorProfileHeader from '@/components/profile/TutorProfileHeader';
import { Button } from '@/components/ui/button';
import { User, Settings, BookOpen, Share2 } from 'lucide-react';
import SaveButton from '@/components/ui/save';
import { useTranslation } from 'react-i18next';

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

const navItems = [
  { id: 'account', labelKey: 'nav.account', defaultLabel: 'Account', icon: <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /> },
  { id: 'general', labelKey: 'nav.general', defaultLabel: 'General', icon: <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /> },
  { id: 'subjects', labelKey: 'nav.subjects', defaultLabel: 'Subjects', icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /> },
  { id: 'socials', labelKey: 'nav.socials', defaultLabel: 'Socials', icon: <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /> },
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
    },
    youtubeVideos: [],
    subjects: [
      {
        subject: "Mathematics",
        grade: "11",
        type: "General - scientific",
        bio: "Experienced Mathematics tutor...",
        yearsExp: 8,
      },
    ],
  });

  const [form, setForm] = useState(defaultForm);
  const [subjects, setSubjects] = useState(tutor.subjects || []);
  const [socialLinks, setSocialLinks] = useState(tutor.socials || {});
  const [youtubeVideos, setYoutubeVideos] = useState(tutor.youtubeVideos || []);
  const [selectedSection, setSelectedSection] = useState('account');
  const [isSaving, setIsSaving] = useState(false);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    if (initialLoadRef.current) {
      setSubjects(tutor.subjects || []);
      setSocialLinks(tutor.socials || {});
      setYoutubeVideos(tutor.youtubeVideos || []);
      initialLoadRef.current = false;
    }
  }, []); 

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
    youtubeVideos: youtubeVideos,
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setTimeout(() => {
      setTutor((prev) => ({
        ...prev,
        ...form,
        subjects: subjects,
        socials: socialLinks,
        youtubeVideos: youtubeVideos,
      }));
      setIsSaving(false);
    }, 1000); // Reduced delay for better UX
  };

  const handleVideoChange = (index, field, value) => {
    setYoutubeVideos((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddVideo = () => {
    setYoutubeVideos((prev) => [...prev, { url: '', title: '' }]);
  };

  const handleRemoveVideo = (index) => {
    setYoutubeVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const { t } = useTranslation();

  return (
    <>
      <div className="sticky top-20 z-30">
        <div className="max-w-xl mx-auto px-4">
          <NavigationCard
            navItems={navItems}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>

      <motion.div
        className="max-w-7xl mx-auto py-10 flex flex-col gap-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <form className="space-y-6" onSubmit={handleSubmit}>

          {selectedSection === 'account' && (
            <AccountSection form={form} setForm={setForm} />
          )}

          {selectedSection === 'general' && (
            <GeneralSection form={form} setForm={setForm} defaultForm={defaultForm} />
          )}

          {selectedSection === 'subjects' && (
            <SubjectsSection subjects={subjects} onChange={setSubjects} />
          )}

          {selectedSection === 'socials' && (
            <SocialsSection
              socialLinks={socialLinks}
              setSocialLinks={setSocialLinks}
              youtubeVideos={youtubeVideos}
              onVideoChange={handleVideoChange}
              onAddVideo={handleAddVideo}
              onRemoveVideo={handleRemoveVideo}
            />
          )}

          <div className="flex justify-end mt-6">
            <SaveButton isLoading={isSaving} className="w-full max-w-xs" />
          </div>
        </form>
      </motion.div>
    </>
  );
};

export default TutorSettingsPage;
