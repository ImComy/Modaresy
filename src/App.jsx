import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import TutorProfilePage from '@/pages/TutorProfilePage';
import AboutUsPage from '@/pages/AboutUsPage';
import ContactUsPage from '@/pages/ContactUsPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import TeacherDashboardPage from '@/pages/TeacherDashboardPage';
import WishlistPage from '@/pages/WishlistPage';
import StudentProfilePage from '@/pages/StudentProfilePage';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ThemeProvider';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import UserOverlay from './components/ui/overlay';
import { useAuth } from './context/AuthContext';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <WishlistProvider>
          <Router>
            <ScrollToTop />
            <Layout>
              <RoutesWrapper />
            </Layout>
            <Toaster />
          </Router>
        </WishlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
function RoutesWrapper() {
  const { authState } = useAuth();
  const location = useLocation();
  const [showOverlay, setShowOverlay] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const grade = localStorage.getItem('selectedGrade');
    const sector = localStorage.getItem('selectedSector');

    if (grade && sector) {
      setIsReady(true);
    } else {
      // maybe wait for user to select later
      setIsReady(true); // or false, depending on logic
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const shouldShowOverlay = !authState.isLoggedIn &&
      !['/login', '/signup'].includes(location.pathname) &&
      (!localStorage.getItem('selectedGrade') || !localStorage.getItem('selectedSector'));

    setShowOverlay(shouldShowOverlay);
  }, [authState.isLoggedIn, location.pathname, isReady]);


  const gradeOptions = [
    { value: '10', label: 'Grade 10' },
    { value: '11', label: 'Grade 11' },
    { value: '12', label: 'Grade 12' },
  ];

  const sectorOptions = [
    { value: 'science', label: 'Science' },
    { value: 'literature', label: 'Literature' },
  ];

  const handleOverlaySubmit = (data) => {
    console.log('Overlay submitted:', data);
    setShowOverlay(false);
  };

  const handleOverlayClose = () => {
    setShowOverlay(false);
  };

  return (
    <>
      {!authState.isLoading && showOverlay && (
        <UserOverlay
          gradeOptions={gradeOptions}
          sectorOptions={sectorOptions}
          onSubmit={handleOverlaySubmit}
          onClose={handleOverlayClose}
        />
      )}
      <Routes key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tutor/:id" element={<TutorProfilePage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/profile" element={<StudentProfilePage />} />
        <Route path="/dashboard/teacher" element={<TeacherDashboardPage />} />
      </Routes>
    </>
  );
}



export default App;
