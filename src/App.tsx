import Hero from './components/Hero';
import Navbar from './components/Navbar';
import About from './components/About';
import Achievements from './components/Achievements';
import Activities from './components/Activities';
import PlannedEvents from './components/PlannedEvents';
import Join from './components/Join';
import Footer from './components/Footer';
import OpeningAnimation from './components/OpeningAnimation';

function App() {
  return (
    <>
      <OpeningAnimation />
      <div className="bg-wot-dark text-wot-light">
        <Navbar />
        <Hero />
        <About />
        <Achievements />
        <Activities />
        <PlannedEvents />
        <Join />
        <Footer />
      </div>
    </>
  );
}

export default App;