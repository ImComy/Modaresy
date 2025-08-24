import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu';
import {
  Sun,
  Moon,
  Laptop,
  Menu,
  X,
  Heart,
  User,
  LogOut,
  LayoutDashboard,
  Languages,
  Settings,
  Home,
  // Info,
  Search,
  MessageSquare, 
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/context/WishlistContext';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
// import NotificationDropdown from '@/components/ui/notification';

// Navbar component provides the main navigation bar with authentication-aware features
const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { authState, logout } = useAuth();
  const { isLoggedIn, userRole, userId, userData } = authState;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { wishlistIds = [] } = useWishlist();
  const location = useLocation();
  const isRTL = i18n.dir() === 'rtl';

  // Debug auth state to diagnose user role issues
  useEffect(() => {
    console.log('Auth State:', { isLoggedIn, userRole, userId, userData });
  }, [isLoggedIn, userRole, userId, userData]);

  // Language change handler with local storage persistence
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('modaresy-lang', lng);
  };

  // Logout handler that clears session and redirects to home
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  // Navigation items for the main menu
  const navItems = [
    { label: t('home'), path: '/', icon: <Home size={16} /> },
    // { label: t('aboutUs'), path: '/about', icon: <Info size={16} /> }, // About page commented out
    { label: t('chat') || 'Chat', path: '/chat', icon: <MessageSquare size={16} /> }, // Chat added
    { label: t('PickYourTeacher'), path: '/filters', icon: <Search size={16} /> },
  ];

  // Determine profile path based on user role
  const profilePath = userRole === 'Teacher' ? `/tutor/${userId}` : '/profile';

  // Animation variants for mobile menu
  const mobileMenuVariants = {
    closed: { opacity: 0, height: 0, transition: { duration: 0.2 } },
    open: { opacity: 1, height: 'auto', transition: { duration: 0.25 } },
  };

  // Animation variants for dropdown items
  const dropdownItemVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  // State and effect for handling mobile viewport detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleResize = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handleResize);
    setIsMobile(mediaQuery.matches);
    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []);

  // Handle clicking outside mobile menu to close it
  const menuRef = useRef(null);
  const toggleRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    // Main navigation container with sticky positioning and animation
    <motion.nav
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      {/* Desktop navigation layout */}
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and home link */}
        <Link
          to="/"
          className="flex items-center space-x-2 rtl:space-x-reverse w-[100px]"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <img src="/icon.svg" alt="Modaresy" className="primary" />
        </Link>

        {/* Main navigation links for desktop */}
        <div className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-1 text-sm font-medium transition-colors hover:text-foreground',
                  isActive ? 'text-foreground border-b-2 border-foreground pb-0.5' : 'text-muted-foreground'
                )}
              >
                {item.icon} {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right-side controls: wishlist, notifications, language, theme, and user menu */}
        <div className="flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
          {/* Wishlist button (visible when logged in) */}
          {isLoggedIn && (
            <Link to="/wishlist" className="relative hidden sm:inline-flex">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-red-500">
                <Heart size={20} />
                {wishlistIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                    {wishlistIds.length}
                  </span>
                )}
              </Button>
            </Link>
          )}

          {/* Notification dropdown (visible when logged in) */}
          {/* {isLoggedIn && <NotificationDropdown className="visible" />} */}

          {/* Language selection dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Languages size={20} />
                <span className="sr-only">{t('language')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent dir={isRTL ? 'rtl' : 'ltr'} side="bottom" align={isRTL ? 'end' : 'start'} className="min-w-[8rem]">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <DropdownMenuLabel className={cn(isRTL && 'text-right')}>
                  {t('language')}
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup value={i18n.language} onValueChange={changeLanguage}>
                  {['en', 'ar'].map((lang, index) => (
                    <motion.div
                      key={lang}
                      variants={dropdownItemVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <DropdownMenuRadioItem
                        value={lang}
                        className={cn(
                          'flex items-center gap-2 hover:bg-accent/50 !cursor-pointer',
                          isRTL && '!flex-row-reverse !text-left'
                        )}
                      >
                        <span>{t(lang === 'en' ? 'english' : 'arabic')}</span>
                      </DropdownMenuRadioItem>
                    </motion.div>
                  ))}
                </DropdownMenuRadioGroup>
              </motion.div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme selection dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">{t('theme')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent dir={isRTL ? 'rtl' : 'ltr'} side="bottom" align={isRTL ? 'end' : 'start'} className="min-w-[8rem]">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <DropdownMenuLabel className={cn(isRTL && 'text-right')}>
                  {t('theme')}
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                  {[
                    { value: 'light', icon: <Sun className="h-4 w-4" />, label: t('light') },
                    { value: 'dark', icon: <Moon className="h-4 w-4" />, label: t('dark') },
                    { value: 'system', icon: <Laptop className="h-4 w-4" />, label: t('system') },
                  ].map((item, index) => (
                    <motion.div
                      key={item.value}
                      variants={dropdownItemVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <DropdownMenuRadioItem
                        value={item.value}
                        className={cn(
                          'flex items-center gap-2 hover:bg-accent/50 !cursor-pointer',
                          isRTL && '!flex-row-reverse !text-left'
                        )}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </DropdownMenuRadioItem>
                    </motion.div>
                  ))}
                </DropdownMenuRadioGroup>
              </motion.div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Authentication controls: login/signup or user profile menu */}
          {!isLoggedIn ? (
            <div className="hidden md:flex items-center space-x-2 rtl:space-x-reverse">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                {t('login')}
              </Button>
              <Button onClick={() => navigate('/signup')}>
                {t('signup')}
              </Button>
            </div>
          ) : !isMobile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                  onClick={() => console.log('Avatar clicked, userRole:', userRole)}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={userData?.avatar || (userRole === 'Teacher' ? '/teacher-avatar.jpg' : '/student-avatar.jpg')}
                      alt="User Avatar"
                    />
                    <AvatarFallback>{userData?.name?.charAt(0) || (userRole === 'Teacher' ? 'T' : 'S')}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent dir={isRTL ? 'rtl' : 'ltr'} side="bottom" align={isRTL ? 'end' : 'start'} className="min-w-[8rem]">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <DropdownMenuLabel className={cn(isRTL && 'text-right')}>
                    {userData?.name || t('myAccount')}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userRole === 'Student' ? (
                    <motion.div
                      variants={dropdownItemVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.2 }}
                    >
                      <DropdownMenuItem
                        onClick={() => navigate('/profile')}
                        className={cn(
                          'flex items-center gap-2 hover:bg-accent/50 !cursor-pointer',
                          isRTL && '!flex-row-reverse !text-left'
                        )}
                      >
                        <Settings className="h-4 w-4" />
                        <span>{t('settingsNav')}</span>
                      </DropdownMenuItem>
                    </motion.div>
                  ) : userRole === 'Teacher' ? (
                    <>
                      <motion.div
                        variants={dropdownItemVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.2, delay: 0.05 }}
                      >
                        <DropdownMenuItem
                          onClick={() => navigate(profilePath)}
                          className={cn(
                            'flex items-center gap-2 hover:bg-accent/50 !cursor-pointer',
                            isRTL && '!flex-row-reverse !text-left'
                          )}
                        >
                          <User className="h-4 w-4" />
                          <span>{t('profile')}</span>
                        </DropdownMenuItem>
                      </motion.div>
                      <motion.div
                        variants={dropdownItemVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.2, delay: 0.1 }}
                      >
                        <DropdownMenuItem
                          onClick={() => navigate('/dashboard/teacher')}
                          className={cn(
                            'flex items-center gap-2 hover:bg-accent/50 !cursor-pointer',
                            isRTL && '!flex-row-reverse !text-left'
                          )}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          <span>{t('dashboard')}</span>
                        </DropdownMenuItem>
                      </motion.div>
                    </>
                  ) : (
                    <motion.div
                      variants={dropdownItemVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.2 }}
                    >
                      <DropdownMenuItem
                        onClick={() => navigate('/profile')}
                        className={cn(
                          'flex items-center gap-2 hover:bg-accent/50 !cursor-pointer',
                          isRTL && '!flex-row-reverse !text-left'
                        )}
                      >
                        <User className="h-4 w-4" />
                        <span>{t('profile')}</span>
                      </DropdownMenuItem>
                    </motion.div>
                  )}
                  <DropdownMenuSeparator />
                  <motion.div
                    variants={dropdownItemVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.2, delay: userRole === 'Teacher' ? 0.2 : 0.05 }}
                  >
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className={cn(
                        'flex items-center gap-2 hover:bg-accent/50 !cursor-pointer',
                        isRTL && '!flex-row-reverse !text-left'
                      )}
                    >
                      <LogOut className="h-4 w-4 text-destructive" />
                      <span>{t('logout')}</span>
                    </DropdownMenuItem>
                  </motion.div>
                </motion.div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile menu toggle button */}
          <Button
            ref={toggleRef}
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile menu with authentication-aware options */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={menuRef}
            key="mobile-menu"
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="md:hidden border-t absolute top-full left-0 w-full bg-background shadow-md overflow-hidden"
          >
            <div className="flex flex-col space-y-1 p-4">
              {/* Main navigation links for mobile */}
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground p-3 rounded-md block flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
              {isLoggedIn && (
                <>
                  <Separator className="my-2" />
                  {/* Wishlist link for mobile */}
                  <Link
                    to="/wishlist"
                    className="text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground p-3 rounded-md flex items-center gap-2 ml-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Heart size={16} /> {t('wishlist')}
                    {wishlistIds.length > 0 && (
                      <span className="ml-auto text-xs bg-accent text-accent-foreground rounded-full px-1.5 py-0.5">
                        {wishlistIds.length}
                      </span>
                    )}
                  </Link>
                  {userRole === 'Student' ? (
                    <Button
                      variant="ghost"
                      className="justify-start w-full text-left"
                      onClick={() => {
                        navigate('/profile');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Settings className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" /> {t('settingsNav')}
                    </Button>
                  ) : userRole === 'Teacher' ? (
                    <>
                      <Button
                        variant="ghost"
                        className="justify-start w-full text-left"
                        onClick={() => {
                          navigate(profilePath);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <User className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" /> {t('profile')}
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start w-full text-left"
                        onClick={() => {
                          navigate('/dashboard/teacher');
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" /> {t('dashboard')}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      className="justify-start w-full text-left"
                      onClick={() => {
                        navigate('/profile');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <User className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" /> {t('profile')}
                    </Button>
                  )}
                  {/* Logout button for mobile */}
                  <Button
                    variant="ghost"
                    className="justify-start w-full text-left"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" /> {t('logout')}
                  </Button>
                </>
              )}
              {!isLoggedIn && (
                <>
                  <Separator className="my-2" />
                  {/* Login/Signup buttons for mobile when not logged in */}
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() => {
                      navigate('/login');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {t('login')}
                  </Button>
                  <Button
                    className="w-full justify-center"
                    onClick={() => {
                      navigate('/signup');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {t('signup')}
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;