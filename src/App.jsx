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
import i18n from 'i18next';
import TermsPage from './pages/terms';
import PrivacyPage from './pages/privacy';
import Filters from './pages/Filters';
import NotFoundPage from './pages/notfound';
import TutorSettingsPage from './pages/TutorSettingsPage';

function App() {
  const { i18n } = useTranslation();
  const [isLangReady, setIsLangReady] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('modaresy-lang');
    if (savedLang && i18n.language !== savedLang) {
      i18n.changeLanguage(savedLang).then(() => setIsLangReady(true));
    } else {
      setIsLangReady(true);
    }
  }, [i18n]);

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  if (!isLangReady) return null;

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
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const shouldShowOverlay = !authState.isLoggedIn &&
      !['/login', '/signup'].includes(location.pathname) &&
      (!localStorage.getItem('onSubmit') || localStorage.getItem('onSubmit') !== 'true') &&
      !['/wishlist', '/profile', '/dashboard/teacher'].includes(location.pathname);

    setShowOverlay(shouldShowOverlay);
  }, [authState.isLoggedIn, location.pathname, isReady]);

  // This now accepts the selectedGrade and selectedSector from UserOverlay onSubmit
  function handleSubmit(selectedGrade, selectedSector) {
    if (selectedGrade && selectedSector) {
      localStorage.setItem('onSubmit', 'true');
      localStorage.setItem('selectedGrade', selectedGrade);
      localStorage.setItem('selectedSector', selectedSector);
      window.location.reload(); 
      setShowOverlay(false);
    }
  }

  const handleOverlayClose = () => {
    setShowOverlay(false);
  };

  return (
    <>
      {!authState.isLoading && showOverlay && (
        <UserOverlay
          onSubmit={handleSubmit}
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
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path='/Filters' element={<Filters />} />
        <Route path="/settings/teacher" element={<TutorSettingsPage />} />
        {/* Add more routes as needed */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
