import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { Dashboard } from './pages/Dashboard';
import { PricingPage } from './pages/PricingPage';
import { SuccessPage } from './pages/SuccessPage';
import { Pricing } from './pages/Pricing';
import { Success } from './pages/Success';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/success" element={<Success />} />
          <Route path="/" element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;