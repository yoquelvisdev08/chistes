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
    <div className="home-page">
      <h1>Chistes Normales</h1>
      <div className="jokes-container">
        {jokes.map((joke) => (
          <JokeCard key={joke.id} joke={joke} />
        ))}
      </div>
    </div>
  )
}

export default HomePage 