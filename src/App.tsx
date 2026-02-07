mport { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './i18n';

// Layout Components
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Common Components
import WhatsAppButton from '@/components/common/WhatsAppButton';

// Sections
import Hero from '@/sections/Hero';
import Store from '@/sections/Store';
import Services from '@/sections/Services';
import SellDevice from '@/sections/SellDevice';
import OrderTracking from '@/sections/OrderTracking';

// Pages
import Admin from '@/pages/Admin';

// Context
import { AuthProvider } from '@/contexts/AuthContext';

// Loading Screen Component
function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation();
  
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] bg-carbon flex flex-col items-center justify-center"
    >
      {/* Bear Claw Spinner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="relative"
      >
        <img
          src="/bear-claw.png"
          alt="Loading"
          className="w-24 h-24 object-contain"
          style={{
            filter: 'drop-shadow(0 0 20px rgba(0, 122, 255, 0.8))',
          }}
        />
        {/* Glow rings */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full border-2 border-electric/50"
        />
        <motion.div
          animate={{
            scale: [1, 2, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className="absolute inset-0 rounded-full border border-electric/30"
        />
      </motion.div>

      {/* Brand Name */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-3xl font-bold text-white"
      >
        {t('common.brand')}
      </motion.h1>

      {/* Slogan */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-2 text-electric"
      >
        {t('common.slogan')}
      </motion.p>

      {/* Loading Bar */}
      <div className="mt-8 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          className="h-full bg-electric rounded-full"
        />
      </div>
    </motion.div>
  );
}

// Main Content Component
function MainContent({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: string) => void }) {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <>
            <Hero onNavigate={onNavigate} />
            <Store onNavigate={onNavigate} />
            <Services />
            <SellDevice />
          </>
        );
      case 'store':
      case 'phones':
      case 'accessories':
        return <Store onNavigate={onNavigate} />;
      case 'services':
        return <Services />;
      case 'bear-hunt':
        return <Services />;
      case 'sell-device':
        return <SellDevice />;
      case 'track-order':
        return <OrderTracking />;
      case 'admin':
        return <Admin />;
      default:
        return (
          <>
            <Hero onNavigate={onNavigate} />
            <Store onNavigate={onNavigate} />
            <Services />
            <SellDevice />
          </>
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={currentPage}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3 }}
        className="min-h-screen"
      >
        {renderPage()}
      </motion.main>
    </AnimatePresence>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const { i18n } = useTranslation();

  // Set initial direction
  useEffect(() => {
    document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  // Check for URL query parameter to set initial page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    
    if (pageParam) {
      // Valid pages that can be accessed via URL
      const validPages = [
        'home',
        'store',
        'phones',
        'accessories',
        'services',
        'bear-hunt',
        'sell-device',
        'track-order',
        'admin'
      ];
      
      if (validPages.includes(pageParam)) {
        setCurrentPage(pageParam);
      }
    }
  }, []); // Run only once on mount

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    
    // Update URL without page reload
    const url = new URL(window.location.href);
    if (page === 'home') {
      // Remove query parameter for home page
      url.searchParams.delete('page');
    } else {
      url.searchParams.set('page', page);
    }
    window.history.pushState({}, '', url);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-carbon">
        <AnimatePresence>
          {isLoading && (
            <LoadingScreen onComplete={() => setIsLoading(false)} />
          )}
        </AnimatePresence>

        {!isLoading && (
          <>
            {currentPage !== 'admin' && (
              <Header onNavigate={handleNavigate} currentPage={currentPage} />
            )}
            
            <MainContent currentPage={currentPage} onNavigate={handleNavigate} />
            
            {currentPage !== 'admin' && (
              <>
                <Footer onNavigate={handleNavigate} />
                <WhatsAppButton />
              </>
            )}
          </>
        )}
      </div>
    </AuthProvider>
  );
}

export default App;
