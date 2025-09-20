import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div>
            <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse w-[100px]" onClick={() => setIsMobileMenuOpen(false)}>
              <img src='/icon.svg' alt='Modaresy' className='primary'/>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              {t('heroSubtitle')} {/* Reusing subtitle */}
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a href="https://www.facebook.com/profile.php?id=61578144642612" className="text-muted-foreground hover:text-primary transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter size={20} /></a>
              <a href="https://www.instagram.com/modaresy_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" className="text-muted-foreground hover:text-primary transition-colors"><Instagram size={20} /></a>
              <a href="https://www.linkedin.com/company/modaresy" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-md font-semibold mb-3">{t('quickLinks')}</h4> {/* Add translation key */}
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">{t('aboutUs')}</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">{t('contactUs')}</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">{t('termsOfService')}</Link></li> {/* Add /terms route if needed */}
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">{t('privacyPolicy')}</Link></li> {/* Add /privacy route if needed */}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
              <h4 className="text-md font-semibold mb-3">{t('contactInfo')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>{t('emailAddress')}: support@modaresy.me</li> 
                <li>{t('phoneNumber')}: 01289099780</li> 
              </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-6 text-center text-sm text-muted-foreground">
          {t('footerText', { year: currentYear })}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
  