import { useState, useEffect } from 'react';
import { Shield, Trash2, Image as ImageIcon } from 'lucide-react';
// المسارات المباشرة لضمان العثور على الملفات في Vercel
import { useAuth } from '../contexts/AuthContext'; 
import { db } from '../lib/firebase'; 
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function Admin() {
  const { logout } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [showProductDialog, setShowProductDialog] = useState(false);
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(docs);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveProduct = async () => {
    if (!name || !price || !imageUrl) return alert("الرجاء إكمال البيانات وصورة المنتج");
    
    try {
      await addDoc(collection(db, "products"), {
        name,
        price: Number(price),
        image: imageUrl,
        createdAt: new Date()
      });
      
      setShowProductDialog(false);
      fetchProducts();
      setName(""); setPrice(""); setImageUrl("");
    } catch (error) {
      alert("خطأ في الحفظ");
    }
  };

  return (
    <div className="min-h-screen bg-[#0F111A] text-white pt-24 pb-12 px-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-[#1A1D29] p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <Shield className="text-[#007AFF] w-8 h-8" />
            <h1 className="text-2xl font-bold">لوحة تحكم دب فون</h1>
          </div>
          <button onClick={logout} className="text-red-400 hover:text-red-300">خروج</button>
        </div>

        <button 
          onClick={() => setShowProductDialog(true)} 
          className="bg-[#007AFF] hover:bg-[#007AFF]/80 text-white px-8 py-3 rounded-xl font-bold mb-8 transition-all"
        >
          + إضافة منتج جديد
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-[#1A1D29] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <img src={product.image} className="w-full h-48 object-cover" alt="" />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                <p className="text-[#007AFF] font-bold text-xl mb-4">{product.price} ريال</p>
                <button 
                  onClick={() => { if(confirm("هل أنت متأكد؟")) deleteDoc(doc(db, "products", product.id)).then(fetchProducts); }} 
                  className="text-red-400 w-full bg-red-500/10 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> حذف المنتج
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showProductDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1A1D29] w-full max-w-md rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold mb-6 text-center text-white font-sans">إضافة هاتف جديد</h2>
            <div className="space-y-4">
              <input 
                placeholder="اسم الهاتف" 
                value={name} 
                onChange={(e)=>setName(e.target.value)} 
                className="w-full bg-[#0F111A] text-white border border-white/10 rounded-lg p-3 outline-none focus:border-[#007AFF]" 
              />
              <input 
                type="number" 
                placeholder="السعر" 
                value={price} 
                onChange={(e)=>setPrice(e.target.value)} 
                className="w-full bg-[#0F111A] text-white border border-white/10 rounded-lg p-3 outline-none" 
              />
              <div className="space-y-2">
                <label className="text-xs text-white/50 px-1">رابط صورة المنتج (URL)</label>
                <input 
                  placeholder="https://..." 
                  value={imageUrl} 
                  onChange={(e)=>setImageUrl(e.target.value)} 
                  className="w-full bg-[#0F111A] text-white border border-white/10 rounded-lg p-3 outline-none" 
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <button onClick={handleSaveProduct} className="flex-1 bg-[#007AFF] text-white py-3 rounded-lg font-bold">حفظ ونشر</button>
                <button onClick={() => setShowProductDialog(false)} className="px-4 bg-white/5 text-white/60 py-3 rounded-lg">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}