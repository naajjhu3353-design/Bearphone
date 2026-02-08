import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import "./i18n";

// Layout Components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Common Components
import WhatsAppButton from "./components/common/WhatsAppButton";

// Sections
import Hero from "./sections/Hero";
import Store from "./sections/Store";
import Services from "./sections/Services";
import SellDevice from "./sections/SellDevice";
import OrderTracking from "./sections/OrderTracking";

// Pages
import Admin from "./pages/Admin";

// Context
import { AuthProvider } from "./contexts/authContext";

// Loading Screen
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
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="relative"
      >
        <img
          src="/bear-claw.png"
          alt="Loading..."
          className="w-24 h-24 object-contain opacity-80"
        />
        <div className="absolute inset-0 bg-electric-blue/20 blur-xl rounded-full animate-pulse" />
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <h2 className="text-2xl font-bold text-white mb-2 tracking-wider">
          BEAR PHONE
        </h2>
        <p className="text-gray-400 text-sm">{t("loading.system")}</p>
      </motion.div>
    </motion.div>
  );
}

// Main Content
function MainContent({
  currentPage,
  onNavigate,
}: {
  currentPage: string;
  onNavigate: (page: string) => void;
}) {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Hero onNavigate={onNavigate} />;
      case "store":
      case "phones":
      case "accessories":
        return <Store onNavigate={onNavigate} />;
      case "services":
      case "bear-hunt":
        return <Services />;
      case "sell-device":
        return <SellDevice />;
      case "track-order":
        return <OrderTracking />;
      case "admin":
        return <Admin />;
      default:
        return <Hero onNavigate={onNavigate} />;
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
  const [currentPage, setCurrentPage] = useState("home");
  const { i18n } = useTranslation();

  // Set initial direction
  useEffect(() => {
    document.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  // URL Parameter Logic (Admin Access)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get("page");
    const validPages = [
      "home",
      "store",
      "phones",
      "accessories",
      "services",
      "bear-hunt",
      "sell-device",
      "track-order",
      "admin",
    ];
    if (pageParam && validPages.includes(pageParam)) {
      setCurrentPage(pageParam);
    }
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Update URL
    const url = new URL(window.location.href);
    if (page === "home") url.searchParams.delete("page");
    else url.searchParams.set("page", page);
    window.history.pushState({}, "", url);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-carbon">
        <AnimatePresence>
          {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
        </AnimatePresence>

        {!isLoading && (
          <>
            {currentPage !== "admin" && (
              <Header onNavigate={handleNavigate} currentPage={currentPage} />
            )}

            <MainContent currentPage={currentPage} onNavigate={handleNavigate} />

            {currentPage !== "admin" && (
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