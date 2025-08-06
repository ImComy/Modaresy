import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
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
import i18n from 'i18next';
import TermsPage from './pages/terms';
import PrivacyPage from './pages/privacy';
import Filters from './pages/Filters';
import NotFoundPage from './pages/notfound';
import ForgotPasswordPage from './pages/forgot-password';
import AdminPage from './pages/AdminPage';

// ProtectedRoute component to restrict access based on auth status and user role
const ProtectedRoute = ({ element, requireAuth = false, allowedRoles = null, unsignedOnly = false }) => {
  const { authState } = useAuth();
  const { isLoggedIn, userRole, isLoading } = authState;

  // Wait until auth state is loaded
  if (isLoading) {
    return null; // Or a loading spinner
  }

  // Check for unsigned-only routes (e.g., login, signup, forgot-password)
  if (unsignedOnly && isLoggedIn) {
    console.log(`Unauthorized: ${unsignedOnly} route accessed while logged in`);
    return <NotFoundPage />;
  }

  // Check for authenticated routes
  if (requireAuth && !isLoggedIn) {
    console.log(`Unauthorized: Auth required for route, but user is not logged in`);
    return <NotFoundPage />;
  }

  // Check for role-specific routes
  if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
    console.log(`Unauthorized: User role ${userRole} not allowed for route requiring ${allowedRoles}`);
    return <NotFoundPage />;
  }

  return element;
};

function App() {
  const { i18n } = useTranslation();
  const [isLangReady, setIsLangReady] = useState(false);

  // Initialize language from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('modaresy-lang');
    if (savedLang && i18n.language !== savedLang) {
      i18n.changeLanguage(savedLang).then(() => setIsLangReady(true));
    } else {
      setIsLangReady(true);
    }
  }, [i18n]);

  // Update document direction and language
  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Wait for language initialization
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

  // Check for grade and sector in localStorage
  useEffect(() => {
    const grade = localStorage.getItem('selectedGrade');
    const sector = localStorage.getItem('selectedSector');

    if (grade && sector) {
      setIsReady(true);
    } else {
      setIsReady(true);
    }
  }, []);

  // Determine when to show overlay for unauthenticated users
  useEffect(() => {
    if (!isReady || authState.isLoading) return;

  const shouldShowOverlay = !authState.isLoggedIn && location.pathname == '/filters';

    setShowOverlay(shouldShowOverlay);
  }, [authState.isLoading, authState.isLoggedIn, location.pathname, isReady]);

  // Handle overlay submission
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
        {/* Public routes accessible to all users */}
        <Route path="/" element={<HomePage />} />
        <Route path="/tutor/:id" element={<TutorProfilePage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/Filters" element={<Filters />} />

        {/* Routes restricted to unsigned users */}
        <Route
          path="/login"
          element={<ProtectedRoute element={<LoginPage />} unsignedOnly />}
        />
        <Route
          path="/signup"
          element={<ProtectedRoute element={<SignupPage />} unsignedOnly />}
        />
        <Route
          path="/forgot-password"
          element={<ProtectedRoute element={<ForgotPasswordPage />} unsignedOnly />}
        />

        {/* Routes restricted to signed-in users */}
        <Route
          path="/wishlist"
          element={<ProtectedRoute element={<WishlistPage />} requireAuth />}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute element={<StudentProfilePage />} requireAuth />}
        />

        {/* Routes restricted to specific roles */}
        <Route
          path="/dashboard/teacher"
          element={<ProtectedRoute element={<TeacherDashboardPage />} requireAuth allowedRoles={['Teacher']} />}
        />
        <Route
          path="/admin"
          element={<ProtectedRoute element={<AdminPage />} requireAuth allowedRoles={['admin']} />}
        />

        {/* Catch-all route for invalid paths */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;