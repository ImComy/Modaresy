
    import React, { createContext, useState, useContext, useEffect } from 'react';

    const AuthContext = createContext(null);

    export const AuthProvider = ({ children }) => {
      const [authState, setAuthState] = useState({
        isLoggedIn: false,
        userRole: null, // 'student' or 'teacher'
        userId: null, // Mock user ID
        // Add more user details if needed
      });

      // Simple function to simulate login
      const login = (role = 'student', userId = 1) => {
        console.log(`AuthContext: Logging in as ${role} with ID ${userId}`);
        setAuthState({ isLoggedIn: true, userRole: role, userId });
        // In a real app, you'd fetch user data here after successful auth
      };

      // Simple function to simulate logout
      const logout = () => {
        console.log("AuthContext: Logging out");
        setAuthState({ isLoggedIn: false, userRole: null, userId: null });
        // Clear tokens, etc.
      };

       // Simulate persistent login check (e.g., reading from localStorage)
       // This is a basic example; a real app would use secure tokens
       useEffect(() => {
         const storedRole = localStorage.getItem('mockUserRole');
         const storedUserId = localStorage.getItem('mockUserId');
         if (storedRole && storedUserId) {
           login(storedRole, parseInt(storedUserId));
         }
       }, []);

      // Persist mock login state for demonstration
      useEffect(() => {
         if (authState.isLoggedIn) {
            localStorage.setItem('mockUserRole', authState.userRole);
            localStorage.setItem('mockUserId', authState.userId);
         } else {
            localStorage.removeItem('mockUserRole');
            localStorage.removeItem('mockUserId');
         }
       }, [authState]);


      return (
        <AuthContext.Provider value={{ authState, login, logout }}>
          {children}
        </AuthContext.Provider>
      );
    };

    export const useAuth = () => {
      const context = useContext(AuthContext);
      if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
      }
      return context;
    };
  