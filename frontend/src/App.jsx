import React, { useState, useEffect } from 'react';
import { useTheme } from './hooks/useTheme';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Analysis } from './pages/Analysis';
import { Listings } from './pages/Listings';
import { Chatbot } from './pages/Chatbot';
import { Roadmap } from './pages/Roadmap';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [activeView, setView] = useState('home');
  const [analysisParams, setAnalysisParams] = useState(null);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeView]);

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <Home setView={setView} />;
      case 'analysis':
        return <Analysis initialParams={analysisParams} />;
      case 'explore':
        return <Listings setView={setView} setParams={setAnalysisParams} />;
      case 'chatbot':
        return <Chatbot />;
      case 'roadmap':
        return <Roadmap />;
      default:
        return <Home setView={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar
        activeView={activeView}
        setView={setView}
        toggleTheme={toggleTheme}
        theme={theme}
      />

      <main>
        {renderView()}
      </main>

      <Footer setView={setView} />
    </div>
  );
}

export default App;
