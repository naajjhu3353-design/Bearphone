import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Phone, MapPin, Mail, Instagram, Twitter } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const quickLinks = [
    { id: 'store', label: t('nav.store') },
    { id: 'services', label: t('nav.services') },
    { id: 'sell-device', label: t('nav.sellDevice') },
    { id: 'track-order', label: t('nav.trackOrder') },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <footer className="bg-carbon-dark border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {/* Brand */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/bear-logo.png"
                alt="BEAR PHONE"
                className="w-12 h-12 object-contain"
              />
              <span className="text-xl font-bold text-white">{t('common.brand')}</span>
            </div>
            <p className="text-electric font-medium mb-2">{t('common.slogan')}</p>
            <p className="text-white/60 text-sm">
              {isRTL 
                ? 'وجهتك الأولى للتقنية الفاخرة في المملكة العربية السعودية'
                : 'Your destination for luxury technology in Saudi Arabia'}
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-white font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavigate(link.id)}
                    className="text-white/60 hover:text-electric transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <h4 className="text-white font-semibold mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-white/60">
                <Phone className="w-4 h-4 text-electric" />
                <span>+966 54 823 0051</span>
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <Mail className="w-4 h-4 text-electric" />
                <span>info@bearphone.sa</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <MapPin className="w-4 h-4 text-electric flex-shrink-0 mt-1" />
                <span>{isRTL ? 'الخبر، المنطقة الشرقية' : 'Al Khobar, Eastern Region'}</span>
              </li>
            </ul>
          </motion.div>

          {/* Social */}
          <motion.div variants={itemVariants}>
            <h4 className="text-white font-semibold mb-4">
              {isRTL ? 'تابعنا' : 'Follow Us'}
            </h4>
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: '#' },
                { icon: Twitter, href: '#' },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white/60 hover:text-electric hover:bg-electric/10 transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-white/5"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm">
              © 2024 {t('common.brand')}. {t('footer.rights')}
            </p>
            <div className="flex gap-4 text-sm">
              <button className="text-white/40 hover:text-electric transition-colors">
                {t('footer.privacy')}
              </button>
              <button className="text-white/40 hover:text-electric transition-colors">
                {t('footer.terms')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
