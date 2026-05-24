import { Navigate, Route, Routes } from 'react-router-dom';
import { Engine } from './cinematic/Engine';
import { Showcase } from './cinematic/showcase/Showcase';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/demo" replace />} />
      <Route path="/demo" element={<Engine />} />
      <Route path="/showcase" element={<Showcase />} />
      <Route path="*" element={<Navigate to="/demo" replace />} />
    </Routes>
  );
}

export default App;
