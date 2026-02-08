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
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase/config';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

/* ===================== Types ===================== */

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

/* ===================== Component ===================== */

export default function Admin() {
  const { t, i18n } = useTranslation();
  const { isAdmin, isLoading: authLoading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'products' | 'maintenance'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const isRTL = i18n.language === 'ar';

  /* ===================== Data ===================== */

  useEffect(() => {
    loadProducts();
    loadMaintenanceRequests();
  }, []);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      setShowLoginDialog(true);
    }
  }, [authLoading, isAdmin]);

  const loadProducts = async () => {
    const snapshot = await getDocs(collection(db, 'products'));
    const data = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() } as Product)
    );
    setProducts(data);
  };

  const loadMaintenanceRequests = async () => {
    const snapshot = await getDocs(collection(db, 'maintenanceRequests'));
    const data = snapshot.docs.map(
      (d) =>
        ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate?.() ?? new Date()
        } as MaintenanceRequest)
    );
    setMaintenanceRequests(data);
  };

  /* ===================== Actions ===================== */

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete product?')) return;
    await deleteDoc(doc(db, 'products', id));
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdateStatus = async (
    id: string,
    status: MaintenanceRequest['status']
  ) => {
    await updateDoc(doc(db, 'maintenanceRequests', id), { status });
    setMaintenanceRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const getStatusBadge = (status: MaintenanceRequest['status']) => {
    const config = {
      pending: { icon: Clock, class: 'bg-amber-500' },
      inProgress: { icon: AlertCircle, class: 'bg-blue-500' },
      ready: { icon: CheckCircle2, class: 'bg-green-500' }
    }[status];

    return (
      <Badge className={`${config.class} text-white`}>
        <config.icon className="w-3 h-3 mr-1" />
        {t(`orderTracking.stages.${status}`)}
      </Badge>
    );
  };

  /* ===================== Loading ===================== */

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-carbon">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <Shield className="w-12 h-12 text-electric" />
        </motion.div>
      </div>
    );
  }

  /* ===================== UI ===================== */

  return (
    <div className="min-h-screen bg-carbon pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            {t('admin.title')}
          </h1>
          <Button onClick={logout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            {t('nav.logout')}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList>
            <TabsTrigger value="products">
              <Package className="w-4 h-4 mr-2" />
              {t('admin.products')}
            </TabsTrigger>
            <TabsTrigger value="maintenance">
              <Wrench className="w-4 h-4 mr-2" />
              {t('admin.maintenance')}
            </TabsTrigger>
          </TabsList>

          {/* Products */}
          <TabsContent value="products">
            <table className="w-full mt-6">
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-white/10">
                    <td className="text-white">{p.name}</td>
                    <td className="text-electric">{p.price} SAR</td>
                    <td>
                      <Button size="icon" onClick={() => handleDeleteProduct(p.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabsContent>

          {/* Maintenance */}
          <TabsContent value="maintenance">
            <table className="w-full mt-6">
              <tbody>
                {maintenanceRequests.map((r) => (
                  <tr key={r.id} className="border-b border-white/10">
                    <td className="text-white">{r.customerName}</td>
                    <td>{getStatusBadge(r.status)}</td>
                    <td>
                      <select
                        value={r.status}
                        onChange={(e) =>
                          handleUpdateStatus(
                            r.id,
                            e.target.value as MaintenanceRequest['status']
                          )
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="inProgress">In Progress</option>
                        <option value="ready">Ready</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabsContent>
        </Tabs>
      </div>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Login</DialogTitle>
          </DialogHeader>
          <Button onClick={() => setShowLoginDialog(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}