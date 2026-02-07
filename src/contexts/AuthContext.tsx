import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  createUserWithEmailAndPassword,
  type User 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';

interface AdminUser {
  uid: string;
  email: string;
  role: 'super_admin' | 'admin';
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  adminUser: AdminUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registerAdmin: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch admin user data from Firestore
        const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
        if (adminDoc.exists()) {
          setAdminUser(adminDoc.data() as AdminUser);
        }
      } else {
        setAdminUser(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const adminDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
      
      if (!adminDoc.exists()) {
        await signOut(auth);
        throw new Error('Unauthorized access. Not an admin account.');
      }
      
      setAdminUser(adminDoc.data() as AdminUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setAdminUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const registerAdmin = async (email: string, password: string) => {
    try {
      // Check if any admin exists
      const adminsSnapshot = await getDoc(doc(db, 'system', 'admins'));
      const isFirstAdmin = !adminsSnapshot.exists() || !adminsSnapshot.data()?.hasAdmin;

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const adminData: AdminUser = {
        uid: userCredential.user.uid,
        email,
        role: isFirstAdmin ? 'super_admin' : 'admin',
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'admins', userCredential.user.uid), adminData);
      
      if (isFirstAdmin) {
        await setDoc(doc(db, 'system', 'admins'), { hasAdmin: true });
      }

      setAdminUser(adminData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    adminUser,
    isLoading,
    isAdmin: !!adminUser,
    isSuperAdmin: adminUser?.role === 'super_admin',
    login,
    logout,
    registerAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
