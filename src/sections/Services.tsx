import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Wrench, Code, Send, MapPin, Navigation, AlertTriangle, Clock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Services() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('maintenance');
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    deviceType: '',
    issue: '',
    phone: '',
  });

  const isRTL = i18n.language === 'ar';

  const handleMaintenanceSubmit = () => {
    const message = encodeURIComponent(`
*طلب صيانة - دب فون*

نوع الجهاز: ${maintenanceForm.deviceType}
وصف المشكلة: ${maintenanceForm.issue}
رقم التواصل: ${maintenanceForm.phone}
    `.trim());

    window.open(`https://wa.me/966548230051?text=${message}`, '_blank');
  };

  const handleBearHuntRequest = () => {
    setShowLocationDialog(true);
  };

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
    <section className="py-20 px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {t('nav.services')}
          </h2>
          <div className="w-24 h-1 bg-electric mx-auto rounded-full glow-blue" />
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-carbon-light border border-white/10 mb-8">
            <TabsTrigger value="maintenance" className="data-[state=active]:bg-electric">
              <Wrench className="w-4 h-4 mr-2" />
              {t('nav.maintenance')}
            </TabsTrigger>
            <TabsTrigger value="bear-hunt" className="data-[state=active]:bg-electric">
              <MapPin className="w-4 h-4 mr-2" />
              {t('nav.bearHunt')}
            </TabsTrigger>
          </TabsList>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="carbon-card p-6 sm:p-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Info */}
                <motion.div variants={itemVariants} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-electric/20 flex items-center justify-center">
                      <Wrench className="w-8 h-8 text-electric" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {t('services.maintenance.title')}
                      </h3>
                      <p className="text-white/60">{t('services.maintenance.description')}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { icon: Wrench, text: isRTL ? 'صيانة الهاردوير' : 'Hardware Repair' },
                      { icon: Code, text: isRTL ? 'برمجة وتحديثات' : 'Software & Updates' },
                      { icon: Phone, text: isRTL ? 'فك الشبكات' : 'Network Unlocking' },
                      { icon: Clock, text: isRTL ? 'سرعة في التنفيذ' : 'Fast Turnaround' },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        className="flex items-center gap-3 text-white/80"
                      >
                        <item.icon className="w-5 h-5 text-electric" />
                        <span>{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Form */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <div>
                    <Label htmlFor="deviceType" className="text-white/80">
                      {t('services.maintenance.form.deviceType')}
                    </Label>
                    <Input
                      id="deviceType"
                      value={maintenanceForm.deviceType}
                      onChange={(e) => setMaintenanceForm(prev => ({ ...prev, deviceType: e.target.value }))}
                      className="bg-carbon-light border-white/10 text-white mt-1"
                      placeholder="iPhone, Samsung, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="issue" className="text-white/80">
                      {t('services.maintenance.form.issue')}
                    </Label>
                    <Textarea
                      id="issue"
                      value={maintenanceForm.issue}
                      onChange={(e) => setMaintenanceForm(prev => ({ ...prev, issue: e.target.value }))}
                      className="bg-carbon-light border-white/10 text-white mt-1 min-h-[120px]"
                      placeholder={isRTL ? 'صف المشكلة بالتفصيل...' : 'Describe the issue in detail...'}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactPhone" className="text-white/80">
                      {t('common.phone')}
                    </Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={maintenanceForm.phone}
                      onChange={(e) => setMaintenanceForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-carbon-light border-white/10 text-white mt-1"
                      placeholder="05XXXXXXXX"
                    />
                  </div>

                  <Button
                    onClick={handleMaintenanceSubmit}
                    className="w-full bg-electric hover:bg-electric-light text-white py-6"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    {t('services.maintenance.form.submit')}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Bear Hunt Tab */}
          <TabsContent value="bear-hunt">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="carbon-card p-6 sm:p-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Info */}
                <motion.div variants={itemVariants} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-electric/20 flex items-center justify-center relative">
                      <MapPin className="w-8 h-8 text-electric" />
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-2xl bg-electric/30"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {t('services.bearHunt.title')}
                      </h3>
                      <p className="text-electric">{t('services.bearHunt.subtitle')}</p>
                    </div>
                  </div>

                  <p className="text-white/70">{t('services.bearHunt.description')}</p>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-carbon-light rounded-lg">
                      <Navigation className="w-5 h-5 text-electric" />
                      <div>
                        <p className="text-white font-medium">{t('services.bearHunt.serviceArea')}</p>
                        <p className="text-white/60 text-sm">
                          {isRTL ? 'الخبر، الدمام، الظهران' : 'Al Khobar, Dammam, Dhahran'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-carbon-light rounded-lg">
                      <Clock className="w-5 h-5 text-electric" />
                      <div>
                        <p className="text-white font-medium">{t('services.bearHunt.pricing')}</p>
                        <p className="text-white/60 text-sm">
                          {isRTL ? 'حسب المسافة ونوع الخدمة' : 'Based on distance and service type'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-400 text-sm">{t('services.bearHunt.disclaimer')}</p>
                  </div>
                </motion.div>

                {/* Map Placeholder & CTA */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <div className="aspect-video bg-carbon-light rounded-xl overflow-hidden relative">
                    {/* Static Map Representation */}
                    <div className="absolute inset-0 bg-gradient-to-br from-carbon-light to-carbon">
                      <div className="absolute inset-0 opacity-30">
                        <svg className="w-full h-full" viewBox="0 0 400 300">
                          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,122,255,0.2)" strokeWidth="0.5"/>
                          </pattern>
                          <rect width="100%" height="100%" fill="url(#grid)" />
                          
                          {/* Roads */}
                          <line x1="0" y1="150" x2="400" y2="150" stroke="rgba(0,122,255,0.3)" strokeWidth="3" />
                          <line x1="200" y1="0" x2="200" y2="300" stroke="rgba(0,122,255,0.3)" strokeWidth="3" />
                          <line x1="0" y1="75" x2="400" y2="225" stroke="rgba(0,122,255,0.2)" strokeWidth="2" />
                          <line x1="0" y1="225" x2="400" y2="75" stroke="rgba(0,122,255,0.2)" strokeWidth="2" />
                        </svg>
                      </div>
                      
                      {/* Location Pin */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="relative"
                        >
                          <MapPin className="w-12 h-12 text-electric" />
                          <motion.div
                            animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 rounded-full bg-electric/30"
                          />
                        </motion.div>
                      </div>
                      
                      {/* Location Label */}
                      <div className="absolute bottom-4 left-4 right-4 glass rounded-lg p-3">
                        <p className="text-white font-medium flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-electric" />
                          {isRTL ? 'الخبر - المنطقة الشرقية' : 'Al Khobar - Eastern Region'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleBearHuntRequest}
                    className="w-full bg-electric hover:bg-electric-light text-white py-6 text-lg font-semibold"
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    {t('services.bearHunt.requestService')}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Location Permission Dialog */}
        <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
          <DialogContent className="bg-carbon border-electric/30">
            <DialogHeader>
              <DialogTitle className="text-white text-center">
                <MapPin className="w-12 h-12 text-electric mx-auto mb-4" />
                {isRTL ? 'مشاركة الموقع' : 'Share Location'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <p className="text-white/70 text-center">
                {isRTL 
                  ? 'نحتاج إلى الوصول إلى موقعك لتقديم خدمة صيد الدب. سيتم استخدام الموقع فقط لتحديد موعد الخدمة.'
                  : 'We need access to your location to provide the Bear Hunt service. Location will only be used to schedule the service.'}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const { latitude, longitude } = position.coords;
                        const message = encodeURIComponent(`
*طلب صيد الدب - دب فون*

الموقع: https://maps.google.com/?q=${latitude},${longitude}
                        `.trim());
                        window.open(`https://wa.me/966548230051?text=${message}`, '_blank');
                        setShowLocationDialog(false);
                      },
                      () => {
                        // Fallback to default location
                        const message = encodeURIComponent(`
*طلب صيد الدب - دب فون*

الموقع: الخبر (الموقع الحي غير متاح)
                        `.trim());
                        window.open(`https://wa.me/966548230051?text=${message}`, '_blank');
                        setShowLocationDialog(false);
                      }
                    );
                  }}
                  className="flex-1 bg-electric hover:bg-electric-light"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  {isRTL ? 'مشاركة الموقع المباشر' : 'Share Live Location'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const message = encodeURIComponent(`
*طلب صيد الدب - دب فون*

الموقع: الخبر
                    `.trim());
                    window.open(`https://wa.me/966548230051?text=${message}`, '_blank');
                    setShowLocationDialog(false);
                  }}
                  className="flex-1 border-white/20"
                >
                  {isRTL ? 'الخبر (افتراضي)' : 'Al Khobar (Default)'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
