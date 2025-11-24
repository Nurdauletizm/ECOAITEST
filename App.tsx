import React from 'react';
import { ObjectDetection } from './components/ObjectDetection';
import { VideoCameraIcon } from '@heroicons/react/24/solid';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="py-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg shadow-lg shadow-emerald-500/20">
              <VideoCameraIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              AI<span className="text-emerald-400">ECO</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <ObjectDetection />
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm">
        <p>Powered by TensorFlow.js • Runs locally in your browser</p>
      </footer>
    </div>
  );
};

export default App;