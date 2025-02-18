import { useState } from 'react'
import { jokeApiService } from '../services/jokeApiService'
import { Joke } from '../types'
import JokeCard from '../components/JokeCard'
import LoadingSpinner from '../components/LoadingSpinner'

const RandomJokePage = () => {
  const [currentJoke, setCurrentJoke] = useState<Joke | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jokeType, setJokeType] = useState<'normal' | 'dark'>('normal')
  const [history, setHistory] = useState<Joke[]>([])

  const generateJoke = async () => {
    try {
      setLoading(true)
      setError(null)
      const joke = await jokeApiService.getRandomJoke(jokeType)
      setCurrentJoke(joke)
      
      // Solo añadir al historial si no es un chiste repetido
      if (!history.some(h => h.content === joke.content)) {
        setHistory(prev => [joke, ...prev].slice(0, 5))
      }
    } catch (error) {
      setError('Error al generar el chiste. ¡Inténtalo de nuevo!')
      console.error('Error generating joke:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyJokeLink = () => {
    if (currentJoke) {
      const link = `${window.location.origin}/joke/${currentJoke.id}`
      navigator.clipboard.writeText(link)
      alert('Enlace copiado al portapapeles!')
    }
  }

  return (
    <div className="random-joke-page">
      <h1 className="page-title">Generador de Chistes</h1>
      
      <div className="joke-type-selector">
        <button
          className={`type-button ${jokeType === 'normal' ? 'active' : ''}`}
          onClick={() => setJokeType('normal')}
          disabled={loading}
        >
          Chistes Normales
        </button>
        <button
          className={`type-button ${jokeType === 'dark' ? 'active' : ''}`}
          onClick={() => setJokeType('dark')}
          disabled={loading}
        >
          Humor Negro
        </button>
      </div>

      <div className="generator-container">
        <button 
          className="generate-button"
          onClick={generateJoke}
          disabled={loading}
        >
          {loading ? <LoadingSpinner /> : '¡Generar Chiste!'}
        </button>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {currentJoke && (
          <div className="current-joke-container">
            <JokeCard joke={currentJoke} />
            <button 
              className="share-button"
              onClick={copyJokeLink}
            >
              Copiar Enlace 🔗
            </button>
          </div>
        )}

        {history.length > 0 && (
          <div className="history-container">
            <h2>Últimos chistes generados</h2>
            <div className="history-jokes">
              {history.map((joke, index) => (
                <div key={index} className="history-joke">
                  <p>{joke.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RandomJokePage 