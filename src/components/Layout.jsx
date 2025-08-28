import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SignupPromptDialog from '@/components/SignupPromptDialog';
import { getConstants } from '@/api/constantsFetch';
import Loader from '@/components/ui/loader';

const Layout = ({ children }) => {
  const [isSignupPromptOpen, setIsSignupPromptOpen] = useState(false);
  const [hasCheckedPreference, setHasCheckedPreference] = useState(false);
  const [constants, setConstants] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userPreferences, setUserPreferences] = useState({
    education_system: '',
    language: '',
    grade: '',
    sector: ''
  });

  useEffect(() => {
    const loadConstants = async () => {
      try {
        const data = await getConstants();
        setConstants(data);
        setIsLoading(false);
        
        // Check for existing preferences in localStorage
        const savedPrefs = localStorage.getItem('userPreferences');
        if (savedPrefs) {
          const parsedPrefs = JSON.parse(savedPrefs);
          // Initialize with empty strings if properties don't exist
          setUserPreferences({
            education_system: parsedPrefs.education_system || '',
            language: parsedPrefs.language || '',
            grade: parsedPrefs.grade || '',
            sector: parsedPrefs.sector || ''
          });
        }
      } catch (error) {
        console.error('Failed to load constants:', error);
        setIsLoading(false);
      }
    };
    loadConstants();
  }, []);

  useEffect(() => {
    if (!isLoading && !hasCheckedPreference && constants) {
      const preferenceSet = localStorage.getItem('userPreferences');
      console.log("Checking preferences:", preferenceSet);

      if (!preferenceSet) {
        const timer = setTimeout(() => {
          console.log("Opening signup prompt dialog");
          setIsSignupPromptOpen(true);
        }, 1500);

        setHasCheckedPreference(true);
        return () => clearTimeout(timer);
      } else {
        setHasCheckedPreference(true);
      }
    }
  }, [hasCheckedPreference, isLoading, constants]);

  const handlePreferenceSet = (prefs) => {
    console.log("Preferences set:", prefs);
    const fullPreferences = {
      education_system: prefs.education_system || '',
      language: prefs.language || '',
      grade: prefs.grade || '',
      sector: prefs.sector || ''
    };
    setUserPreferences(fullPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(fullPreferences));
    setIsSignupPromptOpen(false);
  };

  const handleDialogClose = (openState) => {
    if (!openState) {
      setIsSignupPromptOpen(false);
      if (!localStorage.getItem('userPreferences')) {
        setHasCheckedPreference(true);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
      <Footer />
      {constants && (
        <SignupPromptDialog
          open={isSignupPromptOpen}
          onOpenChange={handleDialogClose}
          onPreferenceSet={handlePreferenceSet}
          constants={constants}
          initialValues={userPreferences}
        />
      )}
    </div>
  );
};

export default Layout;