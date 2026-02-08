import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase'; 
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

// تم تصحيح المفتاح ووضعه داخل علامات الاقتباس لضمان نجاح البناء
const IMGBB_API_KEY = "718ce8f58f751f5738ac206b786525e5"; 

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  image?: string;
}

export default function Admin() {
  const { logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [showProductDialog, setShowProductDialog] = useState(false);
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) setImageUrl(data.data.url);
    } catch (err) { alert("خطأ في الرفع"); } finally { setUploading(false); }
  };

  const handleSaveProduct = async () => {
    if (!name || !price || !imageUrl) return alert("أكمل البيانات والصورة");
    setSaving(true);
    try {
      await addDoc(collection(db, "products"), { name, price: Number(price), stock: Number(stock), description, image: imageUrl, createdAt: new Date() });
      setShowProductDialog(false);
      fetchProducts();
      setName(""); setPrice(""); setStock(""); setDescription(""); setImageUrl(""); setImagePreview(null);
    } catch (err) { alert("خطأ في الحفظ"); } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-[#0F111A] text-white pt-24 px-4 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10 bg-[#1A1D29] p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <Shield className="text-[#007AFF] w-8 h-8" />
            <h1 className="text-2xl font-bold">لوحة تحكم دب فون</h1>
          </div>
          <button onClick={logout} className="text-red-400 hover:text-red-300 transition-colors">خروج</button>
        </div>

        <button 
          onClick={() => setShowProductDialog(true)}
          className="w-full bg-[#007AFF] hover:bg-[#0062CC] text-white py-4 rounded-xl font-bold mb-8 flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#007AFF]/20"
        >
          <Plus className="w-5 h-5" /> إضافة هاتف جديد للمتجر
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-[#1A1D29] rounded-2xl overflow-hidden border border-white/5 group">
              <div className="h-48 overflow-hidden">
                <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                <p className="text-[#007AFF] font-bold text-xl mb-4">{product.price} ريال</p>
                <button 
                  onClick={() => { if(confirm("حذف؟")) deleteDoc(doc(db, "products", product.id)).then(fetchProducts); }}
                  className="w-full bg-red-500/10 text-red-400 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> حذف من المتجر
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showProductDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1A1D29] w-full max-w-2xl rounded-3xl p-8 border border-white/10 relative">
            <button onClick={() => setShowProductDialog(false)} className="absolute top-4 left-4 text-white/40 hover:text-white">✕</button>
            <h2 className="text-xl font-bold mb-6 text-center">تفاصيل المنتج الجديد</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div 
                  onClick={() => document.getElementById('imgInp')?.click()}
                  className="border-2 border-dashed border-white/10 rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer bg-white/5 hover:border-[#007AFF]/50 overflow-hidden relative"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} className="w-full h-full object-cover" alt="" />
                      {uploading && <div className="absolute inset-0 bg-black/70 flex items-center justify-center"><Loader2 className="animate-spin text-[#007AFF]" /></div>}
                    </>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 text-white/20 mx-auto mb-2" />
                      <p className="text-sm text-white/40">اضغط لرفع الصورة</p>
                    </div>
                  )}
                </div>
                <input type="file" id="imgInp" hidden accept="image/*" onChange={handleImageUpload} />
              </div>

              <div className="space-y-4 text-black">
                <input placeholder="اسم الهاتف" value={name} onChange={(e)=>setName(e.target.value)} className="w-full bg-[#0F111A] text-white border border-white/10 rounded-xl p-3 outline-none focus:border-[#007AFF]" />
                <div className="flex gap-4">
                  <input type="number" placeholder="السعر" value={price} onChange={(e)=>setPrice(e.target.value)} className="w-full bg-[#0F111A] text-white border border-white/10 rounded-xl p-3 outline-none" />
                  <input type="number" placeholder="الكمية" value={stock} onChange={(e)=>setStock(e.target.value)} className="w-full bg-[#0F111A] text-white border border-white/10 rounded-xl p-3 outline-none" />
                </div>
                <textarea placeholder="الوصف..." value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full bg-[#0F111A] text-white border border-white/10 rounded-xl p-3 h-28 outline-none" />
                <button 
                  onClick={handleSaveProduct} 
                  disabled={uploading || saving}
                  className="w-full bg-[#007AFF] text-white py-4 rounded-xl font-bold disabled:opacity-50"
                >
                  {saving ? "جاري النشر..." : "حفظ ونشر الآن"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
