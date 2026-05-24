import { Navigate, Route, Routes } from 'react-router-dom';
import { Engine } from './cinematic/Engine';
import { Landing } from './pages/Landing';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/demo" element={<Engine />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
