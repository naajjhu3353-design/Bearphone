import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Camera, Smartphone, Battery, Check, X, Send, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ImageUpload {
  file: File | null;
  preview: string | null;
}

interface FormData {
  name: string;
  phone: string;
  deviceModel: string;
  storage: string;
  batteryHealth: number;
  openedBefore: boolean;
  partsReplaced: boolean;
}

export default function SellDevice() {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    deviceModel: '',
    storage: '',
    batteryHealth: 100,
    openedBefore: false,
    partsReplaced: false,
  });

  const [images, setImages] = useState<{
    front: ImageUpload;
    back: ImageUpload;
    sides: ImageUpload;
    battery: ImageUpload;
  }>({
    front: { file: null, preview: null },
    back: { file: null, preview: null },
    sides: { file: null, preview: null },
    battery: { file: null, preview: null },
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRefs = {
    front: useRef<HTMLInputElement>(null),
    back: useRef<HTMLInputElement>(null),
    sides: useRef<HTMLInputElement>(null),
    battery: useRef<HTMLInputElement>(null),
  };

  const isRTL = i18n.language === 'ar';

  const handleImageUpload = (type: keyof typeof images, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImages(prev => ({
        ...prev,
        [type]: { file, preview: reader.result as string },
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (type: keyof typeof images) => {
    setImages(prev => ({
      ...prev,
      [type]: { file: null, preview: null },
    }));
  };

  const allImagesUploaded = Object.values(images).every(img => img.file !== null);
  const allFieldsFilled = formData.name && formData.phone && formData.deviceModel && formData.storage;

  const generateWhatsAppMessage = () => {
    const message = `
*طلب بيع جهاز - دب فون*

*معلومات البائع:*
الاسم: ${formData.name}
الجوال: ${formData.phone}

*معلومات الجهاز:*
الموديل: ${formData.deviceModel}
السعة: ${formData.storage}
صحة البطارية: ${formData.batteryHealth}%
تم الفتح من قبل: ${formData.openedBefore ? 'نعم' : 'لا'}
تم استبدال قطع: ${formData.partsReplaced ? 'نعم' : 'لا'}

*الصور مرفقة*
    `.trim();

    return encodeURIComponent(message);
  };

  const handleSubmit = async () => {
    if (!allFieldsFilled || !allImagesUploaded) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/966548230051?text=${generateWhatsAppMessage()}`;
    window.open(whatsappUrl, '_blank');

    setIsSubmitting(false);
    setShowSuccess(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      deviceModel: '',
      storage: '',
      batteryHealth: 100,
      openedBefore: false,
      partsReplaced: false,
    });
    setImages({
      front: { file: null, preview: null },
      back: { file: null, preview: null },
      sides: { file: null, preview: null },
      battery: { file: null, preview: null },
    });
    setShowSuccess(false);
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

  const imageTypes = [
    { key: 'front', label: t('sellDevice.form.images.front'), icon: Smartphone },
    { key: 'back', label: t('sellDevice.form.images.back'), icon: Smartphone },
    { key: 'sides', label: t('sellDevice.form.images.sides'), icon: Smartphone },
    { key: 'battery', label: t('sellDevice.form.images.battery'), icon: Battery },
  ] as const;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 xl:px-12 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url('/bear-claw.png')`,
            backgroundSize: '200px',
            backgroundRepeat: 'repeat',
            transform: 'rotate(-15deg) scale(1.5)',
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          {/* Reverse Card Visual */}
          <motion.div
            initial={{ rotateY: 180 }}
            animate={{ rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-block mb-6"
          >
            <div className="relative">
              <div className="w-24 h-36 mx-auto rounded-xl bg-gradient-to-br from-electric/20 to-electric/5 border-2 border-electric glow-blue flex items-center justify-center">
                <RotateCcw className="w-10 h-10 text-electric" />
              </div>
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-xl bg-electric/20 blur-xl -z-10 animate-pulse" />
            </div>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {t('sellDevice.title')}
          </h2>
          <p className="text-xl text-electric mb-2">{t('sellDevice.subtitle')}</p>
          <p className="text-white/60">{t('sellDevice.description')}</p>
        </motion.div>

        {/* Form */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="carbon-card p-6 sm:p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="text-lg font-semibold text-electric flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-electric/20 flex items-center justify-center text-sm">1</span>
                {isRTL ? 'معلومات التواصل' : 'Contact Information'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white/80">{t('sellDevice.form.name')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-carbon-light border-white/10 text-white mt-1"
                    placeholder={isRTL ? 'محمد العلي' : 'John Doe'}
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white/80">{t('sellDevice.form.phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="bg-carbon-light border-white/10 text-white mt-1"
                    placeholder="05XXXXXXXX"
                  />
                </div>
              </div>
            </motion.div>

            {/* Device Info */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="text-lg font-semibold text-electric flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-electric/20 flex items-center justify-center text-sm">2</span>
                {isRTL ? 'معلومات الجهاز' : 'Device Information'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="model" className="text-white/80">{t('sellDevice.form.deviceModel')}</Label>
                  <Input
                    id="model"
                    value={formData.deviceModel}
                    onChange={(e) => setFormData(prev => ({ ...prev, deviceModel: e.target.value }))}
                    className="bg-carbon-light border-white/10 text-white mt-1"
                    placeholder="iPhone 14 Pro"
                  />
                </div>

                <div>
                  <Label htmlFor="storage" className="text-white/80">{t('sellDevice.form.storage')}</Label>
                  <Input
                    id="storage"
                    value={formData.storage}
                    onChange={(e) => setFormData(prev => ({ ...prev, storage: e.target.value }))}
                    className="bg-carbon-light border-white/10 text-white mt-1"
                    placeholder="128GB"
                  />
                </div>
              </div>
            </motion.div>

            {/* Battery Health */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="text-lg font-semibold text-electric flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-electric/20 flex items-center justify-center text-sm">3</span>
                {t('sellDevice.form.batteryHealth')}
              </h3>
              
              <div className="bg-carbon-light rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Battery className="w-5 h-5 text-electric" />
                  <span className="text-2xl font-bold text-electric">{formData.batteryHealth}%</span>
                </div>
                <Slider
                  value={[formData.batteryHealth]}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, batteryHealth: value[0] }))}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </motion.div>

            {/* Toggles */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="text-lg font-semibold text-electric flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-electric/20 flex items-center justify-center text-sm">4</span>
                {isRTL ? 'حالة الجهاز' : 'Device Condition'}
              </h3>
              
              <div className="space-y-4 bg-carbon-light rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="opened" className="text-white/80 cursor-pointer">
                    {t('sellDevice.form.openedBefore')}
                  </Label>
                  <Switch
                    id="opened"
                    checked={formData.openedBefore}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, openedBefore: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="parts" className="text-white/80 cursor-pointer">
                    {t('sellDevice.form.partsReplaced')}
                  </Label>
                  <Switch
                    id="parts"
                    checked={formData.partsReplaced}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, partsReplaced: checked }))}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Image Uploads */}
          <motion.div variants={itemVariants} className="mt-8">
            <h3 className="text-lg font-semibold text-electric flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-full bg-electric/20 flex items-center justify-center text-sm">5</span>
              {t('sellDevice.form.images.title')}
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {imageTypes.map(({ key, label, icon: Icon }) => (
                <motion.div
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  className={`relative aspect-square rounded-xl border-2 border-dashed transition-colors overflow-hidden ${
                    images[key].preview
                      ? 'border-electric bg-electric/10'
                      : 'border-white/20 hover:border-electric/50'
                  }`}
                >
                  {images[key].preview ? (
                    <>
                      <img
                        src={images[key].preview}
                        alt={label}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(key)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-carbon/80 p-2">
                        <p className="text-xs text-white text-center">{label}</p>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => fileInputRefs[key].current?.click()}
                      className="w-full h-full flex flex-col items-center justify-center text-white/50 hover:text-electric transition-colors"
                    >
                      <Icon className="w-8 h-8 mb-2" />
                      <span className="text-xs text-center px-2">{label}</span>
                      <Camera className="w-4 h-4 mt-2" />
                    </button>
                  )}
                  <input
                    ref={fileInputRefs[key]}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(key, file);
                    }}
                    className="hidden"
                  />
                </motion.div>
              ))}
            </div>

            {!allImagesUploaded && (
              <p className="text-amber-400 text-sm mt-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {isRTL ? 'جميع الصور مطلوبة' : 'All images are required'}
              </p>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={itemVariants} className="mt-8">
            <Button
              onClick={handleSubmit}
              disabled={!allFieldsFilled || !allImagesUploaded || isSubmitting}
              className="w-full bg-electric hover:bg-electric-light text-white py-6 text-lg font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <RotateCcw className="w-5 h-5" />
                </motion.div>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  {t('sellDevice.form.submit')}
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="bg-carbon border-electric/30">
          <DialogHeader>
            <DialogTitle className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Check className="w-10 h-10 text-green-500" />
              </motion.div>
              <span className="text-white text-xl">{t('sellDevice.form.success')}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="text-center mt-4">
            <Button onClick={resetForm} className="bg-electric hover:bg-electric-light">
              {t('common.submit')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
