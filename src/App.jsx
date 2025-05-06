
    import React, { useState, useEffect, createContext, useContext } from 'react';
    import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
    import { AuthProvider } from '@/context/AuthContext'; // Import AuthProvider

    function App() {
      const { i18n } = useTranslation();

      useEffect(() => {
        document.documentElement.dir = i18n.dir();
        document.documentElement.lang = i18n.language;
      }, [i18n, i18n.language]);

      return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <AuthProvider> {/* Wrap with AuthProvider */}
            <WishlistProvider>
              <Router>
                <Layout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/tutor/:id" element={<TutorProfilePage />} />
                    <Route path="/about" element={<AboutUsPage />} />
                    <Route path="/contact" element={<ContactUsPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/profile" element={<StudentProfilePage />} />
                    <Route path="/dashboard/teacher" element={<TeacherDashboardPage />} />
                    {/* Add other routes like terms, privacy etc. here */}
                  </Routes>
                </Layout>
                <Toaster />
              </Router>
            </WishlistProvider>
          </AuthProvider>
        </ThemeProvider>
      );
    }

    export default App;
  