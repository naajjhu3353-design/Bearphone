import { useState, useEffect } from 'react';
import { Shield, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/authContext'; // ✅ مسار مصحح
import { db } from '../config/firebase';          // ✅ مسار مصحح
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

/* =========================
   TEMP: IMGBB KEY
========================= */
const IMGBB_API_KEY = '718ce8f58f751f5738ac206b786525e5';

/* =========================
   Component
========================= */
export default function Admin() {
  const { logout } = useAuth();

  const [products, setProducts] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState({
    upload: false,
    save: false,
  });

  /* =========================
     Fetch Products
  ========================= */
  const fetchProducts = async () => {
    try {
      const snap = await getDocs(collection(db, 'products'));
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* =========================
     Upload Image
  ========================= */
  const handleUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setLoading(prev => ({ ...prev, upload: true }));

    const fd = new FormData();
    fd.append('image', file);

    try {
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
          method: 'POST',
          body: fd,
        }
      );

      const data = await res.json();
      if (data.success) {
        setImageUrl(data.data.url);
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('خطأ أثناء رفع الصورة');
    } finally {
      setLoading(prev => ({ ...prev, upload: false }));
    }
  };

  /* =========================
     Save Product
  ========================= */
  const handleSave = async () => {
    if (!name || !price || !imageUrl) {
      alert('أكمل جميع البيانات');
      return;
    }

    setLoading(prev => ({ ...prev, save: true }));

    try {
      await addDoc(collection(db, 'products'), {
        name,
        price: Number(price),
        image: imageUrl,
        createdAt: new Date(),
      });

      setShowDialog(false);
      setName('');
      setPrice('');
      setImageUrl('');
      setPreview(null);

      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('خطأ أثناء حفظ المنتج');
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen bg-[#0F111A] text-white p-6" dir="rtl">
      <div className="max-w-4xl mx-auto pt-20">
        {/* Header */}
        <div className="flex justify-between items-center bg-[#1A1D29] p-5 rounded-2xl mb-8 border border-white/5">
          <div className="flex items-center gap-3">
            <Shield className="text-[#007AFF] w-7 h-7" />
            <h1 className="text-xl font-bold">لوحة تحكم دب فون</h1>
          </div>
          <button
            onClick={logout}
            className="text-red-400 font-medium hover:text-red-300"
          >
            خروج
          </button>
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowDialog(true)}
          className="w-full bg-[#007AFF] hover:bg-[#0062CC] py-4 rounded-2xl font-bold mb-10 shadow-lg shadow-[#007AFF]/20 flex items-center justify-center gap-2"
        >
          <PlusIcon /> إضافة هاتف جديد
        </button>

        {/* Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {products.map(p => (
            <div
              key={p.id}
              className="bg-[#1A1D29] rounded-3xl border border-white/5 p-4"
            >
              <img
                src={p.image}
                className="w-full h-52 object-cover rounded-2xl mb-4"
              />
              <h3 className="font-bold text-lg">{p.name}</h3>
              <p className="text-[#007AFF] font-black text-xl mb-4">
                {p.price} ريال
              </p>
              <button
                onClick={async () => {
                  if (confirm('حذف المنتج؟')) {
                    await deleteDoc(doc(db, 'products', p.id));
                    fetchProducts();
                  }
                }}
                className="bg-red-500/10 p-2 rounded-xl text-red-400 hover:bg-red-500 hover:text-white w-full flex justify-center gap-2"
              >
                <Trash2 size={18} /> حذف
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="bg-[#1A1D29] w-full max-w-md rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold mb-6 text-center">
              إضافة منتج جديد
            </h2>

            <div className="space-y-5">
              <div
                onClick={() =>
                  document.getElementById('imgInp')?.click()
                }
                className="border-2 border-dashed border-white/10 rounded-2xl h-48 flex items-center justify-center cursor-pointer relative overflow-hidden"
              >
                {preview ? (
                  <>
                    <img
                      src={preview}
                      className="w-full h-full object-cover"
                    />
                    {loading.upload && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="animate-spin text-[#007AFF]" />
                      </div>
                    )}
                  </>
                ) : (
                  <ImageIcon className="opacity-20 w-12 h-12" />
                )}
              </div>

              <input
                id="imgInp"
                type="file"
                hidden
                accept="image/*"
                onChange={handleUpload}
              />

              <input
                placeholder="اسم الهاتف"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#0F111A] p-4 rounded-2xl border border-white/10"
              />

              <input
                type="number"
                placeholder="السعر"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full bg-[#0F111A] p-4 rounded-2xl border border-white/10"
              />

              <button
                onClick={handleSave}
                disabled={loading.upload || loading.save}
                className="w-full bg-[#007AFF] py-4 rounded-2xl font-bold disabled:opacity-50"
              >
                {loading.save ? 'جاري الحفظ...' : 'نشر المنتج'}
              </button>

              <button
                onClick={() => setShowDialog(false)}
                className="w-full text-white/40 text-sm"
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

/* =========================
   Plus Icon
========================= */
function PlusIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}