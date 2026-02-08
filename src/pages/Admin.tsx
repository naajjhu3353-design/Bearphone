import { useState, useEffect } from 'react';
import { Shield, Trash2, Image as ImageIcon } from 'lucide-react';
// المسارات المباشرة لضمان نجاح البناء في Vercel
import { useAuth } from '../contexts/AuthContext'; 
import { db } from '../lib/firebase'; 
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function Admin() {
  const { logout } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const fetchProducts = async () => {
    try {
      const snap = await getDocs(collection(db, "products"));
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSave = async () => {
    if (!name || !price || !imageUrl) return alert("أكمل البيانات والصورة");
    try {
      await addDoc(collection(db, "products"), { name, price: Number(price), image: imageUrl, createdAt: new Date() });
      setShowDialog(false);
      fetchProducts();
      setName(""); setPrice(""); setImageUrl("");
    } catch (e) { alert("خطأ في الحفظ"); }
  };

  return (
    <div className="min-h-screen bg-[#0F111A] text-white p-6" dir="rtl">
      <div className="max-w-4xl mx-auto pt-20">
        <div className="flex justify-between items-center bg-[#1A1D29] p-4 rounded-xl mb-8 border border-white/5">
          <div className="flex items-center gap-2"><Shield className="text-[#007AFF]" /><h1 className="font-bold">لوحة تحكم دب فون</h1></div>
          <button onClick={logout} className="text-red-400 text-sm">خروج</button>
        </div>
        <button onClick={() => setShowDialog(true)} className="w-full bg-[#007AFF] py-4 rounded-xl font-bold mb-8">+ إضافة منتج جديد</button>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {products.map(p => (
            <div key={p.id} className="bg-[#1A1D29] rounded-2xl overflow-hidden border border-white/5 p-4">
              <img src={p.image} className="w-full h-48 object-cover rounded-xl mb-4" alt="" />
              <h3 className="font-bold text-lg">{p.name}</h3>
              <p className="text-[#007AFF] font-bold text-xl mb-4">{p.price} ريال</p>
              <button onClick={() => {if(confirm("حذف؟")) deleteDoc(doc(db, "products", p.id)).then(fetchProducts)}} className="text-red-400 text-sm flex items-center gap-1"><Trash2 size={16}/> حذف المنتج</button>
            </div>
          ))}
        </div>
      </div>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-[#1A1D29] w-full max-w-md rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold mb-6 text-center text-white">إضافة منتج</h2>
            <div className="space-y-4">
              <input placeholder="اسم الهاتف" value={name} onChange={(e)=>setName(e.target.value)} className="w-full bg-[#0F111A] text-white border border-white/10 rounded-lg p-3 outline-none" />
              <input type="number" placeholder="السعر" value={price} onChange={(e)=>setPrice(e.target.value)} className="w-full bg-[#0F111A] text-white border border-white/10 rounded-lg p-3 outline-none" />
              <input placeholder="رابط الصورة (URL)" value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} className="w-full bg-[#0F111A] text-white border border-white/10 rounded-lg p-3 outline-none" />
              <button onClick={handleSave} className="w-full bg-[#007AFF] text-white py-3 rounded-lg font-bold">حفظ ونشر</button>
              <button onClick={() => setShowDialog(false)} className="w-full text-white/40 text-sm">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
