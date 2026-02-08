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
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ currentUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/authContext";
import { Trash2, Plus, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

const Admin: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "products"));
      const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Product) }));
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.success) return data.data.url;
      throw new Error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !selectedImage) {
      alert("Fill all fields");
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
      fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  if (!currentUser) return <p className="text-center p-4">Please log in</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <button onClick={logout} className="mb-4 px-4 py-2 bg-red-500 text-white rounded">
        Logout
      </button>

      <form onSubmit={handleSave} className="mb-6 p-4 bg-white rounded shadow space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <input type="file" accept="image/*" onChange={handleImageSelect} />
        {preview && <img src={preview} className="w-32 h-32 object-cover mt-2 rounded" />}
        <button
          disabled={saving || uploading}
          className="px-4 py-2 bg-blue-500 text-white rounded flex items-center gap-2"
        >
          {saving || uploading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          Save
        </button>
      </form>

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p) => (
            <div key={p.id} className="p-4 bg-white rounded shadow">
              <img src={p.imageUrl} className="w-full h-48 object-cover mb-2 rounded" />
              <h3 className="font-bold">{p.name}</h3>
              <p className="text-blue-600">${p.price}</p>
              <button
                onClick={() => handleDelete(p.id)}
                className="mt-2 px-3 py-1 bg-red-500 text-white rounded flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Admin;
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "./contexts/authContext";
import Admin from "./pages/Admin";

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center"
          >
            Loading...
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Admin />
          </motion.div>
        )}
      </AnimatePresence>
    </AuthProvider>
  );
};

export default App;
