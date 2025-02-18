import { useState, useEffect } from 'react'
import { Joke } from '../types'
import JokeCard from '../components/JokeCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { jokeService } from '../services/jokeService'

const DarkHumorPage = () => {
  const [jokes, setJokes] = useState<Joke[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadJokes = async () => {
      try {
        const data = await jokeService.getJokes('dark')
        if (data.length === 0) {
          // Chistes de ejemplo si no hay datos en Supabase
          setJokes([
            {
              id: '1',
              content: '¿Por qué el humor negro es como las piernas? Porque no todo el mundo las tiene.',
              type: 'dark',
              createdAt: new Date(),
              reactions: { laugh: 0, sad: 0, puke: 0 }
            },
            {
              id: '2',
              content: '¿Qué hace un leproso tocando la guitarra? Carne picada.',
              type: 'dark',
              createdAt: new Date(),
              reactions: { laugh: 0, sad: 0, puke: 0 }
            },
            {
              id: '3',
              content: '¿Cuál es el colmo de un ciego? Enamorarse a primera vista.',
              type: 'dark',
              createdAt: new Date(),
              reactions: { laugh: 0, sad: 0, puke: 0 }
            }
          ])
        } else {
          setJokes(data)
        }
      } catch (error) {
        console.error('Error al cargar los chistes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadJokes()
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="section-dark">
      {/* Emojis flotantes decorativos */}
      <div className="floating-emoji" style={{ top: '15%', right: '8%' }}>💀</div>
      <div className="floating-emoji" style={{ top: '40%', left: '12%' }}>👻</div>
      <div className="floating-emoji" style={{ bottom: '10%', right: '15%' }}>🖤</div>
      
      <h1 className="section-title dark">Humor Negro</h1>
      <div className="jokes-container">
        {jokes.map((joke) => (
          <JokeCard key={joke.id} joke={joke} />
        ))}
      </div>
    </div>
  )
}

export default DarkHumorPage 