import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Battery, HardDrive, Sparkles, ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: 'phone' | 'accessory';
  condition: 'new' | 'used';
  batteryHealth?: number;
  storage?: string;
  color?: string;
  images: string[];
  stock: number;
  description: string;
}

interface StoreProps {
  onNavigate: (page: string) => void;
}

export default function Store({  }: StoreProps) {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'phones' | 'accessories'>('all');
  const [conditionFilter, setConditionFilter] = useState<'all' | 'new' | 'used'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products from Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRef = collection(db, 'products');
        const snapshot = await getDocs(productsRef);
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Use dummy data for demo
        const dummyProducts: Product[] = [
          {
            id: '1',
            name: 'iPhone 15 Pro Max',
            price: 4999,
            originalPrice: 5499,
            category: 'phone',
            condition: 'new',
            batteryHealth: 100,
            storage: '256GB',
            color: 'Natural Titanium',
            images: ['https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500'],
            stock: 5,
            description: 'Latest iPhone with A17 Pro chip',
          },
          {
            id: '2',
            name: 'iPhone 14 Pro',
            price: 3499,
            category: 'phone',
            condition: 'used',
            batteryHealth: 92,
            storage: '128GB',
            color: 'Deep Purple',
            images: ['https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=500'],
            stock: 3,
            description: 'Excellent condition, like new',
          },
          {
            id: '3',
            name: 'Samsung Galaxy S24 Ultra',
            price: 4599,
            category: 'phone',
            condition: 'new',
            batteryHealth: 100,
            storage: '512GB',
            color: 'Titanium Gray',
            images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500'],
            stock: 0,
            description: 'Flagship Android phone',
          },
          {
            id: '4',
            name: 'AirPods Pro 2',
            price: 899,
            category: 'accessory',
            condition: 'new',
            images: ['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500'],
            stock: 10,
            description: 'Active noise cancellation',
          },
          {
            id: '5',
            name: 'MagSafe Charger',
            price: 199,
            category: 'accessory',
            condition: 'new',
            images: ['https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500'],
            stock: 15,
            description: 'Wireless charging pad',
          },
          {
            id: '6',
            name: 'iPhone 13',
            price: 2199,
            category: 'phone',
            condition: 'used',
            batteryHealth: 88,
            storage: '128GB',
            color: 'Midnight',
            images: ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=500'],
            stock: 2,
            description: 'Great condition',
          },
        ];
        setProducts(dummyProducts);
        setFilteredProducts(dummyProducts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products
  useEffect(() => {
    let filtered = products;

    if (activeTab !== 'all') {
      filtered = filtered.filter(p => 
        activeTab === 'phones' ? p.category === 'phone' : p.category === 'accessory'
      );
    }

    if (conditionFilter !== 'all') {
      filtered = filtered.filter(p => p.condition === conditionFilter);
    }

    setFilteredProducts(filtered);
  }, [activeTab, conditionFilter, products]);

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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {t('store.title')}
          </h2>
          <div className="w-24 h-1 bg-electric mx-auto rounded-full glow-blue" />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8"
        >
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="bg-carbon-light border border-white/10">
              <TabsTrigger value="all" className="data-[state=active]:bg-electric">
                {t('nav.store')}
              </TabsTrigger>
              <TabsTrigger value="phones" className="data-[state=active]:bg-electric">
                {t('nav.phones')}
              </TabsTrigger>
              <TabsTrigger value="accessories" className="data-[state=active]:bg-electric">
                {t('nav.accessories')}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-electric" />
            <div className="flex gap-2">
              {(['all', 'new', 'used'] as const).map((condition) => (
                <Button
                  key={condition}
                  size="sm"
                  variant={conditionFilter === condition ? 'default' : 'outline'}
                  onClick={() => setConditionFilter(condition)}
                  className={conditionFilter === condition ? 'bg-electric' : 'border-white/20'}
                >
                  {condition === 'all' ? t('common.filter') : t(`store.${condition}`)}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="carbon-card p-4 animate-pulse">
                <div className="aspect-square bg-white/5 rounded-lg mb-4" />
                <div className="h-6 bg-white/5 rounded mb-2" />
                <div className="h-4 bg-white/5 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/60 text-lg">{t('store.noProducts')}</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  layout
                  whileHover={{ y: -5 }}
                  className="carbon-card overflow-hidden group"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <Badge
                        className={`${
                          product.condition === 'new'
                            ? 'bg-green-500/80'
                            : 'bg-amber-500/80'
                        } text-white`}
                      >
                        {product.condition === 'new' ? (
                          <Sparkles className="w-3 h-3 mr-1" />
                        ) : null}
                        {t(`store.${product.condition}`)}
                      </Badge>
                      {product.stock === 0 && (
                        <Badge className="bg-red-500/80 text-white">
                          {t('store.outOfStock')}
                        </Badge>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute inset-0 bg-carbon/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <Button
                        size="sm"
                        className="bg-electric hover:bg-electric-light"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {t('store.buyNow')}
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    
                    {/* Specs */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {product.storage && (
                        <span className="text-xs text-white/60 flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          {product.storage}
                        </span>
                      )}
                      {product.batteryHealth && (
                        <span className="text-xs text-white/60 flex items-center gap-1">
                          <Battery className="w-3 h-3" />
                          {product.batteryHealth}%
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-electric">
                          {product.price} SAR
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-white/40 line-through">
                            {product.originalPrice} SAR
                          </span>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="outline"
                        className="border-electric text-electric hover:bg-electric hover:text-white"
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}
