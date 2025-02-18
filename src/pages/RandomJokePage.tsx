import { useState } from 'react'
import { jokeApiService } from '../services/jokeApiService'
import { Joke } from '../types'
import JokeCard from '../components/JokeCard'
import LoadingSpinner from '../components/LoadingSpinner'

interface GeneratedJoke {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  reactions: {
    laugh: number;
    sad: number;
    puke: number;
  };
}

const RandomJokePage = () => {
  const [generatedJoke, setGeneratedJoke] = useState<GeneratedJoke | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jokeType, setJokeType] = useState<'normal' | 'dark'>('normal')
  const [history, setHistory] = useState<Joke[]>([])

  const handleGenerateJoke = async (type: 'normal' | 'dark') => {
    try {
      setIsLoading(true)
      setError(null)
      const joke = await jokeApiService.generateJoke(type)
      setGeneratedJoke(joke)
      
      // Solo añadir al historial si no es un chiste repetido
      if (!history.some(h => h.content === joke.content)) {
        setHistory(prev => [joke, ...prev].slice(0, 5))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar el chiste')
    } finally {
      setIsLoading(false)
    }
  }

  const copyJokeLink = () => {
    if (generatedJoke) {
      const link = `${window.location.origin}/joke/${generatedJoke.content.split(' ').join('-')}`
      navigator.clipboard.writeText(link)
      alert('Enlace copiado al portapapeles!')
    }
  }

  return (
    <div className="section-generator">
      <h1 className="section-title">Generador de Chistes</h1>
      
      <div className="generator-buttons">
        <button
          onClick={() => handleGenerateJoke('normal')}
          disabled={isLoading}
          className="generate-button normal"
        >
          {isLoading ? 'Generando...' : 'Chistes Normales'}
        </button>
        
        <button
          onClick={() => handleGenerateJoke('dark')}
          disabled={isLoading}
          className="generate-button dark"
        >
          {isLoading ? 'Generando...' : 'Humor Negro'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {generatedJoke && (
        <div className="generated-joke">
          <p className="joke-content">{generatedJoke.content}</p>
          <div className="joke-meta">
            <span className="joke-type">{generatedJoke.type}</span>
            <span className="joke-date">
              {new Date(generatedJoke.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(generatedJoke.content)}
            className="copy-button"
          >
            Copiar Enlace
          </button>
        </div>
      )}

      {history.length > 0 && (
        <div className="history-container">
          <h2>Últimos chistes generados</h2>
          <div className="history-jokes">
            {history.map((joke, index) => (
              <JokeCard 
                key={index} 
                joke={joke} 
                isGenerated={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RandomJokePage 