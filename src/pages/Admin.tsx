import { useState, useEffect } from 'react';
import { Shield, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; 
import { db } from '../lib/firebase'; 
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function Admin() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSave = async () => {
    if (!name || !price || !imageUrl) {
      alert('الرجاء ملء جميع الحقول');
      return;
    }

    try {
      await addDoc(collection(db, 'products'), {
        name,
        price: parseFloat(price),
        image: imageUrl,
        createdAt: new Date()
      });
      
      setName('');
      setPrice('');
      setImageUrl('');
      setShowDialog(false);
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('حدث خطأ أثناء إضافة المنتج');
    }
  };

  const handleDelete = async (productId) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('حدث خطأ أثناء حذف المنتج');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0F111A] text-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Shield className="text-[#007AFF]" size={32} />
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
        </div>

        <button 
          onClick={() => setShowDialog(true)}
          className="w-full bg-[#007AFF] hover:bg-[#0062CC] py-4 rounded-xl font-bold mb-8 shadow-lg shadow-[#007AFF]/20 transition-all"
        >
          + إضافة هاتف جديد
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <div 
              key={p.id} 
              className="bg-[#1A1D29] rounded-2xl overflow-hidden border border-white/5 p-4 shadow-xl hover:border-white/10 transition-all"
            >
              <img 
                src={p.image} 
                className="w-full h-48 object-cover rounded-xl mb-4 bg-black/20" 
                alt={p.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                }}
              />
              <h3 className="font-bold text-lg mb-1">{p.name}</h3>
              <p className="text-[#007AFF] font-bold text-xl mb-4">{p.price} ريال</p>
              <button 
                onClick={() => handleDelete(p.id)}
                className="text-red-400 text-sm flex items-center justify-center gap-2 bg-red-500/5 hover:bg-red-500/10 w-full py-2 rounded-lg transition-all"
              >
                <Trash2 size={16}/> حذف المنتج
              </button>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12 text-white/40">
            <p>لا توجد منتجات حالياً</p>
            <p className="text-sm mt-2">اضغط على الزر أعلاه لإضافة منتج جديد</p>
          </div>
        )}
      </div>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1A1D29] w-full max-w-md rounded-2xl p-6 border border-white/10 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-center">تفاصيل المنتج</h2>
            <div className="space-y-4">
              <input 
                placeholder="اسم الهاتف" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full bg-[#0F111A] text-white border border-white/10 rounded-lg p-3 outline-none focus:border-[#007AFF] transition-colors" 
              />
              <input 
                type="number" 
                placeholder="السعر" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                className="w-full bg-[#0F111A] text-white border border-white/10 rounded-lg p-3 outline-none focus:border-[#007AFF] transition-colors" 
              />
              <input 
                placeholder="رابط الصورة المباشر (URL)" 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)} 
                className="w-full bg-[#0F111A] text-white border border-white/10 rounded-lg p-3 outline-none focus:border-[#007AFF] transition-colors" 
              />
              <p className="text-[10px] text-white/30 text-center italic">
                ارفع الصورة يدوياً على أي موقع رفع صور وضع الرابط هنا
              </p>
              <button 
                onClick={handleSave} 
                className="w-full bg-[#007AFF] hover:bg-[#0062CC] text-white py-3 rounded-lg font-bold shadow-lg shadow-[#007AFF]/20 transition-all"
              >
                نشر في المتجر
              </button>
              <button 
                onClick={() => {
                  setShowDialog(false);
                  setName('');
                  setPrice('');
                  setImageUrl('');
                }} 
                className="w-full text-white/40 hover:text-white/60 text-sm py-2 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}