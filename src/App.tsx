import { Navigate, Route, Routes } from 'react-router-dom';
import { Engine } from './cinematic/Engine';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/demo" replace />} />
      <Route path="/demo" element={<Engine />} />
      <Route path="*" element={<Navigate to="/demo" replace />} />
    </Routes>
  );
}

export default App;
