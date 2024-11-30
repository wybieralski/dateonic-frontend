import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm, RegisterForm } from './components/Auth';
import Dashboard from './components/Dashboard';

function App() {
  // Prosty sposób sprawdzania czy użytkownik jest zalogowany
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  // Komponent chroniący ścieżki wymagające autoryzacji
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Publiczne ścieżki */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Chroniona ścieżka do dashboardu */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Przekierowanie nieznanych ścieżek na dashboard */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;