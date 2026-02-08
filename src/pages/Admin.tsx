import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Shield, 
  LogOut, 
  Wrench, 
  ShoppingCart, 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase/config';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

interface Product {
  id: string;
  name: string;
  price: number;
  category: 'phone' | 'accessory';
  condition: 'new' | 'used';
  stock: number;
  description: string;
  image?: string;
}

interface MaintenanceRequest {
  id: string;
  customerName: string;
  phone: string;
  deviceType: string;
  issue: string;
  status: 'pending' | 'inProgress' | 'ready';
  createdAt: Date;
}

export default function Admin() {
  const { t, i18n } = useTranslation();
  const { isAdmin, isLoading: authLoading, logout } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const isRTL = i18n.language === 'ar';

  // Load products from Firestore
  useEffect(() => {
    loadProducts();
    loadMaintenanceRequests();
  }, []);

  const loadProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(document => ({
        id: document.id,
        ...document.data()
      } as Product));
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadMaintenanceRequests = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'maintenanceRequests'));
      const requestsData = querySnapshot.docs.map(document => ({
        id: document.id,
        ...document.data(),
        createdAt: document.data().createdAt?.toDate() || new Date()
      } as MaintenanceRequest));
      setMaintenanceRequests(requestsData);
    } catch (error) {
      console.error('Error loading maintenance requests:', error);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      setShowLoginDialog(true);
    }
  }, [authLoading, isAdmin]);

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: MaintenanceRequest['status']) => {
    try {
      await updateDoc(doc(db, 'maintenanceRequests', id), { status: newStatus });
      setMaintenanceRequests(prev =>
        prev.map(req => req.id === id ? { ...req, status: newStatus } : req)
      );
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const getStatusBadge = (status: MaintenanceRequest['status']) => {
    const configs = {
      pending: { color: 'bg-amber-500', icon: Clock },
      inProgress: { color: 'bg-blue-500', icon: AlertCircle },
      ready: { color: 'bg-green-500', icon: CheckCircle2 },
    };
    const config = configs[status];
    return (
      <Badge className={`${config.color} text-white`}>
        <config.icon className="w-3 h-3 mr-1" />
        {t(`orderTracking.stages.${status}`)}
      </Badge>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-carbon">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Shield className="w-12 h-12 text-electric" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-carbon pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-electric/20 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-electric" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{t('admin.title')}</h1>
              <p className="text-white/60">{isRTL ? 'لوحة تحكم المشرف' : 'Admin Dashboard'}</p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={logout}
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('nav.logout')}
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: t('admin.products'), value: products.length, icon: Package, color: 'bg-blue-500' },
            { label: t('admin.maintenance'), value: maintenanceRequests.length, icon: Wrench, color: 'bg-amber-500' },
            { label: t('admin.orders'), value: '12', icon: ShoppingCart, color: 'bg-green-500' },
            { label: t('admin.stats'), value: '+23%', icon: TrendingUp, color: 'bg-purple-500' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="carbon-card p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 ${stat.color}/20 rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-carbon-light border border-white/10 mb-6">
              <TabsTrigger value="products" className="data-[state=active]:bg-electric">
                <Package className="w-4 h-4 mr-2" />
                {t('admin.products')}
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="data-[state=active]:bg-electric">
                <Wrench className="w-4 h-4 mr-2" />
                {t('admin.maintenance')}
              </TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products">
              <div className="carbon-card p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      placeholder={t('common.search')}
                      className="pl-10 bg-carbon-light border-white/10 text-white"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      setEditingProduct(null);
                      setShowProductDialog(true);
                    }}
                    className="bg-electric hover:bg-electric-light ml-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('admin.addProduct')}
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-white/60 font-medium">{t('admin.productForm.name')}</th>
                        <th className="text-left py-3 px-4 text-white/60 font-medium">{t('common.price')}</th>
                        <th className="text-left py-3 px-4 text-white/60 font-medium">{t('admin.productForm.stock')}</th>
                        <th className="text-left py-3 px-4 text-white/60 font-medium">{t('common.status')}</th>
                        <th className="text-left py-3 px-4 text-white/60 font-medium">{t('common.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-white font-medium">{product.name}</p>
                              <p className="text-white/40 text-sm">{product.description}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-electric font-medium">{product.price} SAR</td>
                          <td className="py-3 px-4">
                            <span className={product.stock === 0 ? 'text-red-400' : 'text-white'}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {product.stock === 0 ? (
                              <Badge className="bg-red-500/20 text-red-400">{t('store.outOfStock')}</Badge>
                            ) : (
                              <Badge className="bg-green-500/20 text-green-400">
                                {t(`store.${product.condition}`)}
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setEditingProduct(product);
                                  setShowProductDialog(true);
                                }}
                                className="text-electric hover:bg-electric/10"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Maintenance Tab */}
            <TabsContent value="maintenance">
              <div className="carbon-card p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-white/60 font-medium">{t('common.name')}</th>
                        <th className="text-left py-3 px-4 text-white/60 font-medium">{t('common.phone')}</th>
                        <th className="text-left py-3 px-4 text-white/60 font-medium">{t('services.maintenance.form.deviceType')}</th>
                        <th className="text-left py-3 px-4 text-white/60 font-medium">{t('common.status')}</th>
                        <th className="text-left py-3 px-4 text-white/60 font-medium">{t('common.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenanceRequests.map((request) => (
                        <tr key={request.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4 text-white">{request.customerName}</td>
                          <td className="py-3 px-4 text-white/70">{request.phone}</td>
                          <td className="py-3 px-4 text-white">{request.deviceType}</td>
                          <td className="py-3 px-4">{getStatusBadge(request.status)}</td>
                          <td className="py-3 px-4">
                            <select
                              value={request.status}
                              onChange={(e) => handleUpdateStatus(request.id, e.target.value as any)}
                              className="bg-carbon-light border border-white/20 rounded px-3 py-1 text-white text-sm"
                            >
                              <option value="pending">{t('orderTracking.stages.inspection')}</option>
                              <option value="inProgress">{t('orderTracking.stages.inProgress')}</option>
                              <option value="ready">{t('orderTracking.stages.ready')}</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="bg-carbon border-electric/30">
          <DialogHeader>
            <DialogTitle className="text-center text-white">
              <Shield className="w-12 h-12 text-electric mx-auto mb-4" />
              {isRTL ? 'تسجيل دخول المشرف' : 'Admin Login'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-white/80">{t('common.email')}</Label>
              <Input
                type="email"
                placeholder="admin@bearphone.com"
                className="bg-carbon-light border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/80">{t('nav.login')}</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="bg-carbon-light border-white/10 text-white mt-1"
              />
            </div>
            <Button
              onClick={() => setShowLoginDialog(false)}
              className="w-full bg-electric hover:bg-electric-light"
            >
              {t('nav.login')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="bg-carbon border-electric/30 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingProduct ? t('admin.editProduct') : t('admin.addProduct')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-white/80">{t('admin.productForm.name')}</Label>
              <Input
                defaultValue={editingProduct?.name}
                className="bg-carbon-light border-white/10 text-white mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/80">{t('common.price')}</Label>
                <Input
                  type="number"
                  defaultValue={editingProduct?.price}
                  className="bg-carbon-light border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/80">{t('admin.productForm.stock')}</Label>
                <Input
                  type="number"
                  defaultValue={editingProduct?.stock}
                  className="bg-carbon-light border-white/10 text-white mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-white/80">{t('admin.productForm.description')}</Label>
              <Input
                defaultValue={editingProduct?.description}
                className="bg-carbon-light border-white/10 text-white mt-1"
              />
            </div>
            <Button
              onClick={() => setShowProductDialog(false)}
              className="w-full bg-electric hover:bg-electric-light"
            >
              {t('common.save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}