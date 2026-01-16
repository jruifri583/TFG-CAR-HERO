import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './index.css' // Cambiado a index.css para usar Tailwind

function App() {
  const [count, setCount] = useState(0)
  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
      
      {/* Logos */}
      <div className="flex gap-6 mb-8">
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="w-24 h-24" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="w-24 h-24" alt="React logo" />
        </a>
      </div>

      {/* Título */}
      <h1 className="text-5xl font-bold mb-8">Vite + React + Tailwind</h1>

      {/* Card */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-center max-w-sm w-full">
        <button
          className="px-5 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition-colors mb-4"
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </button>
        <p className="text-gray-300">
          Edit <code className="bg-gray-700 px-1 rounded">src/App.jsx</code> and save to test HMR
        </p>
      </div>

      {/* Footer */}
      <p className="text-gray-400 mt-10 text-center text-sm max-w-xs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
