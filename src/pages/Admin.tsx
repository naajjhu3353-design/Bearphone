import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
// تأكد أن المسارين بالأسفل صحيحيين في مشروعك
import { useAuth } from '../contexts/AuthContext'; 
import { db } from '../lib/firebase'; 
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const IMGBB_API_KEY = "718ce8f58f751f5738ac206b786525e5"; 

export default function Admin() {
  const { logout } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', stock: '', desc: '', img: '' });
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState({ upload: false, save: false });

  const refresh = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { refresh(); }, []);

  const upload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setLoading({ ...loading, upload: true });
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: fd });
      const data = await res.json();
      setForm({ ...form, img: data.data.url });
    } catch (err) { alert("خطأ في الرفع"); }
    setLoading({ ...loading, upload: false });
  };

  const save = async () => {
    if (!form.name || !form.img) return alert("أكمل البيانات");
    setLoading({ ...loading, save: true });
    await addDoc(collection(db, "products"), { ...form, price: Number(form.price), createdAt: new Date() });
    setShowProductDialog(false);
    refresh();
    setLoading({ ...loading, save: false });
  };

  return (
    <div className="min-h-screen bg-[#0F111A] text-white p-6" dir="rtl">
      <div className="max-w-4xl mx-auto pt-20">
        <div className="flex justify-between items-center bg-[#1A1D29] p-4 rounded-xl mb-6">
          <div className="flex items-center gap-2"><Shield className="text-blue-500" /> <h1 className="font-bold">لوحة تحكم دب فون</h1></div>
          <button onClick={logout} className="text-red-400 text-sm">خروج</button>
        </div>

        <button onClick={() => setShowProductDialog(true)} className="w-full bg-blue-600 py-4 rounded-xl font-bold mb-6">+ إضافة منتج جديد</button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-[#1A1D29] rounded-xl overflow-hidden border border-white/5 p-4">
              <img src={p.image || p.img} className="w-full h-40 object-cover rounded-lg mb-3" />
              <h3 className="font-bold">{p.name}</h3>
              <p className="text-blue-400 mb-3">{p.price} ريال</p>
              <button onClick={() => deleteDoc(doc(db, "products", p.id)).then(refresh)} className="text-red-500 text-xs flex items-center gap-1"><Trash2 size={14}/> حذف</button>
            </div>
          ))}
        </div>
      </div>

      {showProductDialog && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1A1D29] p-6 rounded-2xl w-full max-w-md">
            <h2 className="font-bold mb-4 text-center">إضافة منتج</h2>
            <div onClick={() => document.getElementById('f')?.click()} className="border-2 border-dashed border-white/10 h-40 rounded-xl mb-4 flex items-center justify-center cursor-pointer overflow-hidden">
              {preview ? <img src={preview} className="w-full h-full object-cover" /> : <ImageIcon className="opacity-20" />}
            </div>
            <input type="file" id="f" hidden onChange={upload} />
            <input placeholder="اسم الهاتف" className="w-full bg-[#0F111A] p-3 rounded-lg mb-2 border border-white/5" onChange={e => setForm({...form, name: e.target.value})} />
            <input placeholder="السعر" type="number" className="w-full bg-[#0F111A] p-3 rounded-lg mb-4 border border-white/5" onChange={e => setForm({...form, price: e.target.value})} />
            <button onClick={save} disabled={loading.upload || loading.save} className="w-full bg-blue-600 py-3 rounded-lg font-bold">
              {loading.save ? "جاري الحفظ..." : "نشر المنتج"}
            </button>
            <button onClick={() => setShowProductDialog(false)} className="w-full mt-2 text-sm opacity-50">إلغاء</button>
          </div>
        </div>
      )}
    </div>
  );
}
