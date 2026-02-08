import { useState, useEffect } from 'react';
import { Shield, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';

/* =========================
   Environment Variable
========================= */
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY as string;

if (!IMGBB_API_KEY) {
  throw new Error('VITE_IMGBB_API_KEY is missing');
}

/* =========================
   Types
========================= */
type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};

/* =========================
   Component
========================= */
export default function Admin() {
  const { logout } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [showProductDialog, setShowProductDialog] = useState(false);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  /* =========================
     Fetch Products
  ========================= */
  const fetchProducts = async () => {
    try {
      const snap = await getDocs(collection(db, 'products'));
      const data: Product[] = snap.docs.map(docu => ({
        id: docu.id,
        ...(docu.data() as Omit<Product, 'id'>),
      }));
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* =========================
     Image Upload
  ========================= */
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await res.json();

      if (!data.success) {
        throw new Error('Upload failed');
      }

      setImageUrl(data.data.url);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  /* =========================
     Save Product
  ========================= */
  const handleSave = async () => {
    if (!name || !price || !imageUrl) {
      alert('يرجى إدخال جميع البيانات');
      return;
    }

    setSaving(true);

    try {
      await addDoc(collection(db, 'products'), {
        name,
        price: Number(price),
        image: imageUrl,
        createdAt: Timestamp.now(),
      });

      setShowProductDialog(false);
      setName('');
      setPrice('');
      setImageUrl('');
      setImagePreview(null);

      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen bg-[#0F111A] text-white p-6" dir="rtl">
      <div className="max-w-4xl mx-auto pt-20">
        {/* Header */}
        <div className="flex justify-between items-center bg-[#1A1D29] p-4 rounded-xl mb-6 border border-white/5">
          <div className="flex items-center gap-2">
            <Shield className="text-[#007AFF] w-6 h-6" />
            <h1 className="font-bold">لوحة تحكم دب فون</h1>
          </div>
          <button onClick={logout} className="text-red-400 text-sm">
            خروج
          </button>
        </div>

        {/* Add Product */}
        <button
          onClick={() => setShowProductDialog(true)}
          className="w-full bg-[#007AFF] py-4 rounded-xl font-bold mb-8 shadow-lg shadow-[#007AFF]/20"
        >
          + إضافة هاتف جديد
        </button>

        {/* Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {products.map(p => (
            <div
              key={p.id}
              className="bg-[#1A1D29] rounded-2xl overflow-hidden border border-white/5 p-4"
            >
              <img
                src={p.image}
                className="w-full h-48 object-cover rounded-xl mb-4"
                alt={p.name}
              />
              <h3 className="font-bold text-lg">{p.name}</h3>
              <p className="text-[#007AFF] font-bold text-xl mb-4">
                {p.price} ريال
              </p>

              <button
                onClick={async () => {
                  if (confirm('هل أنت متأكد من حذف المنتج؟')) {
                    await deleteDoc(doc(db, 'products', p.id));
                    fetchProducts();
                  }
                }}
                className="text-red-400 flex items-center gap-2 text-sm bg-red-500/5 p-2 rounded-lg w-full justify-center"
              >
                <Trash2 size={16} />
                حذف المنتج
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dialog */}
      {showProductDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#1A1D29] w-full max-w-md rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold mb-6 text-center">
              تفاصيل الهاتف
            </h2>

            <div className="space-y-4">
              {/* Image */}
              <div
                onClick={() =>
                  document.getElementById('imgInp')?.click()
                }
                className="border-2 border-dashed border-white/10 rounded-xl h-44 flex items-center justify-center cursor-pointer bg-white/5 overflow-hidden relative"
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      className="w-full h-full object-cover"
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="animate-spin text-[#007AFF]" />
                      </div>
                    )}
                  </>
                ) : (
                  <ImageIcon className="opacity-20 w-10 h-10" />
                )}
              </div>

              <input
                id="imgInp"
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />

              <input
                placeholder="اسم الهاتف"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#0F111A] text-white border border-white/10 rounded-lg p-3 outline-none focus:border-[#007AFF]"
              />

              <input
                type="number"
                placeholder="السعر"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full bg-[#0F111A] text-white border border-white/10 rounded-lg p-3 outline-none"
              />

              <button
                onClick={handleSave}
                disabled={uploading || saving}
                className="w-full bg-[#007AFF] text-white py-3 rounded-lg font-bold disabled:opacity-50"
              >
                {saving ? 'جاري الحفظ...' : 'نشر المنتج الآن'}
              </button>

              <button
                onClick={() => setShowProductDialog(false)}
                className="w-full text-white/40 text-sm py-2"
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