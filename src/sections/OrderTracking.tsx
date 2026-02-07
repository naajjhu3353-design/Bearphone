import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, CheckCircle2, Clock, Wrench, TestTube, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface OrderStage {
  id: string;
  key: 'inspection' | 'inProgress' | 'testing' | 'ready';
  label: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
  current: boolean;
  estimatedTime: string;
}

interface Order {
  id: string;
  customerName: string;
  deviceModel: string;
  serviceType: string;
  stages: OrderStage[];
  currentStage: number;
  createdAt: Date;
  estimatedCompletion: Date;
}

export default function OrderTracking() {
  const { t, i18n } = useTranslation();
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const isRTL = i18n.language === 'ar';

  // Demo order data
  const demoOrder: Order = {
    id: 'BP-2024-001',
    customerName: 'محمد العلي',
    deviceModel: 'iPhone 14 Pro',
    serviceType: 'تغيير شاشة',
    stages: [
      {
        id: '1',
        key: 'inspection',
        label: t('orderTracking.stages.inspection'),
        description: t('orderTracking.descriptions.inspection'),
        icon: Package,
        completed: true,
        current: false,
        estimatedTime: isRTL ? '30 دقيقة' : '30 minutes',
      },
      {
        id: '2',
        key: 'inProgress',
        label: t('orderTracking.stages.inProgress'),
        description: t('orderTracking.descriptions.inProgress'),
        icon: Wrench,
        completed: true,
        current: false,
        estimatedTime: isRTL ? '2-3 ساعات' : '2-3 hours',
      },
      {
        id: '3',
        key: 'testing',
        label: t('orderTracking.stages.testing'),
        description: t('orderTracking.descriptions.testing'),
        icon: TestTube,
        completed: false,
        current: true,
        estimatedTime: isRTL ? '30 دقيقة' : '30 minutes',
      },
      {
        id: '4',
        key: 'ready',
        label: t('orderTracking.stages.ready'),
        description: t('orderTracking.descriptions.ready'),
        icon: CheckCheck,
        completed: false,
        current: false,
        estimatedTime: isRTL ? 'جاهز للاستلام' : 'Ready for pickup',
      },
    ],
    currentStage: 2,
    createdAt: new Date(Date.now() - 86400000 * 2),
    estimatedCompletion: new Date(Date.now() + 86400000),
  };

  const handleSearch = async () => {
    if (!orderId.trim()) return;

    setIsSearching(true);
    setNotFound(false);
    setOrder(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (orderId.toUpperCase() === 'BP-2024-001' || orderId === '1') {
      setOrder(demoOrder);
    } else {
      setNotFound(true);
    }

    setIsSearching(false);
  };

  const getStageStatus = (stage: OrderStage) => {
    if (stage.completed) return 'completed';
    if (stage.current) return 'current';
    return 'pending';
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {t('orderTracking.title')}
          </h2>
          <div className="w-24 h-1 bg-electric mx-auto rounded-full glow-blue" />
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="carbon-card p-6 mb-8"
        >
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder={t('orderTracking.enterOrderId')}
                className="pl-10 bg-carbon-light border-white/10 text-white"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching || !orderId.trim()}
              className="bg-electric hover:bg-electric-light text-white px-6"
            >
              {isSearching ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Clock className="w-5 h-5" />
                </motion.div>
              ) : (
                t('orderTracking.track')
              )}
            </Button>
          </div>

          {/* Demo hint */}
          <p className="text-white/40 text-sm mt-3 text-center">
            {isRTL ? 'جرب: BP-2024-001 أو 1' : 'Try: BP-2024-001 or 1'}
          </p>
        </motion.div>

        {/* Not Found */}
        <AnimatePresence>
          {notFound && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="carbon-card p-8 text-center"
            >
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {isRTL ? 'الطلب غير موجود' : 'Order Not Found'}
              </h3>
              <p className="text-white/60">
                {isRTL 
                  ? 'يرجى التحقق من رقم الطلب والمحاولة مرة أخرى'
                  : 'Please check the order number and try again'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Order Details */}
        <AnimatePresence>
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Order Info Card */}
              <Card className="bg-carbon-light border-electric/30 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-white/60 text-sm">{isRTL ? 'رقم الطلب' : 'Order ID'}</p>
                    <p className="text-2xl font-bold text-electric">{order.id}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-white/60 text-sm">{isRTL ? 'الجهاز' : 'Device'}</p>
                    <p className="text-white font-medium">{order.deviceModel}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-white/60 text-sm">{isRTL ? 'الخدمة' : 'Service'}</p>
                  <p className="text-white">{order.serviceType}</p>
                </div>
              </Card>

              {/* Progress Timeline */}
              <div className="carbon-card p-6">
                <h3 className="text-lg font-semibold text-white mb-6">
                  {isRTL ? 'حالة الطلب' : 'Order Status'}
                </h3>

                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${((order.currentStage) / (order.stages.length - 1)) * 100}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="w-full bg-electric"
                    />
                  </div>

                  {/* Stages */}
                  <div className="space-y-6">
                    {order.stages.map((stage, index) => {
                      const status = getStageStatus(stage);
                      const Icon = stage.icon;

                      return (
                        <motion.div
                          key={stage.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.15 }}
                          className="relative flex gap-4"
                        >
                          {/* Icon */}
                          <div
                            className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                              status === 'completed'
                                ? 'bg-green-500'
                                : status === 'current'
                                ? 'bg-electric animate-pulse'
                                : 'bg-white/10'
                            }`}
                          >
                            {status === 'completed' ? (
                              <CheckCircle2 className="w-6 h-6 text-white" />
                            ) : (
                              <Icon className="w-6 h-6 text-white" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 pt-1">
                            <div className="flex items-center gap-2">
                              <h4
                                className={`font-semibold ${
                                  status === 'pending' ? 'text-white/40' : 'text-white'
                                }`}
                              >
                                {stage.label}
                              </h4>
                              {status === 'current' && (
                                <span className="px-2 py-0.5 bg-electric/20 text-electric text-xs rounded-full">
                                  {isRTL ? 'الحالي' : 'Current'}
                                </span>
                              )}
                            </div>
                            <p className="text-white/60 text-sm mt-1">{stage.description}</p>
                            <p className="text-electric text-sm mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {stage.estimatedTime}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Estimated Completion */}
              <Card className="bg-electric/10 border-electric/30 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-electric/20 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-electric" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">
                      {isRTL ? 'الوقت المتوقع للانتهاء' : 'Estimated Completion'}
                    </p>
                    <p className="text-white font-semibold">
                      {order.estimatedCompletion.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
