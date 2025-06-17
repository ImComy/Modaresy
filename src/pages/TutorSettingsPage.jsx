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
import { User, Settings, BookOpen, Share2 } from 'lucide-react';

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
  { id: 'account', label: 'Account', icon: <User className="w-4 h-4" /> },
  { id: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
  { id: 'subjects', label: 'Subjects', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'socials', label: 'Socials', icon: <Share2 className="w-4 h-4" /> },
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
        yearsExp: 8,
      },
    ],
  });

  const [form, setForm] = useState(defaultForm);
  const [subjects, setSubjects] = useState([]);
  const [socialLinks, setSocialLinks] = useState(tutor.socials || {});
  const [touched, setTouched] = useState({});
  const [selectedSection, setSelectedSection] = useState('account');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSubjects(tutor.subjects || []);
    setSocialLinks(tutor.socials || {});
  }, [tutor]);

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

  const handleSocialChange = (platform, value) => {
    setSocialLinks((prev) => ({
      ...prev,
      [platform]: value,
    }));
    setTouched((prev) => ({ ...prev, socials: true }));
  };

  const handleAddDetailedLocation = () => {
    if (form.detailedLocation.length < 3) {
      setForm((prev) => ({
        ...prev,
        detailedLocation: [...prev.detailedLocation, ''],
      }));
      setTouched((prev) => ({ ...prev, detailedLocation: true }));
    }
  };

  const handleRemoveDetailedLocation = (index) => {
    setForm((prev) => ({
      ...prev,
      detailedLocation: prev.detailedLocation.filter((_, i) => i !== index),
    }));
    setTouched((prev) => ({ ...prev, detailedLocation: true }));
  };

  const handleDetailedLocationChange = (index, value) => {
    const updated = [...form.detailedLocation];
    updated[index] = value;
    setForm((prev) => ({
      ...prev,
      detailedLocation: updated,
    }));
    setTouched((prev) => ({ ...prev, detailedLocation: true }));
  };

  const hasUnsavedChanges = (tabId) => {
    if (tabId === 'subjects') {
      const initialSubjects = tutor.subjects || [];
      const currentSubjects = subjects || [];
      if (initialSubjects.length !== currentSubjects.length) return true;
      return initialSubjects.some((initial, i) => {
        const current = currentSubjects[i] || {};
        // Normalize values to handle undefined/null and ensure accurate comparison
        const normalize = (val) => (val == null ? '' : String(val).trim());
        return (
          normalize(initial.subject) !== normalize(current.subject) ||
          normalize(initial.grade) !== normalize(current.grade) ||
          normalize(initial.type) !== normalize(current.type) ||
          normalize(initial.bio) !== normalize(current.bio) ||
          normalize(initial.yearsExp) !== normalize(current.yearsExp)
        );
      });
    } else if (tabId === 'socials') {
      const initialSocials = tutor.socials || {};
      const currentSocials = socialLinks || {};
      const normalize = (val) => (val == null ? '' : String(val).trim());
      return (
        normalize(initialSocials.youtube) !== normalize(currentSocials.youtube) ||
        normalize(initialSocials.twitter) !== normalize(currentSocials.twitter) ||
        normalize(initialSocials.facebook) !== normalize(currentSocials.facebook) ||
        normalize(initialSocials.linkedin) !== normalize(currentSocials.linkedin) ||
        normalize(initialSocials.instagram) !== normalize(currentSocials.instagram)
      );
    }

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
          original.some((val, i) => val.trim() !== (current[i] || '').trim())
        );
      }
      return original !== current;
    });
  };

  const isMissing = (val) => typeof val !== 'string' || val.trim() === '' || val == null;

  const hasMissingRequired = (tabId) => {
    if (tabId === 'subjects') {
      if (subjects.length === 0) return true;
      const firstSubject = subjects[0] || {};
      return (
        isMissing(firstSubject.subject) ||
        isMissing(firstSubject.grade) ||
        isMissing(firstSubject.type) ||
        isMissing(firstSubject.bio) ||
        isMissing(firstSubject.yearsExp)
      );
    }

    if (tabId === 'socials') {
      return (
        isMissing(socialLinks.youtube) &&
        isMissing(socialLinks.twitter) &&
        isMissing(socialLinks.facebook) &&
        isMissing(socialLinks.linkedin) &&
        isMissing(socialLinks.instagram)
      );
    }

    return requiredFields[tabId]?.some((key) => {
      const value = form[key];
      if (key === 'detailedLocation') {
        return !Array.isArray(value) || value.some((loc) => isMissing(loc));
      }
      return isMissing(value);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentRequired = requiredFields[selectedSection] || [];
    let invalid = false;

    const updatedTouched = { ...touched };
    currentRequired.forEach((field) => {
      updatedTouched[field] = true;
      if (field === 'detailedLocation') {
        if (!form.detailedLocation?.length || form.detailedLocation.some((loc) => !loc.trim())) {
          invalid = true;
        }
      } else if (!form[field]?.trim()) {
        invalid = true;
      }
    });

    if (selectedSection === 'subjects') {
      if (subjects.length === 0) {
        invalid = true;
      } else {
        const firstSubject = subjects[0] || {};
        if (
          isMissing(firstSubject.subject) ||
          isMissing(firstSubject.grade) ||
          isMissing(firstSubject.type) ||
          isMissing(firstSubject.bio) ||
          isMissing(firstSubject.yearsExp)
        ) {
          invalid = true;
        }
      }
      updatedTouched.subjects = true;
    }

    setTouched(updatedTouched);
    if (invalid) return;

    setIsSaving(true);
    setTimeout(() => {
      setTutor((prev) => ({
        ...prev,
        ...form,
        subjects: subjects,
        socials: socialLinks,
      }));
      setIsSaving(false);
    }, 2000);
  };

  const getFieldErrorClasses = (field) => {
    const value = form[field];
    const isEmpty =
      touched[field] &&
      (typeof value === 'string'
        ? !value.trim()
        : Array.isArray(value)
        ? value.length === 0 || value.every((v) => !v.trim?.())
        : !value);

    return {
      label: isEmpty ? 'text-red-600' : '',
      input: isEmpty ? 'border-red-500' : '',
    };
  };

  return (
    <>
      {/* Horizontal Floating Nav Bar */}
      <div className="sticky top-20 z-30">
        <div className="max-w-xl mx-auto px-4">
          <NavigationCard
            navItems={navItems}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            hasUnsavedChanges={hasUnsavedChanges}
            hasMissingRequired={hasMissingRequired}
          />
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        className="max-w-7xl mx-auto px-4 py-10 felx flex-row gap-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          <h1 className="text-3xl font-bold mb-4">Tutor Settings</h1>

          {selectedSection === 'account' && (
            <AccountSection
              form={form}
              handleChange={handleChange}
              getFieldErrorClasses={getFieldErrorClasses}
            />
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
          {selectedSection === 'subjects' && (
            <SubjectsSection
              subjects={subjects}
              onChange={setSubjects}
              errors={subjects.map((subj, idx) =>
                idx === 0
                  ? {
                      subject: touched.subjects && isMissing(subj.subject),
                      grade: touched.subjects && isMissing(subj.grade),
                      type: touched.subjects && isMissing(subj.type),
                      bio: touched.subjects && isMissing(subj.bio),
                      yearsExp: touched.subjects && isMissing(subj.yearsExp),
                    }
                  : {}
              )}
            />
          )}
          {selectedSection === 'socials' && (
            <SocialsSection
              socialLinks={socialLinks}
              onSocialChange={handleSocialChange}
              getFieldErrorClasses={getFieldErrorClasses}
              touched={touched}
              setTouched={setTouched}
            />
          )}

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

        {/* Optional Sidebar Placeholder */}
        <div className="order-1 lg:order-2" />
      </motion.div>
    </>
  );
};

export default TutorSettingsPage;