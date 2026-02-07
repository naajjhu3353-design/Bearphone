import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Smartphone, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroProps {
  onNavigate: (page: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster="/bear-logo.png"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-futuristic-devices-99786-large.mp4" type="video/mp4" />
        </video>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-carbon/80 via-carbon/60 to-carbon" />
        
        {/* Animated Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 122, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 122, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 pt-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          {/* Logo Animation */}
          <motion.div variants={itemVariants} className="mb-6">
            <motion.img
              src="/bear-logo.png"
              alt="BEAR PHONE"
              className="w-24 h-24 sm:w-32 sm:h-32 mx-auto"
              animate={{
                filter: [
                  'drop-shadow(0 0 20px rgba(0, 122, 255, 0.5))',
                  'drop-shadow(0 0 40px rgba(0, 122, 255, 0.8))',
                  'drop-shadow(0 0 20px rgba(0, 122, 255, 0.5))',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4"
          >
            <span className="bg-gradient-to-r from-white via-electric to-white bg-clip-text text-transparent animate-text-glow">
              {t('hero.title')}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-xl sm:text-2xl md:text-3xl text-electric font-semibold mb-4"
          >
            {t('common.slogan')}
          </motion.p>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-white/70 mb-8 max-w-2xl mx-auto"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                onClick={() => onNavigate('store')}
                className="bg-electric hover:bg-electric-light text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-glow hover:shadow-glow-lg transition-all duration-300"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {t('hero.ctaStore')}
                <ArrowRight className={`w-5 h-5 ml-2 ${isRTL ? 'rotate-180' : ''}`} />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate('sell-device')}
                className="border-electric text-electric hover:bg-electric/10 px-8 py-6 text-lg font-semibold rounded-xl"
              >
                <Smartphone className="w-5 h-5 mr-2" />
                {t('hero.ctaSell')}
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate('services')}
                className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-xl"
              >
                <Wrench className="w-5 h-5 mr-2" />
                {t('hero.ctaServices')}
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {[
              { value: '10K+', label: isRTL ? 'عميل سعيد' : 'Happy Customers' },
              { value: '5K+', label: isRTL ? 'جهاز مباع' : 'Devices Sold' },
              { value: '99%', label: isRTL ? 'رضا العملاء' : 'Satisfaction' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-2xl sm:text-3xl font-bold text-electric glow-text">
                  {stat.value}
                </div>
                <div className="text-sm text-white/60 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-electric/50 rounded-full flex justify-center pt-2"
        >
          <motion.div
            animate={{ opacity: [1, 0], y: [0, 12] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-electric rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
