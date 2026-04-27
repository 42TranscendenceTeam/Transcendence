/**
 * Home page component
 * Landing page for the application displaying title, subtitle, and description
 */

function Home() {
  // Render the landing page with title and project description
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="pt-8 text-center">
        <h1 className="text-5xl font-bold text-white mb-4">ft_transcendence</h1>
        <p className="text-xl text-white/80 mb-6">Team Task Manager</p>
      </div>

      <div className="flex items-center justify-center" style={{ height: "calc(100vh - 200px)" }}>
        <p className="text-lg text-white/60 max-w-md mx-auto text-center">
          Find a team, communicate, collaborate and build together!
        </p>
      </div>
    </div>
  );
}

export default Home;