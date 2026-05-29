import { Route, Routes, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { ThemeContext } from "./context/ThemeContext.jsx";
import { Header } from "./includes/Header.jsx";
import { Footer } from "./includes/Footer.jsx";
import { AdminRoute } from "./components/AdminRoute";
import { UserRoute } from "./components/UserRoute";

// Pages principales
import { Home } from "./pages/Home.jsx";
import { Login } from "./pages/auth/Login.jsx";
import { Register } from "./pages/auth/Register.jsx";

// Espace Lecteur & Espace Admin Emprunts
import { UserDashboard } from "./pages/user/UserDashboard.jsx";
import { AdminEmpruntIndex } from "./pages/admin/AdminEmpruntIndex.jsx";
import { AdminDashboard } from "./pages/admin/AdminDashboard.jsx";

// Pages d'administration
import { AuteurIndex } from "./pages/auteur/AuteurIndex.jsx";
import { AuteurCreate } from "./pages/auteur/AuteurCreate.jsx";
import { AuteurEdit } from "./pages/auteur/AuteurEdit.jsx";
import { CategorieIndex } from "./pages/categorie/CategorieIndex.jsx";
import { CategorieCreate } from "./pages/categorie/CategorieCreate.jsx";
import { CategorieEdit } from "./pages/categorie/CategorieEdit.jsx";
import LivreIndex from "./pages/livre/LivreIndex.jsx";
import LivreCreate from "./pages/livre/LivreCreate.jsx";
import LivreEdit from "./pages/livre/LivreEdit.jsx";

// Pages de Catégorie Spécifiques
import { ProgrammationPage, LitteraturePage, SciencePage } from "./pages/categorie/CategoryPage.jsx";

function App() {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`d-flex flex-column min-vh-100 ${theme === 'dark' ? 'bg-dark text-white' : 'bg-light text-dark'}`}>
      <Header />
      <div className="container mt-0 pt-4 flex-grow-1">
        <Routes>
          {/* --- ROUTES PUBLIQUES --- */}
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />

          <Route path="/login" element={!user ? <Login /> : <Navigate to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} />} />

          {/* --- PAGES CATÉGORIES SPÉCIFIQUES --- */}
          <Route path="/programmation" element={<ProgrammationPage />} />
          <Route path="/litterature" element={<LitteraturePage />} />
          <Route path="/science" element={<SciencePage />} />

          {/* --- ROUTE LECTEUR (PROTECTION USER) --- */}
          <Route path="/dashboard" element={user?.role === 'ADMIN' ? <Navigate to="/admin/dashboard" /> : <UserRoute><UserDashboard /></UserRoute>} />

          {/* --- ROUTES ADMIN (PROTECTION CENTRALISÉE) --- */}
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          
          {/* Suivi des emprunts */}
          <Route path="/admin/emprunts" element={<AdminRoute><AdminEmpruntIndex /></AdminRoute>} />

          {/* Auteur CRUD */}
          <Route path="/admin/auteur" element={<AdminRoute><AuteurIndex /></AdminRoute>} />
          <Route path="/admin/auteur/create" element={<AdminRoute><AuteurCreate /></AdminRoute>} />
          <Route path="/admin/auteur/edit/:id" element={<AdminRoute><AuteurEdit /></AdminRoute>} />

          {/* Categorie CRUD */}
          <Route path="/admin/categorie" element={<AdminRoute><CategorieIndex /></AdminRoute>} />
          <Route path="/admin/categorie/create" element={<AdminRoute><CategorieCreate /></AdminRoute>} />
          <Route path="/admin/categorie/edit/:id" element={<AdminRoute><CategorieEdit /></AdminRoute>} />

          {/* Livre CRUD */}
          <Route path="/admin/livre" element={<AdminRoute><LivreIndex /></AdminRoute>} />
          <Route path="/admin/livre/create" element={<AdminRoute><LivreCreate /></AdminRoute>} />
          <Route path="/admin/livre/edit/:id" element={<AdminRoute><LivreEdit /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
