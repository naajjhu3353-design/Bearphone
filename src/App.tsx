import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
export const auth = getAuth(app);
export default app;
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth } from "../config/firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth";

interface AuthContextType {
  currentUser: User | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
      throw err;
    }
  };

  const value: AuthContextType = { currentUser, logout };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/authContext";
import { Trash2, Plus, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  createdAt?: Timestamp;
}

interface NewProductState {
  name: string;
  price: string;
}

const Admin: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [newProduct, setNewProduct] = useState<NewProductState>({ name: "", price: "" });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const fetchProducts = async (): Promise<void> => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "products"));
      const data: Product[] = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...(docItem.data() as Omit<Product, "id">),
      }));
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File): Promise<string> => {
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
      if (!apiKey) throw new Error("IMGBB API key not found");

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error?.message || "Upload failed");

      return data.data.url as string;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !selectedImage) {
      alert("Please fill all fields and select an image");
      return;
    }

    setSaving(true);
    try {
      const imageUrl = await uploadImage(selectedImage);
      await addDoc(collection(db, "products"), {
        name: newProduct.name,
        price: Number(newProduct.price),
        imageUrl,
        createdAt: new Date(),
      });

      setNewProduct({ name: "", price: "" });
      setSelectedImage(null);
      setPreview("");
      await fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      await fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Failed to delete product");
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Please log in to access the admin panel</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        <form onSubmit={handleSave} className="mb-8 p-6 bg-white rounded-lg shadow-md space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Add New Product</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              placeholder="Enter product name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
            <input
              type="number"
              placeholder="Enter price"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="w-full p-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 object-cover mt-3 rounded-lg border border-gray-200"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
          >
            {saving || uploading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                {uploading ? "Uploading Image..." : "Saving..."}
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Add Product
              </>
            )}
          </button>
        </form>

        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Products</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
              <span className="ml-2 text-gray-600">Loading products...</span>
            </div>
          ) : products.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No products found. Add your first product above.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-1">{product.name}</h3>
                    <p className="text-blue-600 text-xl font-semibold mb-3">${product.price.toFixed(2)}</p>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "./contexts/authContext";
import Admin from "./pages/Admin";

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div className="min-h-screen flex items-center justify-center">
            Loading...
          </motion.div>
        ) : (
          <Admin />
        )}
      </AnimatePresence>
    </AuthProvider>
  );
};

export default App;