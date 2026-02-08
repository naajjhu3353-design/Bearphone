import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Shield, LogOut, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  image?: string;
}

export default function Admin() {
  const { t } = useTranslation();
  const { isAdmin, logout } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [showProductDialog, setShowProductDialog] = useState(false);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const fetchProducts = async () => {
    try {
      const snap = await getDocs(collection(db, 'products'));
      const docs = snap.docs.map(
        d => ({ id: d.id, ...d.data() } as Product)
      );
      setProducts(docs);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchProducts();
  }, [isAdmin]);

  const handleSaveProduct = async () => {
    if (!name || !price) {
      alert('الرجاء إكمال البيانات الأساسية');
      return;
    }

    try {
      await addDoc(collection(db, 'products'), {
        name,
        price: Number(price),
        stock: Number(stock),
        description,
        image:
          imageUrl ||
          'https://placehold.co/400x400/0f111a/007aff?text=No+Image',
        createdAt: new Date()
      });

      setShowProductDialog(false);
      fetchProducts();

      setName('');
      setPrice('');
      setStock('');
      setDescription('');
      setImageUrl('');
    } catch {
      alert('خطأ في الحفظ');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirmDelete') || 'هل أنت متأكد؟')) {
      await deleteDoc(doc(db, 'products', id));
      fetchProducts();
    }
  };

  return (
    <div className="min-h-screen bg-carbon pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="text-electric" />
            {t('admin.title')}
          </h1>

          <Button
            variant="outline"
            onClick={logout}
            className="text-red-400 border-red-500/30"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('nav.logout')}
          </Button>
        </div>

        <div className="carbon-card p-6 bg-white/5 rounded-2xl border border-white/10">
          <Button
            onClick={() => setShowProductDialog(true)}
            className="bg-electric mb-8"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('admin.addProduct')}
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />

                <div className="p-4">
                  <h3 className="text-white font-bold text-lg">
                    {product.name}
                  </h3>
                  <p className="text-electric font-bold">
                    {product.price} SAR
                  </p>

                  <Button
                    variant="ghost"
                    onClick={() => handleDelete(product.id)}
                    className="text-red-400 mt-4 w-full bg-red-500/5 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('common.actions')}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="bg-carbon border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {t('admin.addProduct')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-white/70">
                {t('admin.productForm.name')}
              </Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">
                  {t('common.price')}
                </Label>
                <Input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label className="text-white/70">
                  {t('admin.productForm.stock')}
                </Label>
                <Input
                  type="number"
                  value={stock}
                  onChange={e => setStock(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-white/70">
                رابط صورة المنتج (URL)
              </Label>
              <Input
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <Label className="text-white/70">
                {t('admin.productForm.description')}
              </Label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white h-24"
              />
            </div>

            <Button
              onClick={handleSaveProduct}
              className="w-full bg-electric text-white"
            >
              {t('common.save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}