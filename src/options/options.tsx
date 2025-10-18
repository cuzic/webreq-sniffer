import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">WebreqSniffer Options</h1>
      <p className="text-gray-600">Options page placeholder</p>
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
