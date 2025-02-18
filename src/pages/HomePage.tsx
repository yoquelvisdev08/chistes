import { useState, useEffect } from 'react'
import { Joke } from '../types'
import JokeCard from '../components/JokeCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { jokeService } from '../services/jokeService'

const HomePage = () => {
  const [jokes, setJokes] = useState<Joke[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadJokes = async () => {
      try {
        const data = await jokeService.getJokes('normal')
        setJokes(data)
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
    <div className="section-normal">
      {/* Emojis flotantes decorativos */}
      <div className="floating-emoji" style={{ top: '10%', left: '5%' }}>😄</div>
      <div className="floating-emoji" style={{ top: '30%', right: '10%' }}>😂</div>
      <div className="floating-emoji" style={{ bottom: '20%', left: '15%' }}>🤣</div>
      
      <h1 className="section-title normal">Chistes Normales</h1>
      <div className="jokes-container">
        {jokes.map((joke) => (
          <JokeCard key={joke.id} joke={joke} />
        ))}
      </div>
    </div>
  )
}

export default HomePage 