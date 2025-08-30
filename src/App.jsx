import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
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
import { AuthProvider, useAuth } from '@/context/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import UserOverlay from './components/ui/overlay';
import TermsPage from './pages/terms';
import PrivacyPage from './pages/privacy';
import Filters from './pages/Filters';
import NotFoundPage from './pages/notfound';
import ForgotPasswordPage from './pages/forgot-password';
import AdminPage from './pages/AdminPage';
import ChatPage from './pages/chat';
import ModaresyCommunityPage from './pages/community'

const ProtectedRoute = ({ element, requireAuth = false, allowedRoles = null, unsignedOnly = false }) => {
  const { authState } = useAuth();
  const { isLoggedIn, userRole, isLoading } = authState;

  if (isLoading) return null;
  if (unsignedOnly && isLoggedIn) return <NotFoundPage />;
  if (requireAuth && !isLoggedIn) return <NotFoundPage />;
  if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) return <NotFoundPage />;

  return element;
};

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
  const navigate = useNavigate();

  useEffect(() => {
    const grade = localStorage.getItem('selectedGrade');
    const sector = localStorage.getItem('selectedSector');
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || authState.isLoading) return;
    const path = (location.pathname || '').toLowerCase();
    const suppressed = localStorage.getItem('onSubmit') === 'true' || localStorage.getItem('onSubmit') === true;
    const shouldShowOverlay = !authState.isLoggedIn && path.startsWith('/filters') && !suppressed;
    setShowOverlay(shouldShowOverlay);
  }, [authState.isLoading, authState.isLoggedIn, location.pathname, isReady]);

  function handleSubmit(preferences) {
    if (!preferences) return;
    const { grade, sector, education_system, language } = preferences;

    if (education_system) localStorage.setItem('selectedEducationSystem', education_system);
    if (language) localStorage.setItem('selectedLanguage', language);
    if (grade) localStorage.setItem('selectedGrade', grade);
    if (sector) localStorage.setItem('selectedSector', sector);
    try { localStorage.setItem('userPreferences', JSON.stringify(preferences)); } catch (e) { /* ignore */ }

    localStorage.setItem('onSubmit', 'true');
    setShowOverlay(false);

    if (location.pathname === '/Filters') {
      window.location.reload();
    } else {
      navigate('/Filters');
    }
  }

  const handleOverlayClose = () => setShowOverlay(false);

  return (
    <>
      {!authState.isLoading && showOverlay && (
        <UserOverlay onSubmit={handleSubmit} onClose={handleOverlayClose} />
      )}

      <Routes key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tutor/:tutorId" element={<TutorProfilePage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/Filters" element={<Filters />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/community" element={<ModaresyCommunityPage />} />

        <Route path="/login" element={<ProtectedRoute element={<LoginPage />} unsignedOnly />} />
        <Route path="/signup" element={<ProtectedRoute element={<SignupPage />} unsignedOnly />} />
        <Route path="/forgot-password" element={<ProtectedRoute element={<ForgotPasswordPage />} unsignedOnly />} />

        <Route path="/wishlist" element={<ProtectedRoute element={<WishlistPage />} requireAuth />} />
        <Route path="/profile" element={<ProtectedRoute element={<StudentProfilePage />} requireAuth />} />

        <Route path="/dashboard/teacher" element={<ProtectedRoute element={<TeacherDashboardPage />} requireAuth allowedRoles={["Teacher"]} />} />
        <Route path="/admin" element={<ProtectedRoute element={<AdminPage />} requireAuth allowedRoles={["admin"]} />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
