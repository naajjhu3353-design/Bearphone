import { useState, useEffect } from 'react';
import { Shield, Trash2 } from 'lucide-react';
// استخدام مسارات مباشرة للتأكد من أن Vercel يجد الملفات
import { useAuth } from '../contexts/AuthContext'; 
import { db } from '../lib/firebase'; 
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function Admin() {
  import { useAuth } from '../contexts/AuthContext'; 
import { db } from '../lib/firebase'; 
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
 
          className="w-full bg-[#007AFF] hover:bg-[#0062CC] py-4 rounded-xl font-bold mb-8 shadow-lg shadow-[#007AFF]/20 transition-all"
        >
          + إضافة هاتف جديد
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {products.map(p => (
            <div key={p.id} className="bg-[#1A1D29] rounded-2xl overflow-hidden border border-white/5 p-4 shadow-xl">
              <img src={p.image} className="w-full h-48 object-cover rounded-xl mb-4 bg-black/20" alt="" />
              <h3 className="font-bold text-lg mb-1">{p.name}</h3>
              <p className="text-[#007AFF] font-bold text-xl mb-4">{p.price} ريال</p>
              <button 
                onClick={async () => { if(confirm("حذف؟")) { await deleteDoc(doc(db, "products", p.id)); fetchProducts(); } }} 
                className="text-red-400 text-sm flex items-center justify-center gap-2 bg-red-500/5 w-full py-2 rounded-lg"
              >
                <Trash2 size={16}/> حذف المنتج
              </button>
            </div>
          ))}
        </div>
      </div>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1A1D29] w-full max-w-md rounded-2xl p-6 border border-white/10 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-center">تفاصيل المنتج</h2>
            <div className="space-y-4">
              <input placeholder="اسم الهاتف" value={name} onChange={(e)=>setName(e.target.value)} className="w-full bg-[#0F111A] text-white border border-white/10 rounded-lg p-3 outline-none focus:border-[#007AFF]" />
              <input type="number" placeholder="السعر" value={price} onChange={(e)=>setPrice(e.target.value)} className="w-full bg-[#0F111A] text-white border border-white/10 rounded-lg p-3 outline-none" />
              <input placeholder="رابط الصورة المباشر (URL)" value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} className="w-full bg-[#0F111A] text-white border border-white/10 rounded-lg p-3 outline-none" />
              <p className="text-[10px] text-white/30 text-center italic">ارفع الصورة يدوياً على أي موقع رفع صور وضع الرابط هنا</p>
              <button onClick={handleSave} className="w-full bg-[#007AFF] text-white py-3 rounded-lg font-bold shadow-lg shadow-[#007AFF]/20">نشر في المتجر</button>
              <button onClick={() => setShowDialog(false)} className="w-full text-white/40 text-sm py-2">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
