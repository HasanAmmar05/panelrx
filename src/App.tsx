import { Navigate, Route, Routes } from 'react-router-dom';
import { Engine } from './cinematic/Engine';
import { Landing } from './pages/Landing';
import { ProductShell } from './shell/ProductShell';
import { Dashboard } from './pages/Dashboard';
import { Eligibility } from './pages/Eligibility';
import { Submit } from './pages/Submit';
import { Status } from './pages/Status';
import { Reconcile } from './pages/Reconcile';
import { Aggregate } from './pages/Aggregate';
import { Connectors } from './pages/Connectors';
import { AutoSweep } from './pages/AutoSweep';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/demo" element={<Engine />} />

      {/* Product pages — wrapped in ProductShell */}
      <Route path="/dashboard" element={<ProductShell><Dashboard /></ProductShell>} />
      <Route path="/eligibility" element={<ProductShell><Eligibility /></ProductShell>} />
      <Route path="/submit" element={<ProductShell><Submit /></ProductShell>} />
      <Route path="/status" element={<ProductShell><Status /></ProductShell>} />
      <Route path="/reconcile" element={<ProductShell><Reconcile /></ProductShell>} />
      <Route path="/aggregate" element={<ProductShell><Aggregate /></ProductShell>} />
      <Route path="/settings/connectors" element={<ProductShell><Connectors /></ProductShell>} />
      <Route path="/auto-sweep" element={<ProductShell><AutoSweep /></ProductShell>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
