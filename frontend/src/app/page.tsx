export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Welcome to LioArcade</h1>
        <p className="text-xl text-gray-600 mb-8">
          Gamified Learning Platform
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">Quizzes</h2>
            <p className="text-gray-600">Test your knowledge with interactive quizzes</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">Flashcards</h2>
            <p className="text-gray-600">Study efficiently with spaced repetition</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">Mini-Games</h2>
            <p className="text-gray-600">Make learning fun and engaging</p>
          </div>
        </div>
      </div>
    </main>
  )
}

