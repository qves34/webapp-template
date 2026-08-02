import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('Načítám odpověď z backendu...')

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('Backend nedostupný (spusť "vercel dev" pro lokální API).'))
  }, [])

  return (
    <section id="center">
      <h1>Webapp template</h1>
      <p>Frontend: React + Vite</p>
      <p>Backend: Vercel serverless funkce (/api)</p>
      <p><strong>{message}</strong></p>
    </section>
  )
}

export default App
