import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import RecuperarContrasena from './pages/RecuperarContrasena';
const SmartApp = lazy(() => import('./pages/SmartApp'));
const OldApp = lazy(() => import('./OldApp'));

export default function App() {
  return (
    <Router>
      <Suspense fallback={<div className="loading-panel" role="status">Preparando tu espacio…</div>}>
      <Routes>
        <Route path="/" element={<Login />} />
	<Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/restablecer-contrasena" element={<RecuperarContrasena />} />
        <Route path="/dashboard/*" element={<SmartApp />} />
        <Route path="/simulador" element={<ProtectedSimulator />} />
      </Routes>
      </Suspense>
    </Router>
  );
}

function ProtectedSimulator() {
  return localStorage.getItem('token') ? <OldApp /> : <Navigate to="/" replace />;
}
