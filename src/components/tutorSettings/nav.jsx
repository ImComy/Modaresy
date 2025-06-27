import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const NavigationCard = ({ navItems, selectedSection, setSelectedSection, handleSubmit }) => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleNavClick = (id) => {
    handleSubmit();
    setSelectedSection(id);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(prev => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const renderNavItem = (item, isDrawer = false) => (
    <Button
      key={item.id}
      variant="ghost"
      onClick={() => handleNavClick(item.id)}
      className={clsx(
        'relative flex items-center gap-2 px-4 py-2 h-10 sm:h-11 rounded-t-lg  text-sm sm:text-md font-medium transition-all duration-300',
        isDrawer ? 'h-12 w-full justify-start text-md' : '',
        selectedSection === item.id
          ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-sm rounded-t-md rounded-b-none'
          : 'hover:bg-muted/50 text-muted-foreground hover:text-primary hover:shadow-md'
      )}
    >
      {item.icon}
      <span>{t(item.labelKey, item.defaultLabel)}</span>
      {selectedSection === item.id && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          layoutId="underline"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.0 }}
        />
      )}
    </Button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className=" sticky top-14 sm:top-20 z-30 bg-transparent rounded-lg px-2 sm:px-0"
    >
      <Card className="w-[60px] md:w-full bg-background border border-transparent rounded-lg p-2 sm:p-4">
        {/* Hamburger Button for Mobile */}
        <div className="relative block sm:hidden w-auto">
          <button
            onClick={toggleMenu}
            className="h-10 flex items-center justify-center rounded-md text-primary focus:outline-none border border-primary p-2"
            style={{ background: 'transparent' }}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute right-0 top-12 mt-1 bg-background/95 backdrop-blur-lg border border-border shadow-xl p-4 rounded-t-lg z-50 w-[250px]"
              >
                <div className="flex flex-col gap-2">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15, delay: index * 0.04 }} 
                    >
                      {renderNavItem(item, true)}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Horizontal Navigation for Desktop */}
        <div className="hidden sm:flex flex-row flex-wrap justify-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hidden">
          {navItems.map((item) => renderNavItem(item))}
        </div>
      </Card>
    </motion.div>
  );
};

export default NavigationCard;