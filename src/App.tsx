import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
import { createContext, useContext, ReactNode, useState, useEffect } from "react";

interface AuthContextType {
  currentUser: any;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(null);

  const login = () => setCurrentUser({ name: "Admin" });
  const logout = () => setCurrentUser(null);

  useEffect(() => {
    // محاكاة تسجيل دخول تلقائي عند التحميل
    setCurrentUser({ name: "Admin" });
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
import { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, getDocs, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/authContext";
import { Trash2, Loader2, Plus } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export default function Admin() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", imageUrl: "" });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "products"));
      const data: Product[] = snapshot.docs.map(docu => ({ id: docu.id, ...docu.data() } as Product));
      setProducts(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImageToImgbb = async (file: File): Promise<string> => {
    if (!IMGBB_API_KEY) throw new Error("IMGBB API key missing");
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setUploading(false);

    if (!data.success) throw new Error("Image upload failed");
    return data.data.url;
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !selectedImage) {
      setError("Fill all fields and select image");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const imageUrl = await uploadImageToImgbb(selectedImage);

      await addDoc(collection(db, "products"), {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        imageUrl,
        createdAt: new Date().toISOString(),
      });

      setSuccess("Product added!");
      setNewProduct({ name: "", price: "", imageUrl: "" });
      setSelectedImage(null);
      setImagePreview("");
      fetchProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to add product");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      setSuccess("Product deleted!");
      fetchProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to delete product");
    }
  };

  if (!currentUser)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <p>Please login to access admin panel.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="p-3 mb-4 bg-green-100 text-green-700 rounded">{success}</div>}

      {/* Add Product */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Product
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Product Name"
            value={newProduct.name}
            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
            className="p-2 border rounded w-full"
          />
          <input
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
            className="p-2 border rounded w-full"
          />
        </div>

        <div className="mb-4">
          <input type="file" accept="image/*" onChange={handleImageSelect} />
          {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />}
        </div>

        <button
          onClick={handleAddProduct}
          disabled={saving || uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add Product"}
        </button>
      </div>

      {/* Products List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Products ({products.length})</h2>
        {loading ? (
          <Loader2 className="animate-spin w-6 h-6" />
        ) : products.length === 0 ? (
          <p>No products yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(p => (
              <div key={p.id} className="border p-4 rounded shadow hover:shadow-lg transition">
                <img src={p.imageUrl} alt={p.name} className="w-full h-40 object-cover mb-2 rounded" />
                <h3 className="font-bold">{p.name}</h3>
                <p className="text-blue-600 font-semibold">${p.price.toFixed(2)}</p>
                <button
                  onClick={() => handleDeleteProduct(p.id)}
                  className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete <Trash2 className="inline w-4 h-4 ml-1" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "./contexts/authContext";
import Admin from "./pages/Admin";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <AnimatePresence>
        {isLoading ? (
          <motion.div className="min-h-screen flex items-center justify-center">
            Loading...
          </motion.div>
        ) : currentPage === "admin" ? (
          <Admin />
        ) : (
          <div className="min-h-screen p-4">Main App Content Here</div>
        )}
      </AnimatePresence>
    </AuthProvider>
  );
}

export default App;
