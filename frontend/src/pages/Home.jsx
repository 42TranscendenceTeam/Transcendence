/**
 * Home page component
 * Landing page for the application displaying title, subtitle, and description
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';

const messages = [
  "Find your team. Share ideas. Build something great.",
  "Team up, collaborate, and turn ideas into reality.",
  "Connect. Collaborate. Create.",
  "Great things happen when the right people build together.",
  "From ideas to impact — together.",
  "Join a team, spark ideas, and build what matters."
];

function Home() {
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    // Set random initial message
    const randomIndex = Math.floor(Math.random() * messages.length);
    setCurrentMessage(messages[randomIndex]);

    // Change message every 15 seconds
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * messages.length);
      setCurrentMessage(messages[randomIndex]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex flex-col">
      <div className="pt-8 text-center">
        <h1 className="text-5xl font-bold text-white mb-4">ft_transcendence</h1>
        <p className="text-xl text-white/80 mb-6">Team Task Manager</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start pt-[15%]">
        <p className="text-lg text-white/60 max-w-md mx-auto text-center mb-8">
          {currentMessage}
        </p>
        <Link
          to="/login"
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all duration-200"
        >
          Login
        </Link>
      </div>
      <Footer />
    </div>
  );
}

export default Home;