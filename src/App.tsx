import React from 'react';
import Hero from './components/Hero';
import Navbar from './components/Navbar';
import About from './components/About';
import Achievements from './components/Achievements';
import Activities from './components/Activities';
import Join from './components/Join';
import Footer from './components/Footer';
import OpeningAnimation from './components/OpeningAnimation';

function App() {
  return (
    <div className="bg-wot-dark text-wot-light">
      <OpeningAnimation />
      <Navbar />
      <Hero />
      <About />
      <Achievements />
      <Activities />
      <Join />
      <Footer />
    </div>
  );
}

export default App;