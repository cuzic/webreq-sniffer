import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';

function App() {
  return (
    <div className="min-w-[400px] min-h-[500px] p-6 bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">WebreqSniffer</h1>
      <p className="text-gray-600">Popup placeholder</p>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
