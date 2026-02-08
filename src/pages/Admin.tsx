import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase'; 
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

// تم وضع المفتاح الخاص بك بشكل صحيح هنا
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
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(docs);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
      if (data.success) {
        setImageUrl(data.data.url);
      } else {
        alert("فشل رفع الصورة");
      }
    } catch (error) {
      alert("خطأ في الاتصال بسيرفر الصور");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!name || !price || !imageUrl) return alert("الرجاء إكمال البيانات وصورة المنتج");
    
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
      setName(""); setPrice(""); setStock(""); setDescription(""); setImageUrl(""); setImagePreview(null);
    } catch (error) {
      alert("خطأ في حفظ البيانات");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("هل أنت متأكد من الحذف؟")) {
      await deleteDoc(doc(db, "products", id));
      fetchProducts();
    }
  };

  return (
    <div className="min-h-screen bg-carbon pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="text-electric" /> لوحة تحكم دب فون
          </h1>
          <Button variant="outline" onClick={logout} className="text-red-400">خروج</Button>
        </div>

        <div className="carbon-card p-6">
          <Button onClick={() => setShowProductDialog(true)} className="bg-electric mb-8 w-full sm:w-auto text-white hover:bg-electric/80">
            <Plus className="w-4 h-4 mr-2" /> إضافة منتج جديد
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <img src={product.image} className="w-full h-48 object-cover" alt={product.name} />
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg">{product.name}</h3>
                  <p className="text-electric font-bold">{product.price} SAR</p>
                  <Button variant="ghost" onClick={() => handleDelete(product.id)} className="text-red-400 mt-4 w-full bg-red-500/5">
                    <Trash2 className="w-4 h-4 mr-2" /> حذف المنتج
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="bg-carbon border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-white">إضافة هاتف جديد</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-4">
              <Label className="text-white/70 text-right block w-full">صورة المنتج</Label>
              <div 
                onClick={() => document.getElementById('imgInput')?.click()}
                className="border-2 border-dashed border-white/10 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer bg-white/5 overflow-hidden"
              >
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <img src={imagePreview} className="w-full h-full object-cover" alt="" />
                    {uploading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Loader2 className="animate-spin text-electric" /></div>}
                  </div>
                ) : (
                  <ImageIcon className="w-12 h-12 text-white/20" />
                )}
              </div>
              <input type="file" id="imgInput" hidden accept="image/*" onChange={handleImageUpload} />
            </div>

            <div className="space-y-4">
              <Input placeholder="اسم الهاتف" value={name} onChange={(e)=>setName(e.target.value)} className="bg-white/5 border-white/10 text-white" />
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" placeholder="السعر" value={price} onChange={(e)=>setPrice(e.target.value)} className="bg-white/5 border-white/10 text-white" />
                <Input type="number" placeholder="الكمية" value={stock} onChange={(e)=>setStock(e.target.value)} className="bg-white/5 border-white/10 text-white" />
              </div>
              <textarea 
                placeholder="الوصف..." 
                value={description}
                onChange={(e)=>setDescription(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white h-32 focus:border-electric outline-none" 
              />
              <Button onClick={handleSaveProduct} disabled={uploading || saving} className="w-full bg-electric text-white py-6">
                {saving ? "جاري الحفظ..." : "حفظ ونشر المنتج"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
