import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import './App.css';

// Layouts
import AppLayout from './components/layout/AppLayout';
import PublicLayout from './components/layout/PublicLayout';

// Auth
import LoginPage from './pages/auth/LoginPage';

// Dashboard
import DashboardPage from './pages/dashboard/DashboardPage';

// ERP
import EtablissementsPage from './pages/erp/EtablissementsPage';
import ElevesPage from './pages/erp/ElevesPage';
import FamillesPage from './pages/erp/FamillesPage';
import PersonnelPage from './pages/erp/PersonnelPage';
import ClassesPage from './pages/erp/ClassesPage';

// Académique
import EmploiDuTempsPage from './pages/academique/EmploiDuTempsPage';
import AppelPage from './pages/academique/AppelPage';
import NotesPage from './pages/academique/NotesPage';
import CahierTextePage from './pages/academique/CahierTextePage';
import ConseilsClassePage from './pages/academique/ConseilsClassePage';
import CalendrierScolairePage from './pages/academique/CalendrierScolairePage';

// Gestion
import FinancePage from './pages/finance/FinancePage';
import GedPage from './pages/ged/GedPage';
import CommunicationPage from './pages/communication/CommunicationPage';
import AdmissionsPage from './pages/admissions/AdmissionsPage';

// Profil & Paramètres
import ProfilPage from './pages/profils/ProfilPage';
import ParametresPage from './pages/parametres/ParametresPage';

// Tableaux de bord
import TableauxBordPage from './pages/tableauxbord/TableauxBordPage';

// Public
import AccueilPublic from './pages/public/AccueilPublic';
import PreinscriptionPage from './pages/public/PreinscriptionPage';
import NosEtablissementsPage from './pages/public/NosEtablissementsPage';
import ActualitesPage from './pages/public/ActualitesPage';
import ContactPage from './pages/public/ContactPage';
import FaqPage from './pages/public/FaqPage';
import ReinscriptionPage from './pages/public/ReinscriptionPage';
import EtablissementDetailPage from './pages/public/EtablissementDetailPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<AccueilPublic />} />
        <Route path="/preinscription" element={<PreinscriptionPage />} />
        <Route path="/nos-etablissements" element={<NosEtablissementsPage />} />
        <Route path="/nos-etablissements/:id" element={<EtablissementDetailPage />} />
        <Route path="/actualites" element={<ActualitesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/reinscription" element={<ReinscriptionPage />} />
      </Route>

      {/* Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* ERP */}
        <Route path="/erp/etablissements" element={<EtablissementsPage />} />
        <Route path="/erp/eleves" element={<ElevesPage />} />
        <Route path="/erp/familles" element={<FamillesPage />} />
        <Route path="/erp/personnel" element={<PersonnelPage />} />
        <Route path="/erp/classes" element={<ClassesPage />} />

        {/* Académique */}
        <Route path="/academique/emploi-du-temps" element={<EmploiDuTempsPage />} />
        <Route path="/academique/appel" element={<AppelPage />} />
        <Route path="/academique/notes" element={<NotesPage />} />
        <Route path="/academique/cahier-texte" element={<CahierTextePage />} />
        <Route path="/academique/conseils-classe" element={<ConseilsClassePage />} />
        <Route path="/academique/calendrier" element={<CalendrierScolairePage />} />

        {/* Gestion */}
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/ged" element={<GedPage />} />
        <Route path="/communication" element={<CommunicationPage />} />
        <Route path="/admissions" element={<AdmissionsPage />} />

        {/* Profil & Paramètres */}
        <Route path="/profil" element={<ProfilPage />} />
        <Route path="/parametres" element={<ParametresPage />} />

        {/* Tableaux de bord */}
        <Route path="/tableaux-de-bord" element={<TableauxBordPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
