import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
// استخدام مسارات مباشرة لضمان العثور على الملفات
import { useAuth } from '../contexts/AuthContext'; 
import { db } from '../lib/firebase'; 
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

// المفتاح الخاص بك تم وضعه بشكل صحيح داخل علامات الاقتباس
const IMGBB_API_KEY = "718ce8f58f751f5738ac206b786525e5"; 

export default function Admin() {
  const { logout } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
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
      setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching:", error);
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
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) setImageUrl(data.data.url);
    } catch (error) {
      alert("خطأ في رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!name || !price || !imageUrl) return alert("الرجاء إكمال البيانات والصورة");
    setSaving(true);
    try {
      await addDoc(collection(db, "products"), {
        name,
        price: Number(price),
        stock: Number(stock),
        description,
        image: imageUrl,
        createdAt: new Date()
      });
      setShowProductDialog(false);
      fetchProducts();
      setName(""); setPrice(""); setImageUrl(""); setImagePreview(null);
    } catch (error) {
      alert("خطأ في الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F111A] text-white p-6" dir="rtl">
      <div className="max-w-4xl mx-auto pt-20">
        <div className="flex justify-between items-center bg-[#1A1D29] p-4 rounded-xl mb-6 border border-white/5">
          <div className="flex items-center gap-2">
            <Shield className="text-[#007AFF] w-6 h-6" />
            <h1 className="font-bold text-lg">لوحة تحكم دب فون</h1>
          </div>
          <button onClick={logout} className="text-red-400 text-sm hover:underline">خروج</button>
        </div>

        <button 
          onClick={() => setShowProductDialog(true)}
          className="w-full bg-[#007AFF] hover:bg-[#0062CC] py-4 rounded-xl font-bold mb-8 flex items-center justify-center gap-2 shadow-lg shadow-[#007AFF]/20"
        >
          <Plus className="w-5 h-5" /> إضافة هاتف جديد
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-[#1A1D29] rounded-2xl overflow-hidden border border-white/5">
              <img src={product.image} className="w-full h-48 object-cover" alt="" />
              <div className="p-4">
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-[#007AFF] font-bold text-xl mb-4">{product.price} ريال</p>
                <button 
                  onClick={async () => { if(confirm("حذف؟")) { await deleteDoc(doc(db, "products", product.id)); fetchProducts(); } }}
                  className="w-full bg-red-500/10 text-red-400 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 text-sm"
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
            <h2 className="text-xl font-bold mb-6 text-center text-white">إضافة منتج</h2>
            <div className="space-y-4">
              <div 
                onClick={() => document.getElementById('imgInp')?.click()}
                className="border-2 border-dashed border-white/10 rounded-xl h-44 flex flex-col items-center justify-center cursor-pointer bg-white/5 hover:border-[#007AFF]/50 overflow-hidden relative"
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} className="w-full h-full object-cover" alt="" />
                    {uploading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Loader2 className="animate-spin text-[#007AFF]" /></div>}
                  </>
                ) : (
                  <div className="text-center opacity-40">
                    <ImageIcon className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-xs">اضغط لرفع الصورة</p>
                  </div>
                )}
              </div>
              <input type="file" id="imgInp" hidden accept="image/*" onChange={handleImageUpload} />
              
              <input placeholder="اسم الهاتف" value={name} onChange={(e)=>setName(e.target.value)} className="w-full bg-[#0F111A] text-white border border-white/10 rounded-lg p-3 outline-none focus:border-[#007AFF]" />
              <div className="flex gap-2">
                <input type="number" placeholder="السعر" value={price} onChange={(e)=>setPrice(e.target.value)} className="w-full bg-[#0F111A] text-white border border-white/10 rounded-lg p-3 outline-none" />
                <input type="number" placeholder="الكمية" value={stock} onChange={(e)=>setStock(e.target.value)} className="w-full bg-[#0F111A] text-white border border-white/10 rounded-lg p-3 outline-none" />
              </div>
              <textarea placeholder="الوصف..." value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full bg-[#0F111A] text-white border border-white/10 rounded-lg p-3 h-24 outline-none" />
              
              <div className="flex gap-2 pt-2">
                <button onClick={handleSaveProduct} disabled={uploading || saving} className="flex-1 bg-[#007AFF] text-white py-3 rounded-lg font-bold disabled:opacity-50">
                  {saving ? "جاري الحفظ..." : "نشر المنتج"}
                </button>
                <button onClick={() => setShowProductDialog(false)} className="px-4 bg-white/5 text-white/60 py-3 rounded-lg hover:text-white">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
