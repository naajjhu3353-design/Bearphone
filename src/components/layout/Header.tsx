import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, ShoppingBag, Wrench, MapPin, User, Package, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Header({ onNavigate, currentPage }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const { isAdmin } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const navItems = [
    { id: 'home', label: t('nav.home'), icon: null },
    { id: 'store', label: t('nav.store'), icon: ShoppingBag },
    { id: 'services', label: t('nav.services'), icon: Wrench },
    { id: 'bear-hunt', label: t('nav.bearHunt'), icon: MapPin },
    { id: 'sell-device', label: t('nav.sellDevice'), icon: User },
    { id: 'track-order', label: t('nav.trackOrder'), icon: Package },
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-carbon/95 backdrop-blur-md shadow-lg shadow-electric/10' 
          : 'bg-transparent'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.button
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-2 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img 
              src="/bear-logo.png" 
              alt="BEAR PHONE" 
              className="w-10 h-10 lg:w-12 lg:h-12 object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(0,122,255,0.8)]"
            />
            <span className="text-lg lg:text-xl font-bold text-white hidden sm:block">
              {t('common.brand')}
            </span>
          </motion.button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                  currentPage === item.id
                    ? 'text-electric'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center gap-2">
                  {item.icon && <item.icon className="w-4 h-4" />}
                  {item.label}
                </span>
                {currentPage === item.id && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-electric rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="text-white/70 hover:text-white hover:bg-white/5"
            >
              {i18n.language === 'ar' ? 'EN' : 'عربي'}
            </Button>

            {/* Admin Access */}
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate('admin')}
                className={`hidden sm:flex items-center gap-2 ${
                  currentPage === 'admin' ? 'text-electric' : 'text-white/70 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span className="hidden xl:inline">{t('nav.admin')}</span>
              </Button>
            )}

            {/* WhatsApp Button - Desktop */}
            <a
              href="https://wa.me/966548230051"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex"
            >
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Phone className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </a>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-carbon/98 backdrop-blur-md border-t border-white/10"
          >
            <nav className="px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors ${
                    currentPage === item.id
                      ? 'bg-electric/20 text-electric'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  {item.icon && <item.icon className="w-5 h-5" />}
                  {item.label}
                </motion.button>
              ))}
              
              {isAdmin && (
                <motion.button
                  onClick={() => handleNavigate('admin')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors ${
                    currentPage === 'admin'
                      ? 'bg-electric/20 text-electric'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <Shield className="w-5 h-5" />
                  {t('nav.admin')}
                </motion.button>
              )}

              {/* WhatsApp Button - Mobile */}
              <a
                href="https://wa.me/966548230051"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-600/20 text-green-400"
              >
                <Phone className="w-5 h-5" />
                WhatsApp
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
