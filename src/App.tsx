// Firebase configuration
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
import { createContext, useContext, ReactNode } from "react";

interface AuthContextType {
  currentUser: any;
  login?: () => void;
  logout?: () => void;
}

const AuthContext = createContext<AuthContextType>({ currentUser: null });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // هنا يمكنك ربط Firebase Auth إذا أردت لاحقًا
  const value = { currentUser: null };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
import { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/authContext";
import { Trash2, Upload, Plus, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export default function Admin() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", imageUrl: "" });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData: Product[] = [];
      querySnapshot.forEach((docu) => {
        productsData.push({ id: docu.id, ...(docu.data() as Omit<Product, "id">) });
      });
      setProducts(productsData);
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
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToImgbb = async (file: File): Promise<string> => {
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    if (!apiKey) throw new Error("IMGBB API key not found");

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!data.success) throw new Error("Image upload failed");
    return data.data.url;
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !selectedImage) return setError("Fill all fields");

    try {
      setSaving(true);
      setError("");
      setUploading(true);
      const imageUrl = await uploadImageToImgbb(selectedImage);
      setUploading(false);

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
      await fetchProducts();
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
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      setSuccess("Product deleted!");
      await fetchProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to delete product");
    }
  };

  if (!currentUser)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to access Admin Panel.</p>
      </div>
    );

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      {error && <div className="p-3 bg-red-100 text-red-700 mb-4 rounded">{error}</div>}
      {success && <div className="p-3 bg-green-100 text-green-700 mb-4 rounded">{success}</div>}

      {/* Add Product Form */}
      <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-lg mb-8 shadow-md space-y-4">
        <input
          type="text"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          className="w-full p-2 border rounded"
          disabled={saving}
        />
        <input
          type="number"
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          className="w-full p-2 border rounded"
          disabled={saving}
        />
        <input type="file" accept="image/*" onChange={handleImageSelect} disabled={saving} />
        {imagePreview && <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover mt-2 rounded" />}
        <button
          type="submit"
          disabled={saving || uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
        >
          {saving ? "Saving..." : <><Plus /> Add Product</>}
        </button>
      </form>

      {/* Products List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="border p-4 rounded shadow">
            <img src={p.imageUrl} alt={p.name} className="w-full h-48 object-cover mb-2 rounded" />
            <h3 className="font-bold">{p.name}</h3>
            <p className="text-blue-600 font-semibold">${p.price.toFixed(2)}</p>
            <button
              onClick={() => handleDeleteProduct(p.id)}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        ))}
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