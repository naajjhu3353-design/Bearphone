import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function WhatsAppButton() {
  const { t } = useTranslation();

  const handleClick = () => {
    const message = encodeURIComponent(t('whatsapp.message'));
    window.open(`https://wa.me/966548230051?text=${message}`, '_blank');
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 group"
    >
      {/* Glow Effect */}
      <motion.div
        animate={{
          boxShadow: [
            '0 0 20px rgba(37, 211, 102, 0.4)',
            '0 0 40px rgba(37, 211, 102, 0.6)',
            '0 0 20px rgba(37, 211, 102, 0.4)',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 rounded-full bg-green-500"
      />
      
      {/* Button */}
      <div className="relative w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors">
        <MessageCircle className="w-7 h-7 text-white" />
        
        {/* Notification Dot */}
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-carbon"
        />
      </div>

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        whileHover={{ opacity: 1, x: 0 }}
        className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-carbon-light border border-white/10 px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      >
        <span className="text-white text-sm">{t('whatsapp.button')}</span>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 bg-carbon-light border-r border-t border-white/10 rotate-45" />
      </motion.div>
    </motion.button>
  );
}
