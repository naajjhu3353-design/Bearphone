// لاحظ حرف i صغير في البداية
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// تغيير المسار من @/contexts إلى ./contexts
import { useAuth } from './contexts/AuthContext';

// تغيير المسار من @/pages إلى ./pages
import Admin from './pages/Admin';
import Home from './pages/Home';

export default function App() {
// ... باقي الكود كما هو
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/admin"
          element={isAdmin ? <Admin /> : <Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}