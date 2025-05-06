
    import React, { useState, useEffect } from 'react';
    import Navbar from '@/components/Navbar';
    import Footer from '@/components/Footer';
    import SignupPromptDialog from '@/components/SignupPromptDialog';

    const Layout = ({ children }) => {
      const [isSignupPromptOpen, setIsSignupPromptOpen] = useState(false);
      const [hasCheckedPreference, setHasCheckedPreference] = useState(false);

      useEffect(() => {
        // Only run the check if it hasn't been done yet in this session
        if (!hasCheckedPreference) {
          const preferenceSet = localStorage.getItem('gradeSectorSelected');
          console.log("Checking preference, found:", preferenceSet); // Debug log

          if (!preferenceSet) {
            // If not set, open the dialog shortly after the page loads
            const timer = setTimeout(() => {
              console.log("Opening signup prompt dialog"); // Debug log
              setIsSignupPromptOpen(true);
            }, 1500); // Show after 1.5 seconds

            // Mark that the check has been performed for this session
            setHasCheckedPreference(true);

            return () => clearTimeout(timer);
          } else {
            // If preference is set, mark check as done and do nothing else
            setHasCheckedPreference(true);
          }
        }
      }, [hasCheckedPreference]); // Depend on hasCheckedPreference

      const handlePreferenceSet = () => {
        console.log("Preference set, closing dialog and setting flag."); // Debug log
        localStorage.setItem('gradeSectorSelected', 'true');
        setIsSignupPromptOpen(false);
      };

      const handleDialogClose = (openState) => {
         // If the dialog is closed (either by setting preference or clicking outside/X)
         // ensure the state reflects it.
         if (!openState) {
            setIsSignupPromptOpen(false);
            // If closed without setting preference, ensure we don't re-prompt immediately
            // by marking the check as done.
            if (!localStorage.getItem('gradeSectorSelected')) {
               setHasCheckedPreference(true);
            }
         }
      }

      return (
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
          <Footer />
          <SignupPromptDialog
            open={isSignupPromptOpen}
            onOpenChange={handleDialogClose} // Use the new handler
            onPreferenceSet={handlePreferenceSet}
          />
        </div>
      );
    };

    export default Layout;
  