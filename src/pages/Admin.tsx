import { useState, useEffect } from 'react';
import { Shield, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
// تصحيح المسارات بناءً على هيكلة مجلداتك الحقيقية
import { useAuth } from '../contexts/AuthContext'; 
import { db } from '../lib/firebase'; 
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

// المفتاح الخاص بك موضوع بشكل صحيح
const IMGBB_API_KEY = "718ce8f58f751f5738ac206b786525e5"; 

export default function Admin() {
  const { logout } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [showProductDialog, setShowProductDialog] = useState(false);
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      setProducts(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleImageUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) setImageUrl(data.data.url);
    } catch (err) { alert("خطأ في الرفع"); } finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!name || !price || !imageUrl) return alert("أكمل البيانات والصورة");
    setSaving(true);
    try {
      await addDoc(collection(db, "products"), {
        name,
        price: Number(price),
        image: imageUrl,
        createdAt: new Date()
      });
      setShowProductDialog(false);
      fetchProducts();
      setName(""); setPrice(""); setImageUrl(""); setImagePreview(null);
    } catch (e) { alert("خطأ في الحفظ"); } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-[#0F111A] text-white p-6" dir="rtl">
      <div className="max-w-4xl mx-auto pt-20">
        <div className="flex justify-between items-center bg-[#1A1D29] p-4 rounded-xl mb-6 border border-white/5">
          <div className="flex items-center gap-2">
            <Shield className="text-[#007AFF] w-6 h-6" />
            <h1 className="font-bold">لوحة تحكم دب فون</h1>
          </div>
          <button onClick={logout} className="text-red-400 text-sm">خروج</button>
        </div>

        <button 
          onClick={() => setShowProductDialog(true)} 
          className="w-full bg-[#007AFF] py-4 rounded-xl font-bold mb-8 shadow-lg shadow-[#007AFF]/20"
        >
          + إضافة هاتف جديد
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {products.map(p => (
            <div key={p.id} className="bg-[#1A1D29] rounded-2xl overflow-hidden border border-white/5 p-4">
              <img src={p.image} className="w-full h-48 object-cover rounded-xl mb-4" alt="" />
              <h3 className="font-bold text-lg">{p.name}</h3>
              <p className="text-[#007AFF] font-bold text-xl mb-4">{p.price} ريال</p>
              <button 
                onClick={async () => { if(confirm("حذف؟")) { await deleteDoc(doc(db, "products", p.id)); fetchProducts(); } }} 
                className="text-red-400 flex items-center gap-2 text-sm bg-red-500/5 p-2 rounded-lg w-full justify-center"
              >
                <Trash2 size={16}/> حذف المنتج
              </button>
            </div>
          ))}
        </div>
      </div>

      {showProductDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#1A1D29] w-full max-w-md rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold mb-6 text-center">تفاصيل الهاتف</h2>
            <div className="space-y-4">
              <div 
                onClick={() => document.getElementById('imgInp')?.click()} 
                className="border-2 border-dashed border-white/10 rounded-xl h-44 flex items-center justify-center cursor-pointer bg-white/5 overflow-hidden relative"
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} className="w-full h-full object-cover" alt="" />
                    {uploading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Loader2 className="animate-spin text-[#007AFF]" /></div>}
                  </>
                ) : (
                  <ImageIcon className="opacity-20 w-10 h-10" />
                )}
              </div>
              <input type="file" id="imgInp" hidden accept="image/*" onChange={handleImageUpload} />
              
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
              
              <button 
                onClick={handleSave} 
                disabled={uploading || saving}
                className="w-full bg-[#007AFF] text-white py-3 rounded-lg font-bold disabled:opacity-50"
              >
                {saving ? "جاري الحفظ..." : "نشر المنتج الآن"}
              </button>
              
              <button onClick={() => setShowProductDialog(false)} className="w-full text-white/40 text-sm py-2">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
